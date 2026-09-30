import { Injectable } from "@nestjs/common";
import { User } from "../model/user.js";
import { DatabaseService } from "./database.service.js";
import { DeltaService } from "./delta.service.js";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class FetchService {
    constructor(
        private readonly databaseService: DatabaseService,
        private readonly deltaService: DeltaService
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    public async fetchStoreStatesForAllUsers() {
        console.log("Fetching store states for every user")
        const users = await this.databaseService.getListOfActivesUsers()
        await this.processUsersInBatches(users)
        console.log("Fetching store users done")
    }

    private async processUsersInBatches(users: User[], batchSize = 5) {
        for (let i = 0; i < users.length; i += batchSize) {
            const batch = users.slice(i, i + batchSize);

            await Promise.all(
                batch.map(user => this.deltaService.recordCurrentStoreStateForUser(user))
            );
        }
    }
}