import { Injectable, InternalServerErrorException, OnModuleDestroy } from "@nestjs/common";
import { getRequiredEnvVar } from "../common/getRequiredEnvVar.js";
import { Pool } from 'pg'
import { CreateUserRequestDTO, GeneratedAPIKey, User, UserCreatedResponse, UserPreferences } from "../model/user.js";
import { GameStoreResponse } from "../model/gameStore.js";
import { StateMetadata, StateMetadataResponse } from "../model/delta.js";

@Injectable()
export class DatabaseService implements OnModuleDestroy {
    private pool: Pool
    
    constructor(){
        this.pool = new Pool({connectionString: getRequiredEnvVar('DATABASE_URL')})
    }

    async onModuleDestroy() {
        await this.pool.end()
    }

    public async getPreferencesForUser(user: User): Promise<UserPreferences | undefined> {
        const res = await this.pool.query('SELECT * FROM users JOIN user_prefs ON users.id = user_prefs.user_id WHERE user_prefs.user_id = $1', [user.id])
        if(res.rows.length > 0) {
            return {
                stores: res.rows[0].stores,
                categories: res.rows[0].categories
            }
        }
        return undefined
    }

    public async updatePreferencesForUser(user: User, stores: string[], categories: string[]): Promise<UserPreferences | undefined> {
        const query: string = 'INSERT INTO user_prefs (stores, categories, user_id) VALUES ($1, $2, $3) ON CONFLICT (user_id) DO UPDATE SET stores = $1, categories = $2'

        const res = await this.pool.query(query, [JSON.stringify(stores), JSON.stringify(categories), user.id])

        if(res.rowCount === 0 )
            return undefined

        return {
            stores: stores,
            categories: categories
        };
        
    }

    public async getUserWithApiKey(hashedApiKey: string): Promise<User | undefined> {
        const res = await this.pool.query('SELECT users.id, name, email, permissions FROM users JOIN user_keys ON users.id = user_keys.user_id and api_key_hash = $1 WHERE user_keys.active = true', [hashedApiKey])

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

    public async getUserWithId(userId: number): Promise<User | undefined> {
         const res = await this.pool.query('SELECT users.id, name, email, permissions FROM users JOIN user_keys ON users.id = user_keys.user_id and users.id = $1 WHERE user_keys.active = true', [userId])

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

    public async storeStoreStateForUser(user: User, state: GameStoreResponse): Promise <StateMetadata | undefined> {
        const query = 'INSERT INTO user_store_states (user_id, state, date_taken) VALUES ($1, $2, $3) RETURNING *'
        const res = await this.pool.query(query, [user.id, JSON.stringify(state), new Date().toISOString()])
        if (res.rowCount === 1) {
            return { userId: res.rows[0].user_id, stateId: res.rows[0].id, date: res.rows[0].date_taken }
        }

        return undefined
    }

    public async getStoreStateMetadataForUser(user: User): Promise <StateMetadataResponse> {
        const query = 'SELECT id, user_id, date_taken FROM user_store_states WHERE user_id = $1'
        const res = await this.pool.query(query, [user.id])

        const metadata: StateMetadata[] = []
        res.rows.forEach(row => {
            metadata.push({
                userId: row.user_id,
                stateId: row.id,
                date: new Date(row.date_taken)
            })
        })

        return { stateMetadata: metadata }
    }

    public async getStoreStateFromId(id: number, user: User): Promise <GameStoreResponse | undefined> {
        const query = 'SELECT state FROM user_store_states WHERE id = $1 AND user_id = $2'
        const res = await this.pool.query(query, [id, user.id])

        if(res.rows.length === 0) {
            return undefined
        }

        return res.rows[0].state as GameStoreResponse
    }
    
    public async getStoreStateLatestForUser(user: User): Promise<GameStoreResponse | undefined> {
        const query = 'SELECT state FROM user_store_states WHERE user_id = $1 ORDER BY date_taken DESC LIMIT 1'
        const res = await this.pool.query(query, [user.id])


        if(res.rows.length === 0) {
            return undefined    
        }

        return res.rows[0].state as GameStoreResponse

    }

    public async getListOfActivesUsers(): Promise<User[]> {
        const res = await this.pool.query('SELECT * FROM users JOIN user_keys ON users.id = user_keys.user_id WHERE user_keys.active = true')

        return res.rows.map(row => {
            return {
                id: row.id,
                name: row.name,
                email: row.email,
                permissions: row.permissions
            }
        }) as User[]
    }

    public async createNewUser(createUserRequest: CreateUserRequestDTO, apiKey: GeneratedAPIKey): Promise<UserCreatedResponse> {
        const client = await this.pool.connect()
        let userId = 0
        try{
            await client.query('BEGIN')
            const res = await client.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id',
                [createUserRequest.name, createUserRequest.email])
            if (!res.rowCount || res.rowCount === 0){
                throw new InternalServerErrorException('Unable to create user')
            }

            userId = res.rows[0].id
            await client.query('INSERT INTO user_keys (user_id, api_key_hash, permissions, active) VALUES ($1, $2, $3, $4)', 
                [userId, apiKey.hashedKey, JSON.stringify([createUserRequest.permissions]), 'true'])


            await client.query('INSERT INTO user_prefs (stores, categories, user_id) VALUES ($1, $2, $3)', 
                [JSON.stringify(createUserRequest.preferences.stores), JSON.stringify(createUserRequest.preferences.categories), userId])
            await client.query('COMMIT')
        } catch {
            await client.query('ROLLBACK')
            throw new InternalServerErrorException('Unable to create new user')
        } finally {
            await client.release()
        }

        return {
            apiKey: apiKey.key,
            user: {
                id: userId,
                name: createUserRequest.name,
                email: createUserRequest.email,
                permissions: [createUserRequest.permissions]
            }
        }
    }

    public async getUserWithName(name: string): Promise<User | undefined> {
        const res = await this.pool.query('SELECT * FROM users JOIN user_keys ON users.id = user_keys.user_id WHERE name = $1 AND user_keys.active = true', [name])

        if(res.rowCount && res.rowCount > 0) {
            return {
                name: res.rows[0].name,
                email: res.rows[0].email,
                id: res.rows[0].id,
                permissions: res.rows[0].permissions
            }
        }

        return undefined
    }
}

