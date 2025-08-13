export interface SubscriptionReceipt {
  startTimeMillis: string;
  expiryTimeMillis: string;
  autoRenewing: boolean;
  priceCurrencyCode: string;
  priceAmountMicros: string;
  countryCode: string;
  developerPayload: string;
  paymentState: number;
  cancelReason: number;
  userCancellationTimeMillis: string;
  orderId: string;
  purchaseType: number;
  acknowledgementState: number;
  kind: string;
}
