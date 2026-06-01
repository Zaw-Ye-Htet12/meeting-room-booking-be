import { IsNotEmpty, IsDateString, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ example: 'Conference Room A' })
  @IsNotEmpty()
  @IsString()
  roomName!: string;

  @ApiProperty({ example: '2026-06-01T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  startTime!: string;

  @ApiProperty({ example: '2026-06-01T11:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  endTime!: string;
}
