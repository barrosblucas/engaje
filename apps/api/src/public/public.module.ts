import { Module } from '@nestjs/common';
import { PublicEventsController } from './events/public-events.controller';
import { PublicEventsService } from './events/public-events.service';
import { PublicPlatformStatsController } from './platform-stats/public-platform-stats.controller';
import { PublicPlatformStatsService } from './platform-stats/public-platform-stats.service';
import { PublicProgramsController } from './programs/public-programs.controller';
import { PublicProgramsService } from './programs/public-programs.service';

@Module({
  controllers: [PublicEventsController, PublicProgramsController, PublicPlatformStatsController],
  providers: [PublicEventsService, PublicProgramsService, PublicPlatformStatsService],
})
export class PublicModule {}
