import { HttpUtil } from '#/utils/http';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as google from 'googleapis';
import { SubscriptionReceipt } from './interface/subscription-receipt.interface';

@Injectable()
export class GoogleDeveloperService {
  private readonly httpUtil: HttpUtil;
  private readonly JWTClient: google.Auth.JWT;

  constructor() {
    const googleCredentials = JSON.parse(
      fs.readFileSync('private/daily-guide-api-b34372b73103.json').toString(),
    );

    this.JWTClient = new google.Auth.JWT(
      googleCredentials.client_email,
      null,
      googleCredentials.private_key,
      ['https://www.googleapis.com/auth/androidpublisher'],
    );

    this.httpUtil = new HttpUtil();
    this.httpUtil.setup('https://androidpublisher.googleapis.com');
    this.httpUtil.interceptors.request.use(async (request) => {
      const tokenResponse = await this.JWTClient.getAccessToken();

      request.headers['Authorization'] = `Bearer ${tokenResponse.token}`;

      return request;
    });
  }

  async isValidSubscription(
    subscriptionId: string,
    token: string,
  ): Promise<boolean> {
    const subscription = await this.httpUtil.get<SubscriptionReceipt>(
      `/androidpublisher/v3/applications/cc.kokedama.dailyguide/purchases/subscriptions/${subscriptionId}/tokens/${token}`,
    );

    return this.isValid(subscription.data);
  }

  async getSubscription(
    subscriptionId: string,
    token: string,
  ): Promise<SubscriptionReceipt> {
    const subscription = await this.httpUtil.get<SubscriptionReceipt>(
      `/androidpublisher/v3/applications/cc.kokedama.dailyguide/purchases/subscriptions/${subscriptionId}/tokens/${token}`,
    );

    return subscription.data;
  }

  isValid(subscription: SubscriptionReceipt): boolean {
    if (!subscription) {
      return false;
    }

    if (subscription.cancelReason != null) {
      return false;
    }

    if (
      new Date().getTime() >= new Date(subscription.expiryTimeMillis).getTime()
    ) {
      return false;
    }

    return true;
  }
}
