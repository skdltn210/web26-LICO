export class StatusDto {
  readonly livesName: string;
  readonly livesDescription: string;
  readonly categoriesId: number | null;
  readonly categoriesName: string | null;
  readonly onAir: boolean | null;
  readonly viewers: number;
}
