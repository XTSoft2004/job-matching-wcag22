import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateEducationsService } from './candidate-educations.service';
import { CandidateEducationsController } from './candidate-educations.controller';
import { CandidateEducation } from './entities/candidate-education.entity';
import { CandidateProfilesModule } from '../candidate_profiles/candidate-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateEducation]),
    CandidateProfilesModule,
  ],
  controllers: [CandidateEducationsController],
  providers: [CandidateEducationsService],
  exports: [CandidateEducationsService, TypeOrmModule],
})
export class CandidateEducationsModule {}
