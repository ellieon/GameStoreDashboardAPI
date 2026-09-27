import { Injectable } from "@nestjs/common";
import { getRequiredEnvVar } from "../common/getRequiredEnvVar.js";
import { Pool } from 'pg'
import { User, UserPreferences } from "../model/user.js";

@Injectable()
export class DatabaseService {

    private pool: Pool
    constructor(){
        this.pool = new Pool({connectionString: getRequiredEnvVar('DATABASE_URL')})
    }

    public async getPreferencesForUser(user: User): Promise<UserPreferences | undefined> {
        const res = await this.pool.query('SELECT * FROM users JOIN user_prefs ON users.id = user_prefs.user_id WHERE user_prefs.user_id = $1', [user.id])
        if(res.rowCount === 1) {
            return {
                stores: res.rows[0].stores,
                categories: res.rows[0].categories
            }
        }
        return undefined
    }

    public async getUserWithApiKey(hashedApiKey: string): Promise<User | undefined> {
        const res = await this.pool.query('SELECT * FROM users JOIN user_keys ON users.id = user_keys.user_id and api_key_hash = $1 WHERE user_keys.active = true', [hashedApiKey])

        if (res.rowCount === 1) {
            return {
                id: res.rows[0].id,
                name: res.rows[0].name,
                email: res.rows[0].email,
                permissions: res.rows[0].permissions
            }
        }

        return undefined
    }
}