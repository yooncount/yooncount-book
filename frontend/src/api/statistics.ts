import client from './client'
import type { MonthlyStatisticsResponse, AnnualStatisticsResponse, CategoryTrendResponse } from '../types'

export const getMonthlyStatistics = async (year: number, month: number): Promise<MonthlyStatisticsResponse> => {
  const { data } = await client.get('/statistics/monthly', { params: { year, month } })
  return data.data ?? data
}

export const getAnnualStatistics = async (year: number): Promise<AnnualStatisticsResponse> => {
  const { data } = await client.get('/statistics/annual', { params: { year } })
  return data.data ?? data
}

export const getCategoryTrend = async (categoryId: number, months: number): Promise<CategoryTrendResponse> => {
  const { data } = await client.get('/statistics/trend', { params: { categoryId, months } })
  return data.data ?? data
}
