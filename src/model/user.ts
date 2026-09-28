import { ArrayNotEmpty, IsArray, IsString } from "class-validator"

export class User  {
    id: number
    name: string
    email: string
    permissions: Role[]
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