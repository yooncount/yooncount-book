import client from './client'
import type { NetWorthSnapshot } from '../types'

export const getNetWorthSnapshots = async (): Promise<NetWorthSnapshot[]> => {
  const { data } = await client.get('/net-worth/snapshots')
  return data.data ?? data
}

export const createNetWorthSnapshot = async (body: { memo?: string }): Promise<NetWorthSnapshot> => {
  const { data } = await client.post('/net-worth/snapshots', body)
  return data.data ?? data
}

export const deleteNetWorthSnapshot = async (id: number): Promise<void> => {
  await client.delete(`/net-worth/snapshots/${id}`)
}
