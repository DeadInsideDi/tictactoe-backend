import { User } from '@prisma/client'
import { Request } from 'express'

export type UserResponse = Omit<User, 'password' | 'email'>

export type RequestWithUserResponse = Request & { user: UserResponse }
