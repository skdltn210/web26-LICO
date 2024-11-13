import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  OneToOne, 
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;
}
