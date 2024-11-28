import { Injectable, NotFoundException, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { UserEntity } from './entity/user.entity';
import { LiveEntity } from '../lives/entity/live.entity';
import { Repository, DataSource } from 'typeorm';
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { randomUUID } from 'crypto';
import { Upload } from '@aws-sdk/lib-storage';
import { PutObjectCommandInput, S3 } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  private s3: S3;
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,

    @InjectRepository(LiveEntity)
    private livesRepository: Repository<LiveEntity>,

    @InjectDataSource()
    private connection: DataSource,

    private configService: ConfigService,
  ) {
    // AWS SDK를 Ncloud Object Storage와 함께 사용하도록 설정
    this.s3 = new S3({
      credentials: {
        accessKeyId: this.configService.get<string>('NCLOUD_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('NCLOUD_SECRET_KEY'),
      },

      region: this.configService.get<string>('NCLOUD_REGION'),
      endpoint: this.configService.get<string>('NCLOUD_ENDPOINT'),
      tls: true,
      forcePathStyle: true,
    });
  }

  async findByOAuthUid(
    oauthUid: string,
    oauthPlatform: 'naver' | 'github' | 'google',
  ): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { oauthUid, oauthPlatform },
      relations: ['live'],
    });
  }

  async findById(id: number): Promise<UserEntity | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['live'],
    });
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
  async updateUser(
    userId: number,
    updateUserDto: UpdateUserDto,
    file?: Express.Multer.File,
  ): Promise<UserEntity> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    if (updateUserDto.nickname !== undefined) {
      user.nickname = updateUserDto.nickname;
    }

    if (file) {
      // 파일을 Ncloud Object Storage에 업로드
      const profileImageUrl = await this.uploadFileToNcloud(file);
      user.profileImage = profileImageUrl;
    } else if (updateUserDto.profileImage) {
      // 프로필 이미지 URL이 제공된 경우
      user.profileImage = updateUserDto.profileImage;
    }

    return await this.usersRepository.save(user);
  }

  private async uploadFileToNcloud(file: Express.Multer.File): Promise<string> {
    const bucketName = this.configService.get<string>('NCLOUD_BUCKET_NAME');

    // 고유한 파일명 생성
    const fileName = `profile-images/${Date.now()}-${file.originalname}`;

    const params: PutObjectCommandInput = {
      Bucket: bucketName,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // 공개 액세스 설정
    };

    try {
      const data = await new Upload({
        client: this.s3,
        params,
      }).done();
      return data.Location; // 업로드된 파일의 URL 반환
    } catch (error) {
      console.error('Ncloud Upload Error:', error);
      throw new InternalServerErrorException('파일 업로드에 실패했습니다.');
    }
  }
}
