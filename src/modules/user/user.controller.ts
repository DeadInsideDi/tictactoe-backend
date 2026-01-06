import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { Auth } from '../auth/decorators/auth.decorator'
import { CurrentUser } from '../auth/decorators/user.decorator'
import { ChangePasswordDto } from './dto/change-password.dto'
import { UserSearchDto } from './dto/search.dto'
import { UserService } from './user.service'

@ApiTags('Users')
@Controller('user')
export class UserController {
	constructor(private readonly userService: UserService) {}

	@Auth()
	@Get()
	getSelf(@CurrentUser('id') id: string) {
		return this.userService.findOneById(id)
	}

	@Get('search')
	async search(@Query() dto: UserSearchDto) {
		return await this.userService.search(dto)
	}

	@Auth()
	@Get('friends')
	async getFriends(@CurrentUser('id') id: string) {
		return await this.userService.getFriends(id)
	}

	@Get(':id')
	findOneById(@Param('id') id: string) {
		return this.userService.findOneById(id)
	}

	@Auth()
	@Patch('change-name')
	async changeName(@Query('name') name: string, @CurrentUser('id') id: string) {
		return await this.userService.changeName(id, name)
	}

	@Auth()
	@Patch('change-email')
	async changeEmail(
		@Query('email') email: string,
		@CurrentUser('id') id: string,
	) {
		return await this.userService.changeEmail(id, email)
	}

	@Auth()
	@Patch('change-password')
	async changePassword(
		@Body() dto: ChangePasswordDto,
		@CurrentUser('id') id: string,
	) {
		return await this.userService.changePassword(id, dto)
	}

	@Auth()
	@Patch('remove-friend')
	async remove(
		@Query('friendId') friendId: string,
		@CurrentUser('id') id: string,
	) {
		return await this.userService.removeFriend(id, friendId)
	}
}
