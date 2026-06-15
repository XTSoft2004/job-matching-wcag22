import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import databaseConfig from './config/database.config';
import jwtConfig from './config/jwt.config';
import mailConfig from './config/mail.config';
import { validationSchema } from './config/validation.schema';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { UsersModule } from './modules/users/users.module';
import { UserTokensModule } from './modules/user_tokens/user-tokens.module';
import { AuthModule } from './modules/authenticator/auth.module';
import { JwtAuthGuard } from './modules/authenticator/guards/jwt-auth.guard';
import { CandidateProfilesModule } from './modules/candidate/candidate_profiles/candidate-profiles.module';
import { CandidateExperiencesModule } from './modules/candidate/candidate_experiences/candidate-experiences.module';
import { CandidateEducationsModule } from './modules/candidate/candidate_educations/candidate-educations.module';
import { CandidateSkillsModule } from './modules/candidate/candidate_skills/candidate-skills.module';
import { CandidateCvsModule } from './modules/candidate/candidate_cvs/candidate-cvs.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { JobSkillsModule } from './modules/job_skills/job-skills.module';
import { ApplicationsModule } from './modules/applications/applications.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, mailConfig],
      validationSchema,
      validationOptions: {
        abortEarly: true,
        allowUnknown: true,
      },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadEntities: true,
        synchronize: configService.get<boolean>('database.synchronize'),
        logging: configService.get<boolean>('database.logging'),
      }),
    }),
    UsersModule,
    UserTokensModule,
    AuthModule,
    CandidateProfilesModule,
    CandidateExperiencesModule,
    CandidateEducationsModule,
    CandidateSkillsModule,
    CandidateCvsModule,
    CompaniesModule,
    JobsModule,
    JobSkillsModule,
    ApplicationsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
