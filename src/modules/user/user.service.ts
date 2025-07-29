import { Injectable } from '@nestjs/common';
import { BaseService } from 'src/common/bases/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService extends BaseService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }
}
