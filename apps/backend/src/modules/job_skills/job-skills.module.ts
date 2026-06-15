import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobSkillsService } from './job-skills.service';
import { JobSkillsController } from './job-skills.controller';
import { JobSkill } from './entities/job-skill.entity';
import { JobsModule } from '@/modules/jobs/jobs.module';

@Module({
  imports: [TypeOrmModule.forFeature([JobSkill]), JobsModule],
  controllers: [JobSkillsController],
  providers: [JobSkillsService],
  exports: [JobSkillsService, TypeOrmModule],
})
export class JobSkillsModule {}
