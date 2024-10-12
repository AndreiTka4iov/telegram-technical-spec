import { Body, Controller, Post } from '@nestjs/common';
import { NotionService } from './notion.service';
import { create } from './dto/create';

@Controller('notion')
export class NotionController {
  constructor(private notionService: NotionService) {}

  @Post('create')
  async create(@Body() data: create) {
    return this.notionService.create(data);
  }
}
