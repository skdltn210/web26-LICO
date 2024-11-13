import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { LiveEntity } from '../../lives/entity/live.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  oauthUid: string;

  // enum 대신 varchar 타입 사용
  @Column('varchar', { length: 10 })
  oauthPlatform: 'naver' | 'github' | 'google';

  @Column()
  nickname: string;

  @Column({ nullable: true })
  profileImage: string;

  @OneToOne(() => LiveEntity)
  @JoinColumn()
  live: LiveEntity;
}
