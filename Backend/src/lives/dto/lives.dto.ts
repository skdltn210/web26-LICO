export class LivesDto {
  readonly channelId: string;
  readonly livesName: string;
  readonly usersNickname: string;
  readonly usersProfileImage: string;
  readonly categoriesId: number | null;
  readonly categoriesName: string | null;
  readonly onAir: boolean | null;
}
