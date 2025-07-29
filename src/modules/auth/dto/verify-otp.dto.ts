import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyOtpDto {
  @ApiProperty({ name: 'email', description: '' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ name: 'otp', description: '' })
  @IsString()
  @IsNotEmpty()
  otp: string;
}
