import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { RoomStatus, RoomType } from '../room.entity';

export class CreateRoomDto {
  @IsString()
  @Length(1, 10)
  number: string;

  @IsEnum(RoomType)
  type: RoomType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  pricePerNight: number;

  @IsInt()
  @Min(1)
  @Max(10)
  capacity: number;

  @IsOptional()
  @IsEnum(RoomStatus)
  status?: RoomStatus;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;
}
