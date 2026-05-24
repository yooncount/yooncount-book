import type { TradeType, PaymentMethodType } from '../types'

export const formatAmount = (n: number): string => {
  return `₩${n.toLocaleString('ko-KR')}`
}

/**
 * 금액을 한글 단위로 변환 (만/억/조/경).
 * 4자리 그룹 내 값이 정확히 X*1000 또는 X*100이면 천/백으로 축약.
 * 예) 3000 → 3천원, 30000 → 3만원, 300000 → 30만원, 3000000 → 3백만원,
 *    30000000 → 3천만원, 100000000 → 1억원, 12345 → 1만 2345원
 */
export const formatKoreanAmount = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined || n === '') return ''
  const num = typeof n === 'number' ? n : Number(String(n).replace(/,/g, ''))
  if (!Number.isFinite(num) || num === 0) return ''

  const negative = num < 0
  // BigInt로 정밀도 보장 (경 단위는 Number 정밀도 초과)
  let abs = BigInt(Math.trunc(Math.abs(num)))
  const UNITS: [bigint, string][] = [
    [10_000_000_000_000_000n, '경'],
    [1_000_000_000_000n, '조'],
    [100_000_000n, '억'],
    [10_000n, '만'],
    [1n, ''],
  ]

  const simplify = (g: number): string => {
    if (g === 0) return ''
    if (g >= 1000 && g % 1000 === 0) return `${g / 1000}천`
    if (g >= 100 && g % 100 === 0) return `${g / 100}백`
    return String(g)
  }

  const parts: string[] = []
  for (const [value, label] of UNITS) {
    const q = abs / value
    if (q > 0n) {
      const display = simplify(Number(q))
      if (display) parts.push(`${display}${label}`)
      abs = abs % value
    }
  }
  if (parts.length === 0) return ''
  return (negative ? '-' : '') + parts.join(' ') + '원'
}

/** 사용자 입력 콤마 표시용: 1234567 → "1,234,567" */
export const formatWithCommas = (n: number | string | null | undefined): string => {
  if (n === null || n === undefined || n === '') return ''
  const raw = String(n).replace(/[^0-9-]/g, '')
  if (raw === '' || raw === '-') return raw
  const num = Number(raw)
  if (!Number.isFinite(num)) return ''
  return num.toLocaleString('ko-KR')
}

export const formatDate = (s: string): string => {
  if (!s) return ''
  return s.substring(0, 10)
}

export const formatPercent = (n: number): string => {
  return `${n.toFixed(1)}%`
}

export const formatTradeType = (t: TradeType): string => {
  return t === 'BUY' ? '매수' : '매도'
}

export const formatPaymentType = (t: PaymentMethodType): string => {
  const map: Record<PaymentMethodType, string> = {
    CREDIT_CARD: '신용카드',
    DEBIT_CARD: '체크카드',
    CASH: '현금',
    BANK_TRANSFER: '계좌이체',
    OTHER: '기타',
  }
  return map[t] ?? t
}
