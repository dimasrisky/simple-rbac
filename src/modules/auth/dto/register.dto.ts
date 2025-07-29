import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ name: 'username', description: '' })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({ name: 'email', description: '' })
  @IsNotEmpty()
  @IsString()
  email: string;

  @ApiProperty({ name: 'password', description: '' })
  @IsNotEmpty()
  @IsString()
  password: string;
}
