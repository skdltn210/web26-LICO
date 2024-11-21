export class LivesDto {
  readonly channelId: string;
  readonly livesName: string | null;
  readonly usersNickname: string;
  readonly usersProfileImage: string;
  readonly categoriesId: number | null;
  readonly categoriesName: string | null;
  readonly onAir: boolean | null;
  readonly viewers: number;
  readonly streamerId: number;
}
