export function money(value: number | string | null | undefined) {
  const amount = Number(value || 0);
  return amount.toFixed(2);
}

export function toAmount(value: number | string | null | undefined) {
  return Number(value || 0);
}
