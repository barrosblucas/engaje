import { Controller, Get } from '@nestjs/common';
import { PublicPlatformStatsService } from './public-platform-stats.service';

@Controller('public/platform-stats')
export class PublicPlatformStatsController {
  constructor(private readonly publicPlatformStatsService: PublicPlatformStatsService) {}

  @Get()
  getStats() {
    return this.publicPlatformStatsService.getPlatformStats();
  }
}
