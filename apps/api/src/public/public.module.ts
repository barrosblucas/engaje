import { Module } from '@nestjs/common';
import { PublicEventsController } from './events/public-events.controller';
import { PublicEventsService } from './events/public-events.service';

@Module({
  controllers: [PublicEventsController],
  providers: [PublicEventsService],
})
export class PublicModule {}
