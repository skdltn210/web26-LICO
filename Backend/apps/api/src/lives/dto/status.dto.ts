export class StatusDto {
  readonly livesName: string | null;
  readonly livesDescription: string | null;
  readonly categoriesId: number | null;
  readonly categoriesName: string | null;
  readonly onAir: boolean | null;
  readonly viewers: number;
}
