import { Controller, Get } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Base Actions')
@Controller()
export class AppController {
	@Get()
	getHello() {
		return 'Hello World!'
	}
}
