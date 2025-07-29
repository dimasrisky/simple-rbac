import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseLoginDto {
  @ApiProperty({
    name: 'accessToken',
    description: 'Token Akses pengguna',
    example: '',
  })
  @Expose()
  accessToken: string;
}
