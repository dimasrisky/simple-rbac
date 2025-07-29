import { BaseRepository } from './base.repository';
import {
  FindOptionsWhere,
  FindManyOptions,
  FindOptionsOrder,
  QueryFailedError,
  FindOptionsRelations,
  EntityNotFoundError,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { QueryParameterDto } from '../dto/query-parameter.dto';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

import { InternalServerErrorException, Logger } from '@nestjs/common';
import { ConflictException } from './exceptions/templates/conflict.exception';
import { NotFoundException } from './exceptions/templates/not-found.exception';

export abstract class BaseService<
  TEntity extends BaseEntity,
  TCreate,
  TUpdate extends object,
> {
  protected readonly logger = new Logger(BaseService.name);

  constructor(private readonly entitiesRepository: BaseRepository<TEntity>) {}

  protected paramBuilder(
    options?: QueryParameterDto,
  ): FindManyOptions<TEntity> {
    const {
      limit = 10,
      page = 1,
      orderBy = 'id',
      orderDirection = 'ASC',
    } = options || {};

    const order: Record<string, 'ASC' | 'DESC'> = {
      [orderBy || 'createdAt']: orderDirection || 'DESC',
    };

    return {
      take: limit,
      skip: (page - 1) * limit,
      order: order as unknown as FindOptionsOrder<TEntity>,
      ...options,
    };
  }

  protected handleError(error: unknown, action: string): void {
    this.logger.error(error);
    if (error instanceof QueryFailedError && 'code' in error) {
      const pgError = error as QueryFailedError & {
        code: string;
        detail?: string;
      };
      if (pgError.code === '23505') {
        const match = pgError.detail?.match(/\(([^)]+)\)/);
        const field = match ? match[1] : 'unknown field';
        throw new ConflictException(
          'Duplicate value for unique field: ' + field,
          field,
          'duplicateError',
        );
      }
    }

    throw new InternalServerErrorException(
      'Failed to ' +
        action +
        ': ' +
        (error instanceof Error ? error.message : 'Unknown error'),
    );

    // Tangani error lain
  }

  async create(
    createDto: TCreate,
    user?: IJwtPayload,
    excludeIds: string[] = [],
  ): Promise<TEntity> {
    try {
      const record: Record<string, unknown> = {
        ...(createDto as Record<string, unknown>),
      };

      Object.keys(record).forEach((key) => {
        if (key.endsWith('Id') && !excludeIds.includes(key)) {
          const relationName = key.slice(0, -2);
          const relationId = record[key];

          if (
            typeof relationId === 'number' ||
            typeof relationId === 'string'
          ) {
            // Pastikan tipe data aman
            record[relationName] = { id: relationId };
          }
          delete record[key];
        }
      });

      record.createdBy = user?.username;

      const instance: TEntity = this.entitiesRepository.create(
        record as TEntity,
      );
      return await this.entitiesRepository.save(instance);
    } catch (error) {
      this.handleError(error, 'create entity');
      throw error;
    }
  }

  async findAll(options?: FindManyOptions<TEntity>): Promise<TEntity[]> {
    return await this.entitiesRepository.find(options);
  }

  async findAndCount(
    queryParam: QueryParameterDto,
    options: FindManyOptions<TEntity> = {},
  ): Promise<[TEntity[], number]> {
    const queryOptions = Object.keys(options || {}).length
      ? options
      : this.paramBuilder(queryParam);

    return await this.entitiesRepository.findAndCount(queryOptions);
  }

  async findOne(options: FindManyOptions<TEntity>): Promise<TEntity | null> {
    const instance = await this.entitiesRepository.findOne(options);

    return instance;
  }

  async findOneById(
    id: number | string,
    relations: string[] = [],
  ): Promise<TEntity | null> {
    return await this.entitiesRepository.findOne({
      where: { id } as FindOptionsWhere<TEntity>,
      relations,
    });
  }

  async findOneBy(
    options: FindOptionsWhere<TEntity>,
    relations?: FindOptionsRelations<TEntity>,
  ): Promise<TEntity | null> {
    const instance = await this.entitiesRepository.findOne({
      where: options,
      relations: relations,
    });

    return instance;
  }

  async findOneByIdOrFail(
    id: number | string,
    relations: string[] = [],
  ): Promise<TEntity> {
    try {
      const instance = await this.entitiesRepository.findOneOrFail({
        where: { id } as FindOptionsWhere<TEntity>,
        relations,
      });

      return instance;
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException(
          this.entitiesRepository.metadata.name +
            " with Property '" +
            id +
            "' not found",
          'id',
        );
      }
      throw error;
    }
  }

  async findOneByOrFail(
    options: FindOptionsWhere<TEntity>,
    relations?: FindOptionsRelations<TEntity>,
  ): Promise<TEntity> {
    const instance = await this.entitiesRepository.findOne({
      where: options,
      relations: relations,
    });
    if (!instance) {
      throw new NotFoundException(
        this.entitiesRepository.metadata.name +
          ' with Property ' +
          JSON.stringify(options) +
          ' not found',
        Object.keys(options).join(', ') || '',
      );
    }
    return instance;
  }

  async update(
    id: number | string,
    updateDto: TUpdate,
    user?: IJwtPayload,
    excludeIds: string[] = [],
  ): Promise<TEntity> {
    try {
      const entity: TEntity | null = await this.findOneByIdOrFail(id);

      Object.keys(updateDto).forEach((key) => {
        if (key.endsWith('Id') && !excludeIds.includes(key)) {
          const relationName = key.slice(0, -2);
          const relationId = updateDto[key] as TUpdate;

          if (
            typeof relationId === 'number' ||
            typeof relationId === 'string'
          ) {
            // Pastikan tipe data aman
            updateDto[relationName] = { id: relationId };
          }
          delete updateDto[key];
        }
      });

      Object.assign(entity, updateDto);
      entity.deletedBy = user?.username;

      return await this.entitiesRepository.save(entity);
    } catch (error) {
      this.handleError(error, 'create entity');
      throw error;
    }
  }

  async count(options?: FindManyOptions<TEntity>): Promise<number> {
    try {
      const result = await this.entitiesRepository.count(options);
      return result;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async softRemove(id: number | string, user?: IJwtPayload): Promise<TEntity> {
    const entity = await this.findOneByIdOrFail(id);

    entity.deletedBy = user?.username;
    await this.entitiesRepository.save(entity);
    return await this.entitiesRepository.softRemove(entity);
  }

  protected extractChanges(
    oldData: Record<string, any>,
    newData: Record<string, any>,
    excludeKeys: string[] = [],
  ): { oldValue: object; newValue: object } {
    const oldValue: Record<string, unknown> = {};
    const newValue: Record<string, unknown> = {};

    for (const key in newData) {
      if (excludeKeys.includes(key)) continue;

      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        oldValue[key] = oldData[key];
        newValue[key] = newData[key];
      }
    }

    return { oldValue, newValue };
  }

  protected parseOrderBy(
    multipleOrderBy?: string,
  ): Record<string, 'ASC' | 'DESC'> {
    if (!multipleOrderBy) return {};
    const result = {};
    for (const item of multipleOrderBy.split(',')) {
      const [field, direction] = item.split(':');
      if (field && direction) {
        result[field] = direction.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
      }
    }
    return result;
  }
}
