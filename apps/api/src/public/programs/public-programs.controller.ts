import { Controller, Get, Param, Query } from '@nestjs/common';
import { PublicProgramsRequestSchemaLocal } from '../../shared/super-admin.schemas';
import { PublicProgramsService } from './public-programs.service';

@Controller('public/programs')
export class PublicProgramsController {
  constructor(private readonly publicProgramsService: PublicProgramsService) {}

  @Get()
  listPrograms(@Query() query: Record<string, string>) {
    const parsed = PublicProgramsRequestSchemaLocal.parse(query);
    return this.publicProgramsService.listPublishedPrograms(parsed);
  }

  @Get(':slug')
  getProgram(@Param('slug') slug: string) {
    return this.publicProgramsService.getProgramBySlug(slug);
  }
}
