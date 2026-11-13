import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Room, RoomType } from './room.entity';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;
  const repo = {
    count: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    existsBy: jest.fn(),
    create: jest.fn((v) => v),
    save: jest.fn((v) => Promise.resolve(v)),
    delete: jest.fn(),
  };
  const dto = { number: '101', type: RoomType.SINGLE, pricePerNight: 50, capacity: 1 };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [RoomsService, { provide: getRepositoryToken(Room), useValue: repo }],
    }).compile();
    service = module.get(RoomsService);
  });

  it('findOne throws NotFoundException when the room does not exist', async () => {
    repo.findOneBy.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('create throws ConflictException on duplicate number', async () => {
    repo.existsBy.mockResolvedValue(true);
    await expect(service.create(dto)).rejects.toBeInstanceOf(ConflictException);
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('create saves a new room', async () => {
    repo.existsBy.mockResolvedValue(false);
    await expect(service.create(dto)).resolves.toMatchObject(dto);
  });

  it('update rejects a number used by another room', async () => {
    repo.findOneBy.mockResolvedValue({ id: 'a', number: '101' });
    repo.existsBy.mockResolvedValue(true);
    await expect(service.update('a', { number: '102' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('remove throws NotFoundException when nothing was deleted', async () => {
    repo.delete.mockResolvedValue({ affected: 0 });
    await expect(service.remove('missing')).rejects.toBeInstanceOf(NotFoundException);
  });

  it('seeds sample rooms only when the table is empty', async () => {
    repo.count.mockResolvedValueOnce(0);
    await service.onApplicationBootstrap();
    expect(repo.save).toHaveBeenCalledTimes(1);

    repo.save.mockClear();
    repo.count.mockResolvedValueOnce(3);
    await service.onApplicationBootstrap();
    expect(repo.save).not.toHaveBeenCalled();
  });
});
