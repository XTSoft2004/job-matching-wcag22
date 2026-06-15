import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '@/modules/users/users.module';
import { UserTokensModule } from '@/modules/user_tokens/user-tokens.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

import { TypeOrmModule } from '@nestjs/typeorm';
import { VerificationCode } from './entities/verification-code.entity';
import { MailService } from '@/common/services/mail.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([VerificationCode]),
    UsersModule,
    UserTokensModule,
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: configService.get<string>('jwt.expiration') as any,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, MailService, JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
