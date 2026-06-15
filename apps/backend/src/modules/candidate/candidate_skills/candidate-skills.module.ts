import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateSkillsService } from './candidate-skills.service';
import { CandidateSkillsController } from './candidate-skills.controller';
import { CandidateSkill } from './entities/candidate-skill.entity';
import { CandidateProfilesModule } from '@/modules/candidate/candidate_profiles/candidate-profiles.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CandidateSkill]),
    CandidateProfilesModule,
  ],
  controllers: [CandidateSkillsController],
  providers: [CandidateSkillsService],
  exports: [CandidateSkillsService, TypeOrmModule],
})
export class CandidateSkillsModule {}
