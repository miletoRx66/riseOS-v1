export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBRLCompact(value: number): string {
  if (value >= 1_000_000_000)
    return `R$ ${(value / 1_000_000_000).toFixed(1).replace(".", ",")}B`;
  if (value >= 1_000_000)
    return `R$ ${(value / 1_000_000).toFixed(1).replace(".", ",")}M`;
  if (value >= 1_000)
    return `R$ ${(value / 1_000).toFixed(0)}K`;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
