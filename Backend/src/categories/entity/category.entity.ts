import { LiveEntity } from '../../lives/entity/live.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';

@Entity('categories')
export class CategoryEntity {
  @PrimaryGeneratedColumn({ name: 'categories_id' })
  id: number;

  @Column({ type: 'varchar', length: 50, name: 'categories_name' })
  name: string;

  @Column({ type: 'text', name: 'categories_image', nullable: true })
  image: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date | null;

  @OneToMany(() => LiveEntity, live => live.category)
  lives: LiveEntity[];
}
