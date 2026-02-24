import { Module } from '@nestjs/common';
import { AdminEventsController } from './events/admin-events.controller';
import { AdminEventsService } from './events/admin-events.service';
import { AdminImagesService } from './events/admin-images.service';
import { AdminProgramsController } from './programs/admin-programs.controller';
import { AdminProgramsService } from './programs/admin-programs.service';
import { AdminUploadsController } from './uploads/admin-uploads.controller';
import { AdminUploadsService } from './uploads/admin-uploads.service';

@Module({
  controllers: [AdminEventsController, AdminProgramsController, AdminUploadsController],
  providers: [AdminEventsService, AdminImagesService, AdminProgramsService, AdminUploadsService],
})
export class AdminModule {}
