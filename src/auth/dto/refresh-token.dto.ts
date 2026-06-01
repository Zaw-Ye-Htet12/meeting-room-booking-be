import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGci...' })
  @IsNotEmpty()
  @IsString()
  refreshToken!: string;
}
