import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, RefreshCw, Search, Trash2 } from 'lucide-react'
import {
  getPortfolioWithQuotes,
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
import AmountInput from '../components/ui/AmountInput'
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

  const {
    data: portfolio = [],
    isLoading: portfolioLoading,
    isFetching: portfolioFetching,
    refetch: refetchPortfolio,
  } = useQuery({
    queryKey: ['portfolio-quotes'],
    queryFn: getPortfolioWithQuotes,
    enabled: tab === 'portfolio',
    staleTime: 60_000,
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

  const { register, handleSubmit, reset, control } = useForm<TxFormValues>({
    defaultValues: { type: 'BUY', tradedAt: dayjs().format('YYYY-MM-DD') },
  })

  const createMutation = useMutation({
    mutationFn: createStockTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-transactions'] })
      qc.invalidateQueries({ queryKey: ['portfolio-quotes'] })
      setModalOpen(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteStockTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['stock-transactions'] })
      qc.invalidateQueries({ queryKey: ['portfolio-quotes'] })
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
          <>
            {(() => {
              const sumInvestment = portfolio.reduce((s, p) => s + p.totalInvestment, 0)
              const sumMarketValue = portfolio.reduce((s, p) => s + (p.marketValue ?? 0), 0)
              const sumUnrealized = portfolio.reduce((s, p) => s + (p.unrealizedPnl ?? 0), 0)
              const sumRealized = portfolio.reduce((s, p) => s + p.realizedPnl, 0)
              const sumTotal = sumRealized + sumUnrealized
              const sumTotalRate = sumInvestment > 0 ? (sumTotal / sumInvestment) * 100 : 0
              const hasQuoteError = portfolio.some((p) => p.quoteError)

              if (portfolio.length === 0) {
                return (
                  <Card title="보유 종목">
                    <p className="text-center text-gray-400 py-12">보유 종목이 없습니다.</p>
                  </Card>
                )
              }

              return (
                <>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500">총 투자금</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{formatAmount(sumInvestment)}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500">현재 평가금액</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{formatAmount(sumMarketValue)}</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500">평가손익(미실현)</p>
                      <p className={`text-xl font-bold mt-1 ${sumUnrealized > 0 ? 'text-green-600' : sumUnrealized < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        {sumUnrealized >= 0 ? '+' : ''}{formatAmount(sumUnrealized)}
                      </p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-xl p-4">
                      <p className="text-xs text-gray-500">총 손익 (실현+평가)</p>
                      <p className={`text-xl font-bold mt-1 ${sumTotal > 0 ? 'text-green-600' : sumTotal < 0 ? 'text-red-500' : 'text-gray-900'}`}>
                        {sumTotal >= 0 ? '+' : ''}{formatAmount(sumTotal)}
                      </p>
                      <p className={`text-xs mt-0.5 ${sumTotalRate > 0 ? 'text-green-600' : sumTotalRate < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {sumTotalRate >= 0 ? '+' : ''}{sumTotalRate.toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-gray-900">보유 종목</h3>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => refetchPortfolio()}
                        disabled={portfolioFetching}
                      >
                        <RefreshCw size={13} className={portfolioFetching ? 'animate-spin' : ''} />
                        시세 새로고침
                      </Button>
                    </div>

                    {hasQuoteError && (
                      <p className="text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded p-2 mb-3">
                        일부 종목의 시세 조회에 실패했습니다. Finnhub API 키와 티커 형식(한국주는 005930.KS)을 확인하세요.
                      </p>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left text-gray-500 border-b border-gray-100">
                            <th className="pb-3 font-medium">티커</th>
                            <th className="pb-3 font-medium">종목명</th>
                            <th className="pb-3 font-medium text-right">수량</th>
                            <th className="pb-3 font-medium text-right">평단가</th>
                            <th className="pb-3 font-medium text-right">현재가</th>
                            <th className="pb-3 font-medium text-right">총 투자금</th>
                            <th className="pb-3 font-medium text-right">평가금액</th>
                            <th className="pb-3 font-medium text-right">평가손익</th>
                            <th className="pb-3 font-medium text-right">총 손익</th>
                          </tr>
                        </thead>
                        <tbody>
                          {portfolio.map((p) => (
                            <tr key={p.ticker} className="border-b border-gray-50 hover:bg-gray-50">
                              <td className="py-3 font-medium text-blue-600">{p.ticker}</td>
                              <td className="py-3 text-gray-800">{p.stockName}</td>
                              <td className="py-3 text-right">{p.holdingQuantity.toLocaleString()}</td>
                              <td className="py-3 text-right text-gray-600">{formatAmount(p.avgPurchasePrice)}</td>
                              <td className="py-3 text-right">
                                {p.currentPrice != null ? (
                                  <span className="text-gray-800">{formatAmount(p.currentPrice)}</span>
                                ) : (
                                  <span className="text-xs text-amber-600" title={p.quoteError ?? ''}>조회실패</span>
                                )}
                              </td>
                              <td className="py-3 text-right font-medium">{formatAmount(p.totalInvestment)}</td>
                              <td className="py-3 text-right font-medium">
                                {p.marketValue != null ? formatAmount(p.marketValue) : '-'}
                              </td>
                              <td className={`py-3 text-right font-medium ${p.unrealizedPnl == null ? 'text-gray-400' : p.unrealizedPnl > 0 ? 'text-green-600' : p.unrealizedPnl < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                {p.unrealizedPnl == null ? '-' : (
                                  <>
                                    {p.unrealizedPnl >= 0 ? '+' : ''}{formatAmount(p.unrealizedPnl)}
                                    {p.unrealizedPnlRate != null && (
                                      <span className="block text-xs">
                                        {p.unrealizedPnlRate >= 0 ? '+' : ''}{p.unrealizedPnlRate.toFixed(2)}%
                                      </span>
                                    )}
                                  </>
                                )}
                              </td>
                              <td className={`py-3 text-right font-medium ${p.totalPnl > 0 ? 'text-green-600' : p.totalPnl < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                                {p.totalPnl === 0 ? '-' : (
                                  <>
                                    {p.totalPnl >= 0 ? '+' : ''}{formatAmount(p.totalPnl)}
                                    {p.totalPnlRate != null && (
                                      <span className="block text-xs">
                                        {p.totalPnlRate >= 0 ? '+' : ''}{p.totalPnlRate.toFixed(2)}%
                                      </span>
                                    )}
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </>
              )
            })()}
          </>
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
              <Controller
                control={control}
                name="quantity"
                rules={{ required: '수량을 입력하세요', min: { value: 1, message: '1 이상' } }}
                render={({ field }) => (
                  <AmountInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    showKorean={false}
                    placeholder="0"
                  />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 *</label>
              <Controller
                control={control}
                name="price"
                rules={{ required: '가격을 입력하세요', min: { value: 0, message: '0 이상' } }}
                render={({ field }) => (
                  <AmountInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="0" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수수료</label>
              <Controller
                control={control}
                name="fee"
                defaultValue={0}
                rules={{ min: { value: 0, message: '0 이상' } }}
                render={({ field }) => (
                  <AmountInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="0" />
                )}
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
