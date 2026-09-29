import { Type } from "class-transformer"
import { ArrayNotEmpty, IsArray, IsEmail, IsEnum, IsNotEmpty, IsNotEmptyObject, IsString, ValidateNested } from "class-validator"

export class User {
    id: number
    name: string
    email: string
    permissions: Role[]
}

export type UserCreatedResponse = {
    user: User
    apiKey: string
}

export type UserPreferences = {
    stores: string[],
    categories: string[]
}

export class UserPreferencesRequestDTO {
    @IsArray()
    @ArrayNotEmpty()
    @IsString({
        each: true
    })
    stores: string[]

    @IsArray()
    @ArrayNotEmpty()
    @IsString({
        each: true
    })
    categories: string[]
}

export enum Role {
    Admin = 'admin',
    User = 'user'
}

export class CreateUserRequestDTO {

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string

    @ValidateNested()
    @Type(() => UserPreferencesRequestDTO)
    @IsNotEmptyObject()
    preferences: UserPreferencesRequestDTO

    @IsNotEmpty()
    @IsEnum(Role)
    permissions: Role
}



export type GeneratedAPIKey = {
    key: string,
    hashedKey: string
}