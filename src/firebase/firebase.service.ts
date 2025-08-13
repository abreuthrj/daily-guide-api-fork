import { Result } from '#/entity/result.entity';
import { ERR_TYPE } from '#/filter/error-types';
import { BadRequestException, Injectable } from '@nestjs/common';
import * as auth from 'firebase-admin/auth';
import * as messaging from 'firebase-admin/messaging';
import { FirebaseNotificationDto } from './dto/firebase-notification.dto';

@Injectable()
export class FirebaseService {
  constructor() {}

  async getIdFromToken(idToken: string): Promise<auth.DecodedIdToken> {
    let decoded: auth.DecodedIdToken;

    try {
      decoded = await auth.getAuth().verifyIdToken(idToken);
    } catch (exception) {
      throw new BadRequestException(ERR_TYPE.ERR_UNREADABLE_FIREBASE_TOKEN);
    }

    return decoded;
  }

  async sendMessage(
    firebaseNotificationDto: FirebaseNotificationDto,
  ): Promise<Result> {
    const result = new Result();

    const fireMessage = messaging.getMessaging();

    const uid = await fireMessage.send({
      token: firebaseNotificationDto.token,
      notification: {
        title: firebaseNotificationDto.title,
        body: firebaseNotificationDto.body,
      },
    });

    result.success = true;
    result.message = uid;
    return result;
  }
}
