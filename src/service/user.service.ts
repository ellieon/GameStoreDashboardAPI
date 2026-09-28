import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";

import { DatabaseService } from "./database.service.js";
import { CreateUserRequestDTO, User, UserCreatedResponse, UserPreferences } from "../model/user.js";
import { StoreApiService } from "./storeApi.service.js";
import { AuthService } from "./auth.service.js";

@Injectable()
export class UserService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly storeService: StoreApiService,
        private readonly authService: AuthService
    ) {
    }

    public async updatePreferencesForUser(user: User, stores: string[], categories: string[]): Promise<UserPreferences> {
        await this.validateData(stores, categories)
        const res = await this.databaseService.updatePreferencesForUser(user, stores, categories)
        
        if(!res){
            throw new InternalServerErrorException('User not updated')
        }
        return res
    }

    public async getPreferencesForUser(user: User): Promise<UserPreferences> {
        const res = await this.databaseService.getPreferencesForUser(user);

        if(!res){
            throw new NotFoundException('User not found in preferences database ')
        }

        return res
    }

    public async createUser(createUserRequest: CreateUserRequestDTO): Promise<UserCreatedResponse> {
        const apiKey = this.authService.generateToken();
        const existingUser = await this.databaseService.getUserWithName(createUserRequest.name)
        if(existingUser) throw new BadRequestException('User with name already exists')
        return await this.databaseService.createNewUser(createUserRequest, apiKey)
    }

    private async validateData(stores: string[], categories: string[]){
        const productLines = await this.storeService.getProductLines();

        categories.forEach(catagory => {
            if(!productLines.find((productLine) => {
                return String(productLine.productLineId) === catagory
            })) {
                throw new BadRequestException(`${catagory} is not a valid category`)
            }
        });

        const availableStores = await this.storeService.getStores();

        stores.forEach(store => {
            if(!availableStores.find((availableStore) => {
                return store === availableStore.storeName
            })) {
                throw new BadRequestException(`${store} is not a valid store`)
            }
        });
    }

}