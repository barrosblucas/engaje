import { Module } from '@nestjs/common';
import { PublicEventsController } from './events/public-events.controller';
import { PublicEventsService } from './events/public-events.service';
import { PublicProgramsController } from './programs/public-programs.controller';
import { PublicProgramsService } from './programs/public-programs.service';

@Module({
  controllers: [PublicEventsController, PublicProgramsController],
  providers: [PublicEventsService, PublicProgramsService],
})
export class PublicModule {}
