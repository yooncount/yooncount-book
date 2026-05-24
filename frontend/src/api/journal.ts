import client from './client'
import type { TradingJournal, TradeType } from '../types'

export interface JournalFilter {
  ticker?: string
  tradeType?: TradeType | ''
  startDate?: string
  endDate?: string
}

export const getJournals = async (filter?: JournalFilter): Promise<TradingJournal[]> => {
  const params: Record<string, string> = {}
  if (filter?.ticker) params.ticker = filter.ticker
  if (filter?.tradeType) params.tradeType = filter.tradeType
  if (filter?.startDate) params.startDate = filter.startDate
  if (filter?.endDate) params.endDate = filter.endDate
  const { data } = await client.get('/journals', { params })
  return data.data ?? data
}

export const createJournal = async (body: {
  ticker: string
  stockName: string
  tradeType: TradeType
  tradeDate: string
  quantity: number
  price: number
  totalAmount: number
  reason: string
  strategy?: string
  reflection?: string
}): Promise<TradingJournal> => {
  const { data } = await client.post('/journals', body)
  return data.data ?? data
}

export const updateJournal = async (
  id: number,
  body: {
    ticker: string
    stockName: string
    tradeType: TradeType
    tradeDate: string
    quantity: number
    price: number
    totalAmount: number
    reason: string
    strategy?: string
    reflection?: string
  }
): Promise<TradingJournal> => {
  const { data } = await client.put(`/journals/${id}`, body)
  return data.data ?? data
}

export const deleteJournal = async (id: number): Promise<void> => {
  await client.delete(`/journals/${id}`)
}
