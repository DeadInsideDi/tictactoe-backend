import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!'
	}

	@Cron(CronExpression.EVERY_5_MINUTES)
	handleCron() {
		console.log('Cron triggered! Running every 5 minutes for hosting purposes.')
	}
}
