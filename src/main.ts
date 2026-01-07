import { ValidationPipe } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import cookieParser from 'cookie-parser'
import type { Application } from 'express'
import { AppModule } from './app.module'

async function bootstrap() {
	const PORT = process.env.PORT || 3000
	const app = await NestFactory.create(AppModule)

	const instance = app.getHttpAdapter().getInstance() as Application
	instance.disable('x-powered-by')

	app.setGlobalPrefix('api')
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
		}),
	)
	// process.env.FRONTEND_URL
	app.use(cookieParser())
	app.enableCors({
		origin: '*',
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
		exposedHeaders: ['Set-Cookie'],
	})

	const config = new DocumentBuilder()
		.setTitle('TicTacToe API')
		.setDescription(
			'Website with TicTacToe game, where user can play against computer or against another user.',
		)
		.setVersion('1.0')
		.build()
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('api/docs', app, document)

	await app.listen(PORT, async () => {
		const url = await app.getUrl()
		console.log(`NEST SERVER STARTED AT PORT: ${PORT}, AT HOST: ${url}`)
	})
}

void bootstrap()
