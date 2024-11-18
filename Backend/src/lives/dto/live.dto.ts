export class LiveDto {
  readonly livesName: string | null;
  readonly livesDescription: string | null;
  readonly startedAt: Date;
  readonly usersNickname: string;
  readonly usersProfileImage: string;
  readonly categoriesId: number | null;
  readonly categoriesName: string | null;
  readonly onAir: boolean | null;
  readonly viewers: number;
}
