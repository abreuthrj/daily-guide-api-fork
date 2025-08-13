export interface JwtPayload {
  sub: string;
  name: string;
  iat?: number;
  token?: string;
}
