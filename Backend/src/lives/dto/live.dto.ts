export class LiveDto {
  readonly livesName: string;
  readonly livesDescription: string;
  readonly startedAt: Date;
  readonly usersNickname: string;
  readonly usersProfileImage: string;
  readonly categoriesId: number | null;
  readonly categoriesName: string | null;
  readonly onAir: boolean | null;
}
