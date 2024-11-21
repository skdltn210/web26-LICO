import { Test, TestingModule } from '@nestjs/testing';
import { FollowService } from './follow.service';
import { UserEntity } from '../users/entity/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FollowService', () => {
  let service: FollowService;
  let usersRepository: jest.Mocked<Repository<UserEntity>>;

  const mockUsersRepository = {
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowService,
        { provide: getRepositoryToken(UserEntity), useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<FollowService>(FollowService);
    usersRepository = module.get(getRepositoryToken(UserEntity)) as jest.Mocked<Repository<UserEntity>>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // follow.service.2. `followStreamer` 메서드 테스트 스위트 시작
  describe('followStreamer', () => {
    let userId: number;
    let streamerId: number;
    let user: UserEntity;
    let streamer: UserEntity;

    beforeEach(() => {
      userId = 1;
      streamerId = 2;

      user = {
        id: userId,
        following: [],
      } as UserEntity;

      streamer = {
        id: streamerId,
      } as UserEntity;
    });

    // follow.service.2.1.1. 사용자가 스트리머를 성공적으로 팔로우하는 테스트
    it('should follow a streamer successfully', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.findOneBy.mockResolvedValue(streamer);
      usersRepository.save.mockResolvedValue(undefined);

      await service.followStreamer(userId, streamerId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following'],
      });

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: streamerId });

      expect(usersRepository.save).toHaveBeenCalledWith({
        ...user,
        following: [streamer],
      });
    });

    // follow.service.2.1.2. 사용자가 자신을 팔로우하려 할 때 예외를 던지는 테스트
    it('should throw BadRequestException when user tries to follow themselves', async () => {
      await expect(service.followStreamer(userId, userId)).rejects.toThrow(BadRequestException);
    });

    // follow.service.2.1.3. 사용자가 존재하지 않을 때 예외를 던지는 테스트
    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      usersRepository.findOneBy.mockResolvedValue(streamer);

      await expect(service.followStreamer(userId, streamerId)).rejects.toThrow(NotFoundException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following'],
      });
    });

    // follow.service.2.1.4. 스트리머가 존재하지 않을 때 예외를 던지는 테스트
    it('should throw NotFoundException if streamer not found', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.findOneBy.mockResolvedValue(null);

      await expect(service.followStreamer(userId, streamerId)).rejects.toThrow(NotFoundException);

      expect(usersRepository.findOneBy).toHaveBeenCalledWith({ id: streamerId });
    });

    // follow.service.2.1.5. 이미 팔로우 중인 스트리머일 때 예외를 던지는 테스트
    it('should throw BadRequestException if already following the streamer', async () => {
      user.following = [streamer];

      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.findOneBy.mockResolvedValue(streamer);

      await expect(service.followStreamer(userId, streamerId)).rejects.toThrow(BadRequestException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following'],
      });
    });
  });

  // follow.service.3. `unfollowStreamer` 메서드 테스트 스위트 시작
  describe('unfollowStreamer', () => {
    let userId: number;
    let streamerId: number;
    let user: UserEntity;
    let streamer: UserEntity;

    beforeEach(() => {
      userId = 1;
      streamerId = 2;

      streamer = {
        id: streamerId,
      } as UserEntity;

      user = {
        id: userId,
        following: [streamer],
      } as UserEntity;
    });

    // follow.service.3.1.1. 사용자가 스트리머를 성공적으로 언팔로우하는 테스트
    it('should unfollow a streamer successfully', async () => {
      usersRepository.findOne.mockResolvedValue(user);
      usersRepository.save.mockResolvedValue(undefined);

      await service.unfollowStreamer(userId, streamerId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following'],
      });

      expect(usersRepository.save).toHaveBeenCalledWith({
        ...user,
        following: [],
      });
    });

    // follow.service.3.1.2. 사용자가 존재하지 않을 때 예외를 던지는 테스트
    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.unfollowStreamer(userId, streamerId)).rejects.toThrow(NotFoundException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following'],
      });
    });

    // follow.service.3.1.3. 사용자가 해당 스트리머를 팔로우하고 있지 않을 때 예외를 던지는 테스트
    it('should throw BadRequestException if not following the streamer', async () => {
      user.following = []; // User is not following anyone

      usersRepository.findOne.mockResolvedValue(user);

      await expect(service.unfollowStreamer(userId, streamerId)).rejects.toThrow(BadRequestException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following'],
      });
    });
  });

  // follow.service.4. `getFollowingStreamers` 메서드 테스트 스위트 시작
  describe('getFollowingStreamers', () => {
    let userId: number;
    let streamer: UserEntity;
    let user: UserEntity;

    beforeEach(() => {
      userId = 1;

      streamer = {
        id: 2,
        nickname: 'Streamer',
        profileImage: 'image.jpg',
        live: {
          category: { id: 1, name: 'Category' },
          name: 'Live Stream',
          channelId: 'channel123',
          onAir: true,
        },
      } as UserEntity;

      user = {
        id: userId,
        following: [streamer],
      } as UserEntity;
    });

    // follow.service.4.1.1. 팔로우한 스트리머 목록을 성공적으로 반환하는 테스트
    it('should return the list of following streamers', async () => {
      usersRepository.findOne.mockResolvedValue(user);

      const result = await service.getFollowingStreamers(userId);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following', 'following.live', 'following.live.category'],
      });

      expect(result).toEqual([
        {
          categoriesId: 1,
          categoriesName: 'Category',
          livesName: 'Live Stream',
          channelId: 'channel123',
          usersNickname: 'Streamer',
          usersProfileImage: 'image.jpg',
          onAir: true,
        },
      ]);
    });

    // follow.service.4.1.2. 사용자가 존재하지 않을 때 예외를 던지는 테스트
    it('should throw NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.getFollowingStreamers(userId)).rejects.toThrow(NotFoundException);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: userId },
        relations: ['following', 'following.live', 'following.live.category'],
      });
    });
  });
});
