import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';
import { User } from '../../src/model/user.js';
import { UserController } from '../../src/controller/user.controller.js';
import { UserService } from '../../src/service/user.service.js';

describe('UserController', () => {
  let controller: UserController;

  const mockService = {
    updatePreferencesForUser: vi.fn(),
    getPreferencesForUser: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(UserController);
  });

  it('should return user preferences', async () => {
    mockService.getPreferencesForUser.mockResolvedValue({
      stores: [], categories: [],
    });

    const user: User = {
      id: 0,
      name: '',
      email: '',
      permissions: []
    }

    const req: any = {
      user: user
    }

    const result = await controller.putPreferencesForCurrentUser(user);

    expect(result).toEqual({
      stores: [],
      categories: [],
    });
  });

  it('should return user preferences after requesting an update', async () => {
    mockService.updatePreferencesForUser.mockResolvedValue({
      stores: [], categories: [],
    });

    const user: User = {
      id: 0,
      name: '',
      email: '',
      permissions: []
    }

    const result = await controller.updatePreferencesForCurrentUser(user, {stores:[], categories:[]});

    expect(result).toEqual({
      stores: [],
      categories: [],
    });
  });
});