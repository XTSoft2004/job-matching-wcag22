import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CandidateProfilesService } from './candidate-profiles.service';
import { CandidateProfilesController } from './candidate-profiles.controller';
import { CandidateProfile } from './entities/candidate-profile.entity';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([CandidateProfile]), UsersModule],
  controllers: [CandidateProfilesController],
  providers: [CandidateProfilesService],
  exports: [CandidateProfilesService, TypeOrmModule],
})
export class CandidateProfilesModule {}
