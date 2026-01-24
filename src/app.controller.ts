import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import type { AppService } from './app.service'

@ApiTags('Base Actions')
@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getHello() {
		return this.appService.getHello()
	}
}
