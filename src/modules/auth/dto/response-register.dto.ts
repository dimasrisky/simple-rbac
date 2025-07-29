import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ResponseRegisterDto {
  @ApiProperty({ name: 'status', description: '' })
  @Expose()
  status: string;

  @ApiProperty({ name: 'detail', description: '' })
  @Expose()
  detail: string;
}
