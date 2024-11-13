import { Injectable } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { LiveEntity } from '../lives/entity/live.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(LiveEntity)
    private livesRepository: Repository<LiveEntity>,

    @InjectDataSource()
    private connection: DataSource,
  ) {}

  async findByOAuthUid(oauthUid: string, oauthPlatform: 'naver' | 'github' | 'google'): Promise<UserEntity | null> {
    // undefined 대신 null 사용
    return this.usersRepository.findOne({
      where: { oauthUid, oauthPlatform },
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    // undefined 대신 null 사용
    return this.usersRepository.findOne({ where: { id } });
  }

  async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.connection.transaction(async manager => {
      const live = manager.create(LiveEntity, {
        categoriesId: null,
        channelId: randomUUID(),
        name: null,
        description: null,
        streamingKey: randomUUID(),
        onAir: false,
        startedAt: null,
      });
      const savedLive = await manager.save(LiveEntity, live);

      const newUser = manager.create(UserEntity, {
        ...createUserDto,
        live: savedLive,
      });
      return await manager.save(UserEntity, newUser);
    });
  }
}
