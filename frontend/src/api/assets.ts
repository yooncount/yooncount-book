import client from './client'
import type { AssetSummaryResponse } from '../types'

export const getAssetSummary = async (): Promise<AssetSummaryResponse> => {
  const { data } = await client.get('/assets/summary')
  return data.data ?? data
}
