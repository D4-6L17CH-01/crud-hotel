import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { Room, RoomStatus, RoomType } from './room.entity';

const SEED_ROOMS: Partial<Room>[] = [
  { number: '101', type: RoomType.SINGLE, pricePerNight: 59.9, capacity: 1, description: 'Cozy single room with city view' },
  { number: '102', type: RoomType.SINGLE, pricePerNight: 64.5, capacity: 1 },
  { number: '201', type: RoomType.DOUBLE, pricePerNight: 99, capacity: 2, description: 'Double room with balcony' },
  { number: '202', type: RoomType.DOUBLE, pricePerNight: 105.5, capacity: 3, status: RoomStatus.OCCUPIED },
  { number: '301', type: RoomType.SUITE, pricePerNight: 220, capacity: 4, description: 'Suite with living area and jacuzzi' },
  { number: '302', type: RoomType.SUITE, pricePerNight: 250, capacity: 5, status: RoomStatus.MAINTENANCE },
];

const UNIQUE_VIOLATION = '23505';

@Injectable()
export class RoomsService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RoomsService.name);

  constructor(
    @InjectRepository(Room) private readonly rooms: Repository<Room>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    if ((await this.rooms.count()) > 0) return;
    await this.rooms.save(this.rooms.create(SEED_ROOMS));
    this.logger.log(`Seeded ${SEED_ROOMS.length} sample rooms`);
  }

  findAll(): Promise<Room[]> {
    return this.rooms.find({ order: { number: 'ASC' } });
  }

  async findOne(id: string): Promise<Room> {
    const room = await this.rooms.findOneBy({ id });
    if (!room) throw new NotFoundException(`Room ${id} not found`);
    return room;
  }

  async create(dto: CreateRoomDto): Promise<Room> {
    await this.assertNumberAvailable(dto.number);
    return this.save(this.rooms.create(dto));
  }

  async update(id: string, dto: UpdateRoomDto): Promise<Room> {
    const room = await this.findOne(id);
    if (dto.number && dto.number !== room.number) {
      await this.assertNumberAvailable(dto.number);
    }
    return this.save(Object.assign(room, dto));
  }

  async remove(id: string): Promise<void> {
    const result = await this.rooms.delete({ id });
    if (!result.affected) throw new NotFoundException(`Room ${id} not found`);
  }

  private async assertNumberAvailable(number: string): Promise<void> {
    if (await this.rooms.existsBy({ number })) {
      throw new ConflictException(`Room number ${number} already exists`);
    }
  }

  // Also maps a unique violation raised by a concurrent request to a 409.
  private async save(room: Room): Promise<Room> {
    try {
      return await this.rooms.save(room);
    } catch (error) {
      if ((error as { code?: string }).code === UNIQUE_VIOLATION) {
        throw new ConflictException(`Room number ${room.number} already exists`);
      }
      throw error;
    }
  }
}
