export function formatNumber(number: number, locale: string = 'ko-KR'): string {
  return new Intl.NumberFormat(locale).format(number);
}

export function formatUnit(number: number, decimal: number = 1, unit: string = ''): string {
  if (number < 10000) {
    return `${formatNumber(number)}${unit}`;
  }
  const man = number / 10000;
  return `${man.toFixed(decimal)}만${unit}`;
}
