import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

import { DatabaseService } from "./database.service.js";
import { User, UserPreferences } from "../model/user.js";
import { StoreApiService } from "./storeApi.service.js";

@Injectable()
export class UserService {
    constructor(private readonly databaseService: DatabaseService,
        private readonly storeService: StoreApiService
    ) {
    }

    public async updatePreferencesForUser(user: User, stores: string[], categories: string[]): Promise<UserPreferences> {
        await this.validateData(stores, categories)
        const res = await this.databaseService.updatePreferencesForUser(user, stores, categories)
        
        if(!res){
            throw new NotFoundException('User not found in preferences database')
        }
        return res
    }

    public async getPreferencesForUser(user: User): Promise <UserPreferences> {
        const res = await this.databaseService.getPreferencesForUser(user);

        if(!res){
            throw new NotFoundException('User not found in preferences database ')
        }

        return res
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