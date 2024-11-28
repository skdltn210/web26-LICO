import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entity/user.entity';
import { CategoryEntity } from '../categories/entity/category.entity';
import { LiveEntity } from '../lives/entity/live.entity';

export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const dbType = configService.get<string>('DB_TYPE');
  const dbConfig = configService.get(dbType);

  return {
    type: dbType,
    ...dbConfig,
    entities: [UserEntity, CategoryEntity, LiveEntity],
    synchronize: configService.get<boolean>('DB_SYNCHRONIZE'),
    logging: configService.get<boolean>('DB_LOGGING'),
  };
};
