import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "../model/user.js";
import { randomBytes } from 'crypto';
import jsSHA from 'jssha';
import { DatabaseService } from "./database.service.js";
import { getRequiredEnvVar } from "../common/getRequiredEnvVar.js";

@Injectable()
export class AuthService {
    private apiSecret

    constructor(private readonly databaseService: DatabaseService){
        this.apiSecret = getRequiredEnvVar('API_SECRET')
    }
    public generateToken(): string {
        return this.generateApiKey()
    }

    public async verifyToken(token: string): Promise<User | undefined> {
        const hashedKey = this.hashKeyWithSalt(token,this.apiSecret)
        const user = await this.databaseService.getUserWithApiKey(hashedKey)

        if (!user) {
             throw new UnauthorizedException('Invalid API key')
        }

        return user
    }


    private generateApiKey(size: number = 32, format: BufferEncoding = 'base64') {
        const buffer = randomBytes(size);
        return buffer.toString(format);
    }

    private hashKeyWithSalt(key: string, salt: string) {
        const sha = new jsSHA('SHA-512', 'TEXT', { encoding: 'UTF8' });
        sha.update(`${salt}.${key}`)
        return sha.getHash('B64');
    }
}