import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateExperiencesService } from './candidate-experiences.service';
import { CandidateExperiencesController } from './candidate-experiences.controller';
import { CandidateExperience } from './entities/candidate-experience.entity';
import { CandidateProfilesModule } from '../candidate_profiles/candidate-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateExperience]),
    CandidateProfilesModule,
  ],
  controllers: [CandidateExperiencesController],
  providers: [CandidateExperiencesService],
  exports: [CandidateExperiencesService, TypeOrmModule],
})
export class CandidateExperiencesModule {}
