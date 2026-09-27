import { Injectable } from "@nestjs/common";

@Injectable()
export class DatabaseService {

    public getCategoriesForUser(): string[] {
        return ['67', '70']// '59', '61', '62', '80', '65', '18', '73'] //60
    }

    public getStoresForUser(): string[] {
        return ['Solihull', 'Acocks Green'] 
    }
}