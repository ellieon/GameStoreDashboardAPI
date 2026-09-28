import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { DatabaseService } from '../../../src/service/database.service.js';
import { UnauthorizedException } from '@nestjs/common';
import { User } from '../../../src/model/user.js';
import { AuthService } from '../../../src/service/auth.service.js';

vi.mock('axios');

describe('AuthService', () => {
    let service: AuthService ;
    const exampleUser: User = {
        id: 0,
        name: '',
        email: '',
        permissions: []
    }

    const mockDatabaseService = {
        getUserWithApiKey: vi.fn(),
    };


    beforeEach(async () => {
        vi.clearAllMocks();
        process.env.API_SECRET = 'SECRET';

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: DatabaseService,
                    useValue: mockDatabaseService,
                },

            ],
        }).compile();

        service = module.get(AuthService);
    });

    describe('verifyToken', async () => {
        it('Should return the found user if the API key matches a user record', async() =>{
            mockDatabaseService.getUserWithApiKey.mockResolvedValue(exampleUser)
            const response = await service.verifyToken('TOKEN')
            expect(mockDatabaseService.getUserWithApiKey).toHaveBeenCalledWith('CYwlkVPCPH2r47UXFpfUREo9ll9HmA6AXxSos+AeLQNSdT6P+QiG/mQtVVjEqqkniBVM0aE1F1kpriwsu8iXyA==')
            expect(response).toBe(exampleUser)
        })

        it('Should throw an UnauthorisedException if the API key does not match a user record', async () => {
            mockDatabaseService.getUserWithApiKey.mockResolvedValue(undefined)
            await expect(service.verifyToken('TOKEN')).rejects.toThrow(UnauthorizedException)
            expect(mockDatabaseService.getUserWithApiKey).toHaveBeenCalledWith('CYwlkVPCPH2r47UXFpfUREo9ll9HmA6AXxSos+AeLQNSdT6P+QiG/mQtVVjEqqkniBVM0aE1F1kpriwsu8iXyA==')

        })
    })

    describe('generateToken', async () => {
        it('should generate a key when called', async () => {
            expect(service.generateToken().length).toBeGreaterThan(0)
        })
    })
});