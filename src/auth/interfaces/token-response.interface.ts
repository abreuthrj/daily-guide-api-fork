export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresAt?: number;
}
