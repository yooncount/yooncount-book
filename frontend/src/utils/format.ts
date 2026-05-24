import type { TradeType, PaymentMethodType } from '../types'

export const formatAmount = (n: number): string => {
  return `₩${n.toLocaleString('ko-KR')}`
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
