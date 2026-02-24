import { Module } from '@nestjs/common';
import { AttendanceIntentsController } from './attendance-intents.controller';
import { AttendanceIntentsService } from './attendance-intents.service';

@Module({
  controllers: [AttendanceIntentsController],
  providers: [AttendanceIntentsService],
})
export class EventsModule {}
