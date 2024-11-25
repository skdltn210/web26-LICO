import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { UserEntity } from '../users/entity/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  // 스트리머 팔로우
  async followStreamer(userId: number, streamerId: number): Promise<void> {
    if (userId === streamerId) {
      throw new BadRequestException('자기 자신을 팔로우할 수 없습니다.');
    }

    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    const streamer = await this.usersRepository.findOneBy({ id: streamerId });

    if (!user || !streamer) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 이미 팔로우 중인지 확인
    const isAlreadyFollowing = user.following.some(
      (followedUser) => followedUser.id === streamerId,
    );

    if (isAlreadyFollowing) {
      throw new BadRequestException('이미 팔로우 중입니다.');
    }

    user.following.push(streamer);
    await this.usersRepository.save(user);
  }

  // 스트리머 언팔로우
  async unfollowStreamer(userId: number, streamerId: number): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 팔로우 중인지 확인
    const index = user.following.findIndex(
      (followedUser) => followedUser.id === streamerId,
    );

    if (index === -1) {
      throw new BadRequestException('팔로우 중인 스트리머가 아닙니다.');
    }

    user.following.splice(index, 1);
    await this.usersRepository.save(user);
  }

  // 팔로우한 스트리머 목록 조회
  async getFollowingStreamers(userId: number): Promise<any[]> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['following', 'following.live','following.live.category'],
    });

    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return user.following.map((streamer) => ({
      categoriesId: streamer.live?.category?.id || null,
      categoriesName: streamer.live?.category?.name || null,
      livesName: streamer.live?.name || null,
      channelId: streamer.live?.channelId || null,
      usersNickname: streamer.nickname,
      usersProfileImage: streamer.profileImage,
      onAir: streamer.live?.onAir || false,
    }));
  }

  // 팔로워 수
  async getFollowerCount(streamerId: number): Promise<number> {
    const count = await this.usersRepository
      .createQueryBuilder('user')
      .innerJoin('user.followers', 'follower')
      .where('user.id = :streamerId', { streamerId })
      .getCount();
  
    return count;
  }
}