import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, beforeEach, expect, vi } from 'vitest';

import { StoreController } from '../../../src/controller/store.controller.js';
import { StoreApiService } from '../../../src/service/storeApi.service.js';
import { User } from '../../../src/model/user.js';

describe('StoreController', () => {
  let controller: StoreController;

  const mockService = {
    getListOfGamesForUser: vi.fn(),
    getProductLines: vi.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [
        {
          provide: StoreApiService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get(StoreController);
  });

  it('should return games', async () => {
    mockService.getListOfGamesForUser.mockResolvedValue({
      stores: [],
    });

    const user: User = {
      id: 0,
      name: '',
      email: '',
      permissions: []
    }

    const result = await controller.getGames(user);

    expect(result).toEqual({
      stores: [],
    });
  });

  it('should return product lines', async () => {
    mockService.getProductLines.mockResolvedValue([
      {
        productLineId: 1,
      },
    ]);

    const result = await controller.getProductLines([1]);

    expect(result).toEqual(
      {
        productLines: [
          {
            productLineId: 1,
          },
        ]
      },
    );

    expect(mockService.getProductLines).toHaveBeenCalledWith(1);
  });
});