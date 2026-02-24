import { PublicEventsRequestSchema } from '@engaje/contracts';
import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicEventsService } from './public-events.service';

@Controller('public/events')
export class PublicEventsController {
  constructor(private readonly publicEventsService: PublicEventsService) {}

  @Get()
  listEvents(@Query() query: Record<string, string>) {
    const parsed = PublicEventsRequestSchema.parse(query);
    return this.publicEventsService.listPublishedEvents(parsed);
  }

  @Get(':slug')
  getEvent(@Param('slug') slug: string) {
    return this.publicEventsService.getEventBySlug(slug);
  }
}
