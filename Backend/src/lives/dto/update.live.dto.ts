import { IsNotEmpty, isNotEmpty, IsNumber, IsString, MaxLength, Min, MIN } from 'class-validator';

export class UpdateLiveDto {
  @IsString()
  @MaxLength(50)
  readonly name: string;

  @IsString()
  @MaxLength(50)
  readonly description: string;

  @IsNumber()
  @Min(1)
  readonly categoriesId: number;
}
