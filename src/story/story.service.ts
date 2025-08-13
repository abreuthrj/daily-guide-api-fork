import { AstroService } from '#/astro/astro.service';
import { PlanetEnum, ZodiacEnum } from '#/astro/interfaces/horoscope.interface';
import { DynamoDBService } from '#/aws/dynamodb/dynamodb.service';
import { StoryCategory } from '#/aws/dynamodb/entity/story-category.entity';
import { UserRoleEnum } from '#/aws/dynamodb/entity/user-role.entity';
import { UserSession } from '#/aws/dynamodb/entity/user-session.entity';
import { Result } from '#/entity/result.entity';
import { ERR_TYPE } from '#/filter/error-types';
import { OpenaiService } from '#/openai/openai.service';
import { PurchaseService } from '#/purchase/purchase.service';
import { User } from '#/user/entity/user.entity';
import { UserService } from '#/user/user.service';
import { removeAccent, removeQuotes } from '#/utils/string';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as moment from 'moment';
import { DataSource } from 'typeorm';
import { FeedbackDto } from './dto/feedback.dto';
import { Feedback } from './entity/feedback.entity';
import { StoryResponse } from './entity/story-response';
import { Story } from './entity/story.entity';

@Injectable()
export class StoryService {
  constructor(
    private readonly openaiService: OpenaiService,
    private readonly userService: UserService,
    private readonly purchaseService: PurchaseService,
    private readonly astroService: AstroService,
    private readonly dataSource: DataSource,
    private readonly dynamoDBService: DynamoDBService,
  ) {}

  async sequences(): Promise<StoryCategory[]> {
    let storyCategories = await this.dynamoDBService.scan<StoryCategory>(
      StoryCategory.TableName,
    );

    storyCategories = storyCategories.map((storyCategoryObj) => {
      const storyCategory = new StoryCategory();
      storyCategory.id = storyCategoryObj.id;
      storyCategory.contentPrompt = storyCategoryObj.contentPrompt;
      storyCategory.image = storyCategoryObj.image;
      storyCategory.order = storyCategoryObj.order;
      storyCategory.template = storyCategoryObj.template;
      storyCategory.title = storyCategoryObj.title;
      storyCategory.type = storyCategoryObj.type;
      return storyCategory;
    });
    storyCategories.sort((a, b) => a.order - b.order);

    return storyCategories;
  }

  async getById(id: string): Promise<StoryCategory> {
    const [storyCategory] = await this.dynamoDBService.query<StoryCategory>(
      StoryCategory.TableName,
      { id },
    );

    return storyCategory;
  }

  async open(
    userSession: UserSession,
    storyCategoryId: string,
  ): Promise<StoryResponse> {
    const user = await User.findOneBy({
      id: userSession.userId,
    });

    if (!user) {
      throw new UnauthorizedException(ERR_TYPE.ERR_USER_NOT_FOUND);
    }

    const today = moment().utc(false).format('YYYY-MM-DD');

    let story = await Story.createQueryBuilder('story')
      .where('story.storyCategoryId = :storyCategoryId', { storyCategoryId })
      .leftJoinAndSelect('story.feedback', 'feedback')
      .innerJoin('story.user', 'user', 'user.id = :userId', { userId: user.id })
      .andWhere('DATE(story.createdAt) = :today', { today })
      .getOne();

    const storyCategory = await this.getById(storyCategoryId);

    if (story) {
      const storyResponse = new StoryResponse();
      storyResponse.canReload = userSession.roles.includes(UserRoleEnum.TESTER);
      storyResponse.id = story.id;
      storyResponse.title = story.title;
      storyResponse.content = story.content;
      storyResponse.image = storyCategory.image;
      storyResponse.feedback = story.feedback;

      return storyResponse;
    }

    if (!(await this.purchaseService.status(userSession)).success) {
      if (user.nextRetrieve.getTime() >= Date.now()) {
        throw new ForbiddenException(ERR_TYPE.ERR_STORY_LIMIT);
      }
    }

    story = await this.generateStory(user, storyCategory);
    story = await story.save();

    const storyResponse = new StoryResponse();
    storyResponse.id = story.id;
    storyResponse.title = story.title;
    storyResponse.content = story.content;
    storyResponse.image = storyCategory.image;
    storyResponse.canReload = userSession.roles.includes(UserRoleEnum.TESTER);

    return storyResponse;
  }

  async all(userSession: UserSession): Promise<Story[]> {
    const result = await Story.find({
      where: {
        user: {
          id: userSession.userId,
        },
      },
      loadRelationIds: {
        relations: ['storyCategory'],
      },
    });

    return result;
  }

  async delete(userSession: UserSession): Promise<Result> {
    const result = new Result();
    result.success = false;

    try {
      const user = await User.findOneBy({
        id: userSession.userId,
      });

      user.nextRetrieve = new Date();

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      await queryRunner.manager.save(user);
      await queryRunner.manager
        .createQueryBuilder(Story, 'story')
        .innerJoin('story.user', 'user')
        .andWhere('user.id = :userId', { userId: user.id })
        .delete()
        .execute();

      await queryRunner.commitTransaction();

      result.success = true;
    } catch (err) {
      result.message = err;
    }

    return result;
  }

  async getPromptParams(user: User, prompt: string) {
    const params: Record<string, any> = {
      $name: user.displayName,
      $language: user.language,
    };

    params.$sign = this.userService.getSign(user);

    params.$ascendant = user.planets.find(
      (p) => p.name === PlanetEnum.ASCENDANT,
    )?.sign;

    if (prompt.includes('$sun_sign_prediction')) {
      const solar = await this.astroService.horoscopeForUser(
        user,
        params.$sign as ZodiacEnum,
      );

      const keys = prompt.match(/($sun_sign_prediction)/);

      params.$solar_horoscope =
        (
          await this.astroService.horoscopeForUser(
            user,
            params.$sign as ZodiacEnum,
          )
        )?.prediction?.personal_life || '';
    }

    if (prompt.includes('$ascendant_horoscope')) {
      params.$ascendant_horoscope =
        (
          await this.astroService.horoscopeForUser(
            user,
            params.$ascendant as ZodiacEnum,
          )
        )?.prediction?.personal_life || '';
    }

    if (prompt.includes('$numerology')) {
      params.$numerology = this.astroService.getNumerology(
        new Date(user.birthdate),
      );
    }

    return params;
  }

  extractResultParams(result: string): Record<string, string> {
    const matcher = /#[^:]+:/g;

    const lines = result.split('\n');

    const pairs = {};

    lines.forEach((line) => {
      const rawKey = line.match(matcher)?.[0];

      if (!rawKey) {
        return;
      }

      const rawValue = line.replace(rawKey, '');

      const key = removeAccent(rawKey.replace(/#|:/g, '').trim()).toLowerCase();
      const value = removeQuotes(rawValue.trim());

      if (key && value) {
        pairs[key] = value;
      }
    });

    return pairs;
  }

  postprocess(template: string, result: string) {
    const resultParams = this.extractResultParams(result);
    let final = template;

    for (const [key, value] of Object.entries(resultParams)) {
      final = final.replace(`$${key}`, value);
    }

    return final;
  }

  prepare(prompt: string, params: any) {
    for (const key in params) {
      prompt = prompt.replace(key, params[key]);
    }

    return prompt;
  }

  async reload(
    userSession: UserSession,
    storyCategoryId: string,
  ): Promise<StoryResponse> {
    const user = await User.findOneBy({ id: userSession.userId });

    if (!user) {
      throw new UnauthorizedException(ERR_TYPE.ERR_USER_NOT_FOUND);
    }

    const today = moment().utc(false).format('YYYY-MM-DD');

    let story = await Story.createQueryBuilder('story')
      .where('story.storyCategoryId = :storyCategoryId', { storyCategoryId })
      .innerJoin('story.user', 'user', 'user.id = :userId', { userId: user.id })
      .andWhere('DATE(story.createdAt) = :today', { today })
      .getOne();

    const storyCategory = await this.getById(storyCategoryId);

    if (!story) {
      story = new Story();
    }

    const newStory = await this.generateStory(user, storyCategory);

    story.title = newStory.title;
    story.metadata = newStory.metadata;
    story.content = newStory.content;
    story.user = newStory.user;
    story.storyCategoryId = storyCategory.id;

    story = await story.save();

    const storyResponse = new StoryResponse();
    storyResponse.title = story.title;
    storyResponse.content = story.content;
    storyResponse.image = storyCategory.image;
    storyResponse.canReload = userSession.roles.includes(UserRoleEnum.TESTER);

    return storyResponse;
  }

  async feedback(
    userSession: UserSession,
    storyId: string,
    feedbackDto: FeedbackDto,
  ): Promise<Result> {
    const result = new Result();

    try {
      let story = await Story.findOne({
        relations: { feedback: true },
        where: { id: storyId },
      });

      let feedback = story.feedback;

      if (!feedback) {
        feedback = new Feedback();
        feedback.user = await User.findOneBy({ id: userSession.userId });
      }

      feedback.type = feedbackDto.type;
      feedback.description = feedbackDto.description;

      await feedback.save();

      if (!story.feedback) {
        story.feedback = feedback;
        await story.save();
      }

      result.success = true;
    } catch (err) {
      result.success = false;
      result.message =
        err.getMessage?.() || err.toString?.() || JSON.stringify(err);
    }

    return result;
  }

  private async generateStory(
    user: User,
    storyCategory: StoryCategory,
  ): Promise<Story> {
    let story = new Story();
    story.createdAt = new Date();
    story.updatedAt = new Date();

    const promptParams = await this.getPromptParams(
      user,
      storyCategory.contentPrompt,
    );
    const prompt = this.prepare(storyCategory.contentPrompt, promptParams);

    const [content] = await this.openaiService.prompt(user.id, prompt);

    story.title = storyCategory.title;
    story.metadata = JSON.stringify(this.extractResultParams(content));
    story.content = this.postprocess(storyCategory.template, content);
    this.validateContent(story.content);
    story.user = user;
    story.storyCategoryId = storyCategory.id;

    user.nextRetrieve = new Date(
      new Date().setUTCHours(24 - (user.utcOffset ?? 0), 0, 0),
    );
    await user.save();

    return story;
  }

  private validateContent(content: string) {
    if (/\$[a-zA-Z0-9]+/g.test(content)) {
      throw new BadRequestException(ERR_TYPE.ERR_INCOMPLETE_STORY);
    }
  }
}
