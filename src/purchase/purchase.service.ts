import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import appleConfig from '#/config/apple-config';
import { AppleConfig } from '#/config/interfaces/apple-config.interface';
import { Result } from '#/entity/result.entity';
import { ERR_TYPE } from '#/filter/error-types';
import { GoogleDeveloperService } from '#/google/developer/developer.service';
import { User } from '#/user/entity/user.entity';
import { HttpUtil } from '#/utils/http';
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PurchaseDto } from './dto/purchase.dto';
import { Purchase } from './entity/purchase.entity';

@Injectable()
export class PurchaseService {
  private static SUBSCRIPTION_SKUS = ['dailyguide_subscription_default'];
  private readonly httpUtil: HttpUtil;

  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    private readonly googleDeveloperService: GoogleDeveloperService,
    private readonly jwtService: JwtService,
    @Inject(appleConfig.KEY)
    private readonly appleConfig: AppleConfig,
  ) {
    this.httpUtil = new HttpUtil();
    this.httpUtil.setup();
  }

  async get(userSession: UserSession): Promise<Purchase[]> {
    const result = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .leftJoin('purchase.user', 'user')
      .where('user.id = :userId', { userId: userSession.userId })
      .getMany();

    return result;
  }

  async status(userSession: UserSession): Promise<Result> {
    const result = new Result();

    if (userSession.roles.includes(UserRoleEnum.TESTER)) {
      result.success = true;
      return result;
    }

    const purchase = await this.purchaseRepository
      .createQueryBuilder('purchase')
      .where('purchase.expiresAt >= :now', { now: Date.now() })
      .leftJoin('purchase.user', 'user')
      .where('user.id = :userId', { userId: userSession.userId })
      .orderBy('purchase.transactionDate', 'DESC')
      .getOne();

    if (!purchase || !purchase.transactionReceipt) {
      return result;
    }

    try {
      if (userSession.platform === 'ios') {
        const jwt = this.jwtService.sign({
          bid: 'cc.kokedama.dailyguide',
          iat: Date.now() / 1000,
        });
        const response = await this.httpUtil.get(
          `${this.appleConfig.url}/transactions/${purchase.transactionId}`,
          {
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          },
        );
      } else {
        const receipt = JSON.parse(purchase.transactionReceipt);
        result.success = await this.googleDeveloperService.isValidSubscription(
          purchase.productId,
          receipt.purchaseToken,
        );
      }
    } catch (err) {
      result.message = err;
      result.success = false;
    }

    return result;
  }

  async issue(): Promise<Result> {
    const result = new Result();

    const jwt = this.jwtService.sign({
      bid: 'cc.kokedama.dailyguide',
      iat: Date.now() / 1000,
    });

    result.success = true;
    result.message = jwt;

    return result;
  }

  async purchase(
    userSession: UserSession,
    purchaseDto: PurchaseDto,
  ): Promise<Result> {
    if (!PurchaseService.SUBSCRIPTION_SKUS.includes(purchaseDto.productId)) {
      throw new BadRequestException(ERR_TYPE.ERR_PRODUCT_NOT_FOUND);
    }

    const purchase = new Purchase();

    if (
      await this.purchaseRepository.exist({
        where: {
          productId: purchaseDto.productId,
          transactionReceipt: purchaseDto.transactionReceipt,
        },
      })
    ) {
      throw new BadRequestException(ERR_TYPE.ERR_PURCHASE_ALREADY_EXISTS);
    }

    // const [tag, duration, unit] = purchaseDto.productId.split('_');

    const multiplier = {
      years: 365 * 24 * 60 * 60 * 1000,
      months: 30 * 60 * 60 * 1000,
      days: 24 * 60 * 60 * 1000,
      hours: 60 * 60 * 1000,
      minutes: 60 * 1000,
      seconds: 1000,
    };

    purchase.productId = purchaseDto.productId;
    purchase.transactionDate = new Date();
    purchase.transactionReceipt = purchaseDto.transactionReceipt;
    purchase.transactionId = purchaseDto.transactionId;
    purchase.expiresAt = new Date(Date.now() + multiplier.years * 1);
    purchase.user = await User.findOneByOrFail({ id: userSession.userId });

    const result = new Result();

    await this.purchaseRepository.save(purchase);

    result.success = true;

    return result;
  }

  async recover(
    userSession: UserSession,
    purchaseRecoverDto: PurchaseDto,
  ): Promise<Result> {
    const result = new Result();

    const transactionReceipt = purchaseRecoverDto.transactionReceipt;
    const parsedReceipt = JSON.parse(purchaseRecoverDto.transactionReceipt);

    const subscription = await this.googleDeveloperService.getSubscription(
      purchaseRecoverDto.productId,
      parsedReceipt.purchaseToken,
    );

    if (!this.googleDeveloperService.isValid(subscription)) {
      throw new NotFoundException(ERR_TYPE.ERR_PURCHASE_NOT_FOUND);
    }

    let purchase = await this.purchaseRepository.findOne({
      where: { transactionReceipt },
      relations: { user: true },
    });

    if (!purchase) {
      purchase = new Purchase();
      purchase.transactionDate = new Date(
        parseInt(subscription.startTimeMillis),
      );
      purchase.transactionReceipt = transactionReceipt;
      purchase.productId = purchaseRecoverDto.productId;
      purchase.expiresAt = new Date(parseInt(subscription.expiryTimeMillis));
    }

    purchase.user = await User.findOneByOrFail({ id: userSession.userId });

    await this.purchaseRepository.save(purchase);

    result.success = true;

    return result;
  }

  async subscriptionSkus(): Promise<string[]> {
    return PurchaseService.SUBSCRIPTION_SKUS;
  }
}
