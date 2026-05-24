import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Search, Trash2 } from 'lucide-react'
import {
  getPortfolio,
  getStockTransactions,
  createStockTransaction,
  deleteStockTransaction,
  getStockQuote,
} from '../api/investment'
import type { TradeType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'
import { formatAmount, formatDate, formatTradeType } from '../utils/format'
import dayjs from 'dayjs'

interface TxFormValues {
  ticker: string
  stockName: string
  type: TradeType
  quantity: number
  price: number
  fee: number
  tradedAt: string
  memo?: string
}

const Investment: React.FC = () => {
  const qc = useQueryClient()
  const [tab, setTab] = useState<'portfolio' | 'transactions' | 'quote'>('portfolio')
  const [tickerFilter, setTickerFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; ticker: string } | null>(null)
  const [quoteInput, setQuoteInput] = useState('')
  const [quoteTicker, setQuoteTicker] = useState('')

  const { data: portfolio = [], isLoading: portfolioLoading } = useQuery({
    queryKey: ['portfolio'],
    queryFn: getPortfolio,
    enabled: tab === 'portfolio',
  })

  const { data: stockTxs = [], isLoading: txLoading } = useQuery({
    queryKey: ['stock-transactions', tickerFilter],
    queryFn: () => getStockTransactions(tickerFilter || undefined),
    enabled: tab === 'transactions',
  })

  const { data: quote, isLoading: quoteLoading, error: quoteError, refetch: refetchQuote } = useQuery({
    queryKey: ['stock-quote', quoteTicker],
    queryFn: () => getStockQuote(quoteTicker),
    enabled: !!quoteTicker,
    retry: false,
  })

  const { register, handleSubmit, reset } = useForm<TxFormValues>({
    defaultValues: { type: 'BUY', tradedAt: dayjs().format('YYYY-MM-DD') },
  })

  const createMutation = useMutation({
    mutationFn: createStockTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-transactions'] })
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      setModalOpen(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStockTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-transactions'] })
      qc.invalidateQueries({ queryKey: ['portfolio'] })
      setDeleteTarget(null)
    },
  })

  const onSubmit = (values: TxFormValues) => {
    createMutation.mutate({
      ...values,
      quantity: Number(values.quantity),
      price: Number(values.price),
      fee: Number(values.fee),
    })
  }

  const tabs = [
    { key: 'portfolio', label: '포트폴리오' },
    { key: 'transactions', label: '거래 내역' },
    { key: 'quote', label: '현재가 조회' },
  ] as const

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">투자</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Portfolio Tab */}
      {tab === 'portfolio' && (
        portfolioLoading ? <LoadingSpinner /> : (
          <Card title="보유 종목">
            {portfolio.length === 0 ? (
              <p className="text-center text-gray-400 py-12">보유 종목이 없습니다.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 border-b border-gray-100">
                      <th className="pb-3 font-medium">티커</th>
                      <th className="pb-3 font-medium">종목명</th>
                      <th className="pb-3 font-medium text-right">보유 수량</th>
                      <th className="pb-3 font-medium text-right">평균 매수가</th>
                      <th className="pb-3 font-medium text-right">총 투자금</th>
                      <th className="pb-3 font-medium text-right">실현 손익</th>
                      <th className="pb-3 font-medium text-right">손익률</th>
                    </tr>
                  </thead>
                  <tbody>
                    {portfolio.map((p) => (
                      <tr key={p.ticker} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-3 font-medium text-blue-600">{p.ticker}</td>
                        <td className="py-3 text-gray-800">{p.stockName}</td>
                        <td className="py-3 text-right">{p.holdingQuantity.toLocaleString()}</td>
                        <td className="py-3 text-right text-gray-600">{formatAmount(p.avgPurchasePrice)}</td>
                        <td className="py-3 text-right font-medium">{formatAmount(p.totalInvestment)}</td>
                        <td className={`py-3 text-right font-medium ${p.realizedPnl > 0 ? 'text-green-600' : p.realizedPnl < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                          {p.realizedPnl === 0 ? '-' : formatAmount(p.realizedPnl)}
                        </td>
                        <td className={`py-3 text-right ${p.realizedPnlRate > 0 ? 'text-green-600' : p.realizedPnlRate < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                          {p.realizedPnl === 0 ? '-' : `${p.realizedPnlRate >= 0 ? '+' : ''}${p.realizedPnlRate.toFixed(2)}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        )
      )}

      {/* Transactions Tab */}
      {tab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={tickerFilter}
                onChange={(e) => setTickerFilter(e.target.value.toUpperCase())}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-36"
                placeholder="티커 필터"
              />
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus size={16} />
              거래 추가
            </Button>
          </div>

          {txLoading ? <LoadingSpinner /> : (
            <Card>
              {stockTxs.length === 0 ? (
                <p className="text-center text-gray-400 py-12">거래 내역이 없습니다.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500 border-b border-gray-100">
                        <th className="pb-3 font-medium">날짜</th>
                        <th className="pb-3 font-medium">티커</th>
                        <th className="pb-3 font-medium">종목명</th>
                        <th className="pb-3 font-medium">유형</th>
                        <th className="pb-3 font-medium text-right">수량</th>
                        <th className="pb-3 font-medium text-right">가격</th>
                        <th className="pb-3 font-medium text-right">수수료</th>
                        <th className="pb-3 font-medium">메모</th>
                        <th className="pb-3 font-medium text-right">관리</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockTxs.map((tx) => (
                        <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                          <td className="py-3 text-gray-500">{formatDate(tx.tradedAt)}</td>
                          <td className="py-3 font-medium text-blue-600">{tx.ticker}</td>
                          <td className="py-3 text-gray-800">{tx.stockName}</td>
                          <td className="py-3">
                            <Badge variant={tx.type === 'BUY' ? 'buy' : 'sell'}>
                              {formatTradeType(tx.type)}
                            </Badge>
                          </td>
                          <td className="py-3 text-right">{tx.quantity.toLocaleString()}</td>
                          <td className="py-3 text-right">{formatAmount(tx.price)}</td>
                          <td className="py-3 text-right text-gray-500">{formatAmount(tx.fee)}</td>
                          <td className="py-3 text-gray-400 max-w-32 truncate">{tx.memo ?? '-'}</td>
                          <td className="py-3 text-right">
                            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget({ id: tx.id, ticker: tx.ticker })}>
                              <Trash2 size={13} className="text-red-400" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* Quote Tab */}
      {tab === 'quote' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={quoteInput}
              onChange={(e) => setQuoteInput(e.target.value.toUpperCase())}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-40"
              placeholder="티커 (예: AAPL)"
              onKeyDown={(e) => e.key === 'Enter' && setQuoteTicker(quoteInput)}
            />
            <Button onClick={() => setQuoteTicker(quoteInput)}>
              <Search size={15} />
              조회
            </Button>
          </div>

          {quoteLoading && <LoadingSpinner />}

          {quoteError && (
            <Card>
              <div className="text-center py-8">
                <p className="text-red-500 font-medium">현재가 조회 실패</p>
                <p className="text-sm text-gray-500 mt-1">
                  Finnhub API 키가 설정되지 않았거나 서비스를 사용할 수 없습니다.
                </p>
                <p className="text-xs text-gray-400 mt-1">{(quoteError as Error).message}</p>
              </div>
            </Card>
          )}

          {quote && !quoteLoading && (
            <Card title={`${quote.stockName} (${quote.ticker})`}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs text-gray-400 mb-1">현재가</p>
                  <p className="text-3xl font-bold text-gray-900">{formatAmount(quote.currentPrice)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-sm font-medium ${quote.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      {quote.change >= 0 ? '+' : ''}{formatAmount(quote.change)}
                    </span>
                    <span className={`text-sm ${quote.changePercent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                      ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: '시가', value: formatAmount(quote.openPrice) },
                    { label: '전일 종가', value: formatAmount(quote.previousClose) },
                    { label: '고가', value: formatAmount(quote.highPrice) },
                    { label: '저가', value: formatAmount(quote.lowPrice) },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-gray-400">{label}</p>
                      <p className="text-sm font-medium text-gray-700">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Add Transaction Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); reset() }}
        title="주식 거래 추가"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">티커 *</label>
              <input
                type="text"
                {...register('ticker', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase"
                placeholder="AAPL"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종목명 *</label>
              <input
                type="text"
                {...register('stockName', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="Apple Inc."
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
              <select
                {...register('type', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="BUY">매수</option>
                <option value="SELL">매도</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">거래일 *</label>
              <input
                type="date"
                {...register('tradedAt', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수량 *</label>
              <input
                type="number"
                {...register('quantity', { required: true, min: 1 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 *</label>
              <input
                type="number"
                {...register('price', { required: true, min: 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수수료</label>
              <input
                type="number"
                {...register('fee', { min: 0 })}
                defaultValue={0}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
          </div>
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
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); reset() }}>취소</Button>
            <Button type="submit" disabled={createMutation.isPending}>추가</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`"${deleteTarget?.ticker}" 거래 내역을 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default Investment
