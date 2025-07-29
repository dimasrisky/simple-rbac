import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from './pagination.dto';

export class QueryParameterDto extends PaginationDto {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  orderBy?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
  orderDirection?: 'ASC' | 'DESC';

  @IsString()
  @IsOptional()
  @ApiPropertyOptional()
  search?: string;
}
