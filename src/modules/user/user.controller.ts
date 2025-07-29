import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { Request as ExpressRequest } from 'express';
import { BaseSuccessResponse } from 'src/common/bases/base.response';
import { PathParameterDto } from 'src/common/dto/path-paramater.dto';
import {
  CreateSwaggerExample,
  DeleteSwaggerExample,
  DetailSwaggerExample,
  ListSwaggerExample,
} from 'src/common/swagger/swagger-example.response';
import { CreateUserDto } from './dto/create-user.dto';
import { FilteringUserDto } from './dto/filtering-user.dto';
import { ResponseUserDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserService } from './user.service';
import { JwtGuard } from '../auth/jwt.guard';
import { Role } from 'src/common/decorators/role.decorator';
import { RoleGuard } from 'src/common/guard/role.guard';

@Controller('user')
@ApiTags('User')
@ApiBearerAuth()
@UseGuards(JwtGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @UseGuards(RoleGuard)
  @Role('admin')
  @CreateSwaggerExample(
    CreateUserDto,
    ResponseUserDto,
    false,
    'Membuat Satu User',
  )
  async create(
    @Body() createDto: CreateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<BaseSuccessResponse<ResponseUserDto>> {
    const result = await this.userService.create(createDto, req.user);

    return {
      data: plainToInstance(ResponseUserDto, result, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Get()
  @UseGuards(RoleGuard)
  @Role('admin')
  @ListSwaggerExample(ResponseUserDto, 'Mengambil Banyak Data User')
  async findAndCount(
    @Query() queryParameterDto: FilteringUserDto,
  ): Promise<BaseSuccessResponse<ResponseUserDto>> {
    const { page = 1, limit = 10 } = queryParameterDto;
    const [result, total] =
      await this.userService.findAndCount(queryParameterDto);

    return {
      data: plainToInstance(ResponseUserDto, result, {
        excludeExtraneousValues: true,
      }),
      meta: {
        page: page,
        totalData: total,
        totalPage: Math.ceil(total / limit),
      },
    };
  }

  @Get(':id')
  @UseGuards(RoleGuard)
  @Role('user')
  @DetailSwaggerExample(ResponseUserDto, 'Mengambil Data User dengan ID')
  async findOne(
    @Param() pathParamater: PathParameterDto,
  ): Promise<BaseSuccessResponse<ResponseUserDto>> {
    const result = await this.userService.findOneByIdOrFail(pathParamater.id);

    return {
      data: plainToInstance(ResponseUserDto, result, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Patch(':id')
  @UseGuards(RoleGuard)
  @Role('admin')
  @DetailSwaggerExample(ResponseUserDto, 'Mengupdate Data User By Id')
  async update(
    @Param() pathParamater: PathParameterDto,
    @Body() update: UpdateUserDto,
    @Request() req: ExpressRequest,
  ): Promise<BaseSuccessResponse<ResponseUserDto>> {
    const result = await this.userService.update(
      pathParamater.id,
      update,
      req.user,
    );

    return {
      data: plainToInstance(ResponseUserDto, result, {
        excludeExtraneousValues: true,
      }),
    };
  }

  @Delete(':id')
  @UseGuards(RoleGuard)
  @Role('admin')
  @HttpCode(204)
  @DeleteSwaggerExample('Menghapus Data User dengan Id')
  async remove(
    @Param() pathParamater: PathParameterDto,
    @Request() req: ExpressRequest,
  ): Promise<void> {
    await this.userService.softRemove(pathParamater.id, req.user);
  }
}
