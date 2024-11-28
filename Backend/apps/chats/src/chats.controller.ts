import { Controller, Get } from '@nestjs/common';

@Controller()
export class ChatsController {
  constructor() {}

  @Get()
  healthCheck() {}
}
