import { Test, TestingModule } from '@nestjs/testing';
import { FollowController } from './follow.controller';
import { FollowService } from './follow.service';
import { UserEntity } from '../users/entity/user.entity';

describe('FollowController', () => {
  let controller: FollowController;
  let service: jest.Mocked<FollowService>;

  const mockFollowService = {
    getFollowingStreamers: jest.fn(),
    followStreamer: jest.fn(),
    unfollowStreamer: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FollowController],
      providers: [{ provide: FollowService, useValue: mockFollowService }],
    }).compile();

    controller = module.get<FollowController>(FollowController);
    service = module.get(FollowService) as jest.Mocked<FollowService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // follow.controller.2. `getFollowing` 메서드 테스트 스위트 시작
  describe('getFollowing', () => {
    // follow.controller.2.1. 팔로우 목록 조회 테스트
    it('should return the list of following streamers', async () => {
      const userId = 1;
      const req = {
        user: { id: userId } as UserEntity,
      } as any;

      const followingStreamers = [
        {
          categoriesId: 1,
          categoriesName: 'Category',
          livesName: 'Live Stream',
          channelId: 'channel123',
          usersNickname: 'Streamer',
          usersProfileImage: 'image.jpg',
          onAir: true,
        },
      ];

      service.getFollowingStreamers.mockResolvedValue(followingStreamers);

      const result = await controller.getFollowing(req);

      expect(service.getFollowingStreamers).toHaveBeenCalledWith(userId);
      expect(result).toEqual(followingStreamers);
    });
  });

  // follow.controller.3. `followStreamer` 메서드 테스트 스위트 시작
  describe('followStreamer', () => {
    // follow.controller.3.1. 스트리머 팔로우 테스트
    it('should follow a streamer successfully', async () => {
      const userId = 1;
      const streamerId = 2;
      const req = {
        user: { id: userId } as UserEntity,
      } as any;

      service.followStreamer.mockResolvedValue(undefined);

      const result = await controller.followStreamer(req, streamerId);

      expect(service.followStreamer).toHaveBeenCalledWith(userId, streamerId);
      expect(result).toEqual({ message: '팔로우 성공' });
    });
  });

  // follow.controller.4. `unfollowStreamer` 메서드 테스트 스위트 시작
  describe('unfollowStreamer', () => {
    // follow.controller.4.1. 스트리머 언팔로우 테스트
    it('should unfollow a streamer successfully', async () => {
      const userId = 1;
      const streamerId = 2;
      const req = {
        user: { id: userId } as UserEntity,
      } as any;

      service.unfollowStreamer.mockResolvedValue(undefined);

      const result = await controller.unfollowStreamer(req, streamerId);

      expect(service.unfollowStreamer).toHaveBeenCalledWith(userId, streamerId);
      expect(result).toEqual({ message: '언팔로우 성공' });
    });
  });
});
