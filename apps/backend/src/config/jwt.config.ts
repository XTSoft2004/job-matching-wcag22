import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  secret: process.env.JWT_SECRET || 'xuantruong2004_jwt_secret_key',
  expiration: process.env.JWT_EXPIRATION || '1h',
  refreshSecret:
    process.env.JWT_REFRESH_SECRET || 'xuantruong2004_jwt_refresh_secret_key',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
}));
