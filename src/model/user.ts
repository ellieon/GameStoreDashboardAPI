import { IsNotEmpty, IsString } from "class-validator"

export type User = {
    id: number,
    name: string,
    email: string,
    permissions: string[]
}

export type UserPreferences = {
    stores: string[],
    categories: string[]
}

export class UserPreferencesRequestDTO {
    @IsString({
        each: true
    })
    @IsNotEmpty()
    stores: string[]

    @IsString({
        each: true
    })
    @IsNotEmpty()
    categories: string[]
}