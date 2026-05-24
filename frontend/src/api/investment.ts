import client from './client'
import type { StockTransaction, PortfolioResponse, StockQuoteResponse } from '../types'

export const getStockTransactions = async (ticker?: string): Promise<StockTransaction[]> => {
  const { data } = await client.get('/investments/transactions', { params: ticker ? { ticker } : undefined })
  return data.data ?? data
}

export const createStockTransaction = async (body: {
  ticker: string
  stockName: string
  type: string
  quantity: number
  price: number
  fee: number
  tradedAt: string
  memo?: string
}): Promise<StockTransaction> => {
  const { data } = await client.post('/investments/transactions', body)
  return data.data ?? data
}

export const deleteStockTransaction = async (id: number): Promise<void> => {
  await client.delete(`/investments/transactions/${id}`)
}

export const getPortfolio = async (): Promise<PortfolioResponse[]> => {
  const { data } = await client.get('/investments/portfolio')
  return data.data ?? data
}

export const getStockQuote = async (ticker: string): Promise<StockQuoteResponse> => {
  const { data } = await client.get('/investments/quote', { params: { ticker } })
  return data.data ?? data
}
