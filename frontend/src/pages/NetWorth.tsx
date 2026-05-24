import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Camera, Trash2 } from 'lucide-react'
import { getAssetSummary } from '../api/assets'
import { getNetWorthSnapshots, createNetWorthSnapshot, deleteNetWorthSnapshot } from '../api/networth'
import type { NetWorthSnapshot } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatAmount, formatDate } from '../utils/format'

interface SnapshotFormValues {
  memo?: string
}

const NetWorth: React.FC = () => {
  const qc = useQueryClient()
  const [snapshotModalOpen, setSnapshotModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<NetWorthSnapshot | null>(null)

  const { data: assets, isLoading: assetsLoading } = useQuery({
    queryKey: ['assets-summary'],
    queryFn: getAssetSummary,
  })

  const { data: snapshots = [], isLoading: snapshotsLoading } = useQuery({
    queryKey: ['net-worth-snapshots'],
    queryFn: getNetWorthSnapshots,
  })

  const { register, handleSubmit, reset } = useForm<SnapshotFormValues>()

  const createMutation = useMutation({
    mutationFn: createNetWorthSnapshot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['net-worth-snapshots'] })
      setSnapshotModalOpen(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteNetWorthSnapshot,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['net-worth-snapshots'] })
      setDeleteTarget(null)
    },
  })

  const assetRows = assets
    ? [
        { label: '현금 (수입 - 지출)', value: assets.cashBalance, color: 'text-gray-800' },
        { label: '주식 투자금', value: assets.stockInvestment, color: 'text-blue-600' },
        { label: '실현 손익', value: assets.realizedStockPnl, color: assets.realizedStockPnl >= 0 ? 'text-green-600' : 'text-red-500' },
        { label: '총 자산 (Gross)', value: assets.grossAssets, color: 'text-gray-900', bold: true },
        { label: '부채 (대출)', value: -assets.totalDebt, color: 'text-red-500' },
        { label: '순 자산 (Net)', value: assets.netAssets, color: assets.netAssets >= 0 ? 'text-blue-700' : 'text-red-600', bold: true },
      ]
    : []

  const chartData = [...snapshots]
    .sort((a, b) => a.snapshotDate.localeCompare(b.snapshotDate))
    .map((s) => ({
      date: formatDate(s.snapshotDate),
      순자산: s.netAssets,
      총자산: s.grossAssets,
      부채: s.totalDebt,
    }))

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">자산 현황</h2>

      {assetsLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Asset Breakdown */}
          <Card title="자산 분석">
            <table className="w-full text-sm">
              <tbody>
                {assetRows.map(({ label, value, color, bold }) => (
                  <tr key={label} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 text-gray-500">{label}</td>
                    <td className={`py-2.5 text-right ${color} ${bold ? 'font-bold text-base' : 'font-medium'}`}>
                      {formatAmount(Math.abs(value))}
                      {value < 0 && label !== '부채 (대출)' ? ' (손실)' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* Stock Portfolio */}
          <Card title="주식 포트폴리오">
            {(assets?.stockPortfolio ?? []).length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">보유 종목이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100 text-xs">
                      <th className="pb-2 font-medium">티커</th>
                      <th className="pb-2 font-medium">종목명</th>
                      <th className="pb-2 font-medium text-right">수량</th>
                      <th className="pb-2 font-medium text-right">평균가</th>
                      <th className="pb-2 font-medium text-right">투자금</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(assets?.stockPortfolio ?? []).map((s) => (
                      <tr key={s.ticker} className="border-b border-gray-50">
                        <td className="py-2 font-medium text-blue-600">{s.ticker}</td>
                        <td className="py-2 text-gray-700">{s.stockName}</td>
                        <td className="py-2 text-right">{s.holdingQuantity.toLocaleString()}</td>
                        <td className="py-2 text-right text-gray-600">{formatAmount(s.avgPurchasePrice)}</td>
                        <td className="py-2 text-right font-medium">{formatAmount(s.totalInvestment)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Snapshots */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">순자산 스냅샷 이력</h3>
          <Button onClick={() => setSnapshotModalOpen(true)}>
            <Camera size={15} />
            스냅샷 저장
          </Button>
        </div>

        {snapshotsLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Line Chart */}
            {chartData.length > 0 && (
              <Card className="mb-4">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₩${(v / 100000000).toFixed(1)}억`} />
                    <Tooltip formatter={(v: number) => formatAmount(v)} />
                    <Legend />
                    <Line type="monotone" dataKey="순자산" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="총자산" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="부채" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>
            )}

            {snapshots.length === 0 ? (
              <p className="text-center text-gray-400 py-8">스냅샷이 없습니다. 스냅샷을 저장해보세요.</p>
            ) : (
              <Card>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">날짜</th>
                        <th className="pb-3 font-medium text-right">현금</th>
                        <th className="pb-3 font-medium text-right">주식</th>
                        <th className="pb-3 font-medium text-right">총자산</th>
                        <th className="pb-3 font-medium text-right">부채</th>
                        <th className="pb-3 font-medium text-right">순자산</th>
                        <th className="pb-3 font-medium">메모</th>
                        <th className="pb-3 font-medium text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...snapshots]
                        .sort((a, b) => b.snapshotDate.localeCompare(a.snapshotDate))
                        .map((s) => (
                          <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 text-gray-600">{formatDate(s.snapshotDate)}</td>
                            <td className="py-3 text-right">{formatAmount(s.cashBalance)}</td>
                            <td className="py-3 text-right text-blue-600">{formatAmount(s.stockInvestment)}</td>
                            <td className="py-3 text-right font-medium">{formatAmount(s.grossAssets)}</td>
                            <td className="py-3 text-right text-red-500">{formatAmount(s.totalDebt)}</td>
                            <td className={`py-3 text-right font-semibold ${s.netAssets >= 0 ? 'text-blue-700' : 'text-red-500'}`}>
                              {formatAmount(s.netAssets)}
                            </td>
                            <td className="py-3 text-gray-400 max-w-32 truncate">{s.memo ?? '-'}</td>
                            <td className="py-3 text-right">
                              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(s)}>
                                <Trash2 size={13} className="text-red-400" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Snapshot Modal */}
      <Modal
        isOpen={snapshotModalOpen}
        onClose={() => { setSnapshotModalOpen(false); reset() }}
        title="스냅샷 저장"
        size="sm"
      >
        <p className="text-sm text-gray-600 mb-4">
          현재 자산 현황을 스냅샷으로 저장합니다.
        </p>
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <input
              type="text"
              {...register('memo')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="메모 (선택)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setSnapshotModalOpen(false); reset() }}>취소</Button>
            <Button type="submit" disabled={createMutation.isPending}>
              <Camera size={14} />
              저장
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`${formatDate(deleteTarget?.snapshotDate ?? '')} 스냅샷을 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default NetWorth
