import { CategoryEntity } from '../../categories/entity/category.entity';
import { UserEntity } from '../../users/entity/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { LivesDto } from '../dto/lives.dto';
import { LiveDto } from '../dto/live.dto';
import { StatusDto } from '../dto/status.dto';

@Entity('lives')
export class LiveEntity {
  @PrimaryGeneratedColumn({ name: 'lives_id' })
  id: number;

  @Column({ name: 'categories_id', type: 'int', nullable: true })
  categoriesId: number | null;

  @ManyToOne(() => CategoryEntity, category => category.lives)
  @JoinColumn({ name: 'categories_id' })
  category: CategoryEntity;

  @Column({ name: 'channel_id', type: 'varchar', length: 36 })
  channelId: string;

  @Column({ name: 'lives_name', type: 'varchar', length: 50, nullable: true })
  name: string | null;

  @Column({ name: 'lives_description', type: 'varchar', length: 50, nullable: true })
  description: string | null;

  @Column({ name: 'streaming_key', type: 'varchar', length: 36 })
  streamingKey: string;

  @Column({ name: 'onair', type: 'boolean', nullable: true })
  onAir: boolean | null;

  @Column({ name: 'started_at', type: 'datetime', nullable: true })
  startedAt: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date | null;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'viewers', type: 'int', default: 0 })
  viewers: number;

  @OneToOne(() => UserEntity, user => user.live)
  user: UserEntity;

  toLivesDto(): LivesDto {
    return {
      categoriesId: this.category?.id,
      categoriesName: this.category?.name,
      livesName: this.name,
      channelId: this.channelId,
      usersNickname: this.user.nickname,
      usersProfileImage: this.user.profileImage,
      onAir: this.onAir,
    };
  }

  toLiveDto(): LiveDto {
    return {
      categoriesId: this.category?.id,
      categoriesName: this.category?.name,
      livesName: this.name,
      livesDescription: this.description,
      startedAt: this.startedAt,
      usersNickname: this.user.nickname,
      usersProfileImage: this.user.profileImage,
      onAir: this.onAir,
    };
  }

  toStatus(): StatusDto {
    return {
      categoriesId: this.category?.id,
      categoriesName: this.category?.name,
      livesName: this.name,
      livesDescription: this.description,
      onAir: this.onAir,
      viewers: this.viewers,
    };
  }
}
