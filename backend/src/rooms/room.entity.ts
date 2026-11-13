import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum RoomType {
  SINGLE = 'single',
  DOUBLE = 'double',
  SUITE = 'suite',
}

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied',
  MAINTENANCE = 'maintenance',
}

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 10, unique: true })
  number: string;

  @Column({ type: 'varchar', length: 20 })
  type: RoomType;

  // pg returns numeric as string; the transformer converts it back to number.
  @Column({
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: { to: (v?: number) => v, from: (v: string) => Number(v) },
  })
  pricePerNight: number;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'varchar', length: 20, default: RoomStatus.AVAILABLE })
  status: RoomStatus;

  @Column({ type: 'varchar', length: 300, nullable: true })
  description: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
