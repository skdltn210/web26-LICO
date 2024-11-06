import { LiveEntity } from 'src/lives/entity/live.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'users_id' })
  id: number;

  @Column({ name: 'oauth_uid', type: 'varchar', length: 50 })
  oauthUid: string;

  @Column({
    name: 'oauth_platform',
    type: 'enum',
    enum: ['naver', 'github', 'google'],
    nullable: false,
  })
  oauthPlatform: 'naver' | 'github' | 'google';

  @Column({ name: 'users_nickname', type: 'varchar', length: 50 })
  nickname: string;

  @Column({ name: 'users_profile_image', type: 'text', nullable: true })
  profileImage: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToOne(() => LiveEntity)
  @JoinColumn({ name: 'lives_id' })
  live: LiveEntity;
}
