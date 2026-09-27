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