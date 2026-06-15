import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';
import { Application } from './entities/application.entity';
import { Job } from '@/modules/jobs/entities/job.entity';
import { UsersModule } from '@/modules/users/users.module';
import { CandidateProfilesModule } from '@/modules/candidate/candidate_profiles/candidate-profiles.module';
import { CandidateCvsModule } from '@/modules/candidate/candidate_cvs/candidate-cvs.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, Job]),
    UsersModule,
    CandidateProfilesModule,
    CandidateCvsModule,
  ],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
