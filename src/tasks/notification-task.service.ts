import { FirebaseNotificationDto } from '#/firebase/dto/firebase-notification.dto';
import { FirebaseService } from '#/firebase/firebase.service';
import { User } from '#/user/entity/user.entity';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { IsNull, Not } from 'typeorm';

@Injectable()
export class NotificationTask {
  constructor(private readonly firebaseService: FirebaseService) {}

  @Cron('0 0 * * * *', {
    name: 'story_notifications',
  })
  async handle() {
    if (process.env.NODE_TYPE !== 'notification') {
      return;
    }

    const users = await User.find({
      where: {
        notificationTime: Not(IsNull()),
        fcmToken: Not(IsNull()),
      },
    });

    console.log('[DISPATCHING NOTIFICATIONS]', users.length, 'users');

    for (const user of users) {
      const userNotificationHour = new Date(
        user.notificationTime,
      ).getUTCHours();
      const currentHour = new Date().getUTCHours();

      if (currentHour === userNotificationHour) {
        const firebaseNotificationDto = new FirebaseNotificationDto();

        firebaseNotificationDto.token = user.fcmToken;
        firebaseNotificationDto.title = 'Your daily guide is ready';
        firebaseNotificationDto.body = 'Check-out your daily guide';

        this.firebaseService.sendMessage(firebaseNotificationDto);
      }
    }
  }
}
