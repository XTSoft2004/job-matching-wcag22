import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateCvsService } from './candidate-cvs.service';
import { CandidateCvsController } from './candidate-cvs.controller';
import { CandidateCv } from './entities/candidate-cv.entity';
import { CandidateProfilesModule } from '../candidate_profiles/candidate-profiles.module';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateCv]), CandidateProfilesModule],
  controllers: [CandidateCvsController],
  providers: [CandidateCvsService],
  exports: [CandidateCvsService, TypeOrmModule],
})
export class CandidateCvsModule {}
