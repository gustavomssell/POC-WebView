export type CategoryKey = "casa" | "mercado" | "transporte" | "lazer" | "saude"

export type Transaction = {
  id: string
  merchant: string
  detail: string
  category: CategoryKey | "entrada"
  categoryLabel: string
  amountCents: number
  dateLabel: string
  time: string
  runningBalanceCents: number
}

export const account = {
  holder: "Marina Costa",
  balanceCents: 482037,
  incomeCents: 624000,
  expenseCents: 245190,
  goalCents: 150000,
  goalSavedCents: 92400,
} as const

export const nextBill = {
  label: "Fatura do cartão",
  dueLabel: "28 out",
  daysLeft: 7,
  amountCents: 84230,
} as const

export const monthLabel = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
}).format(new Date())

export const categoryBreakdown: {
  key: CategoryKey
  label: string
  cents: number
}[] = [
  { key: "casa", label: "Casa", cents: 173820 },
  { key: "mercado", label: "Mercado", cents: 33690 },
  { key: "transporte", label: "Transporte", cents: 18000 },
  { key: "lazer", label: "Lazer", cents: 15000 },
  { key: "saude", label: "Saúde", cents: 4680 },
]

export const transactions: Transaction[] = [
  {
    id: "cafe-centro",
    merchant: "Café do Centro",
    detail: "Lazer · hoje",
    category: "lazer",
    categoryLabel: "Lazer",
    amountCents: -3000,
    dateLabel: "Hoje",
    time: "10:18",
    runningBalanceCents: 482037,
  },
  {
    id: "mercado-bom-preco",
    merchant: "Mercado Bom Preço",
    detail: "Mercado · hoje",
    category: "mercado",
    categoryLabel: "Mercado",
    amountCents: -31240,
    dateLabel: "Hoje",
    time: "09:42",
    runningBalanceCents: 485037,
  },
  {
    id: "padaria-esquina",
    merchant: "Padaria da Esquina",
    detail: "Mercado · ontem",
    category: "mercado",
    categoryLabel: "Mercado",
    amountCents: -2450,
    dateLabel: "Ontem",
    time: "08:15",
    runningBalanceCents: 516277,
  },
  {
    id: "cinema-luz",
    merchant: "Cinema Luz",
    detail: "Lazer · ontem",
    category: "lazer",
    categoryLabel: "Lazer",
    amountCents: -12000,
    dateLabel: "Ontem",
    time: "19:30",
    runningBalanceCents: 518727,
  },
  {
    id: "posto-avenida",
    merchant: "Posto Avenida",
    detail: "Transporte · 19 out",
    category: "transporte",
    categoryLabel: "Transporte",
    amountCents: -18000,
    dateLabel: "19 out",
    time: "18:06",
    runningBalanceCents: 530727,
  },
  {
    id: "farmacia-saude",
    merchant: "Farmácia Saúde",
    detail: "Saúde · 19 out",
    category: "saude",
    categoryLabel: "Saúde",
    amountCents: -4680,
    dateLabel: "19 out",
    time: "11:22",
    runningBalanceCents: 548727,
  },
  {
    id: "conta-luz",
    merchant: "Conta de Luz",
    detail: "Casa · 18 out",
    category: "casa",
    categoryLabel: "Casa",
    amountCents: -31820,
    dateLabel: "18 out",
    time: "09:10",
    runningBalanceCents: 553407,
  },
  {
    id: "internet-fibra",
    merchant: "Internet Fibra",
    detail: "Casa · 18 out",
    category: "casa",
    categoryLabel: "Casa",
    amountCents: -17000,
    dateLabel: "18 out",
    time: "08:55",
    runningBalanceCents: 585227,
  },
  {
    id: "aluguel",
    merchant: "Aluguel",
    detail: "Casa · 17 out",
    category: "casa",
    categoryLabel: "Casa",
    amountCents: -125000,
    dateLabel: "17 out",
    time: "07:30",
    runningBalanceCents: 602227,
  },
  {
    id: "salario",
    merchant: "Salário",
    detail: "Entrada · 16 out",
    category: "entrada",
    categoryLabel: "Entrada",
    amountCents: 624000,
    dateLabel: "16 out",
    time: "09:00",
    runningBalanceCents: 727227,
  },
]

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
})

export function formatCents(cents: number) {
  return brl.format(cents / 100)
}

export function splitCurrency(cents: number) {
  const [currency, value] = formatCents(cents).split("\u00a0")
  return { currency, value }
}

export function formatSignedCents(cents: number) {
  const sign = cents > 0 ? "+" : "−"
  return `${sign} ${brl.format(Math.abs(cents) / 100)}`
}

export function formatPercent(value: number, total: number) {
  if (total === 0) {
    return "0%"
  }

  return `${Math.round((value / total) * 100)}%`
}
