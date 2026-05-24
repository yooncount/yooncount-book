import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2, MessageSquare } from 'lucide-react'
import { getJournals, createJournal, updateJournal, deleteJournal } from '../api/journal'
import type { TradingJournal, TradeType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'
import AmountInput from '../components/ui/AmountInput'
import { formatAmount, formatDate, formatTradeType } from '../utils/format'

interface FormValues {
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

const TradingJournalPage: React.FC = () => {
  const qc = useQueryClient()
  const [tickerFilter, setTickerFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState<TradeType | ''>('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<TradingJournal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<TradingJournal | null>(null)
  const [reflectionModal, setReflectionModal] = useState<TradingJournal | null>(null)
  const [reflectionText, setReflectionText] = useState('')

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['journals', tickerFilter, typeFilter, startDate, endDate],
    queryFn: () =>
      getJournals({
        ticker: tickerFilter || undefined,
        tradeType: typeFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }),
  })

  const { register, handleSubmit, reset, setValue, watch, control } = useForm<FormValues>({
    defaultValues: { tradeType: 'BUY', tradeDate: dayjs().format('YYYY-MM-DD') },
  })

  const watchQty = watch('quantity')
  const watchPrice = watch('price')

  const createMutation = useMutation({
    mutationFn: createJournal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journals'] })
      setModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormValues }) =>
      updateJournal(id, {
        ...body,
        quantity: Number(body.quantity),
        price: Number(body.price),
        totalAmount: Number(body.totalAmount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journals'] })
      setModalOpen(false)
      setEditTarget(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteJournal,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journals'] })
      setDeleteTarget(null)
    },
  })

  const updateReflectionMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormValues }) =>
      updateJournal(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['journals'] })
      setReflectionModal(null)
    },
  })

  const openAdd = () => {
    setEditTarget(null)
    reset({ tradeType: 'BUY', tradeDate: dayjs().format('YYYY-MM-DD') })
    setModalOpen(true)
  }

  const openEdit = (j: TradingJournal) => {
    setEditTarget(j)
    setValue('ticker', j.ticker)
    setValue('stockName', j.stockName)
    setValue('tradeType', j.tradeType)
    setValue('tradeDate', j.tradeDate.substring(0, 10))
    setValue('quantity', j.quantity)
    setValue('price', j.price)
    setValue('totalAmount', j.totalAmount)
    setValue('reason', j.reason)
    setValue('strategy', j.strategy)
    setValue('reflection', j.reflection)
    setModalOpen(true)
  }

  const openReflection = (j: TradingJournal) => {
    setReflectionModal(j)
    setReflectionText(j.reflection ?? '')
  }

  const saveReflection = () => {
    if (!reflectionModal) return
    updateReflectionMutation.mutate({
      id: reflectionModal.id,
      body: {
        ticker: reflectionModal.ticker,
        stockName: reflectionModal.stockName,
        tradeType: reflectionModal.tradeType,
        tradeDate: reflectionModal.tradeDate.substring(0, 10),
        quantity: reflectionModal.quantity,
        price: reflectionModal.price,
        totalAmount: reflectionModal.totalAmount,
        reason: reflectionModal.reason,
        strategy: reflectionModal.strategy,
        reflection: reflectionText,
      },
    })
  }

  const onSubmit = (values: FormValues) => {
    const body = {
      ...values,
      quantity: Number(values.quantity),
      price: Number(values.price),
      totalAmount: Number(values.totalAmount) || Number(values.quantity) * Number(values.price),
    }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body: values })
    } else {
      createMutation.mutate(body)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">매매 일지</h2>
        <Button onClick={openAdd}>
          <Plus size={16} />
          일지 추가
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <input
          type="text"
          value={tickerFilter}
          onChange={(e) => setTickerFilter(e.target.value.toUpperCase())}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-32"
          placeholder="티커 필터"
        />
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as TradeType | '')}
        >
          <option value="">전체</option>
          <option value="BUY">매수</option>
          <option value="SELL">매도</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
        <span className="text-gray-400">~</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
        />
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : journals.length === 0 ? (
        <p className="text-center text-gray-400 py-16">매매 일지가 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {journals.map((j) => (
            <Card key={j.id}>
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-800">{j.ticker}</span>
                  <span className="text-sm text-gray-500">{j.stockName}</span>
                  <Badge variant={j.tradeType === 'BUY' ? 'buy' : 'sell'}>
                    {formatTradeType(j.tradeType)}
                  </Badge>
                  <span className="text-sm text-gray-400">{formatDate(j.tradeDate)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(j)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(j)}>
                    <Trash2 size={13} className="text-red-400" />
                  </Button>
                </div>
              </div>

              {/* Stats */}
              <div className="flex gap-6 text-sm text-gray-600 mb-3">
                <span>수량: <strong>{j.quantity.toLocaleString()}</strong></span>
                <span>가격: <strong>{formatAmount(j.price)}</strong></span>
                <span>총액: <strong>{formatAmount(j.totalAmount)}</strong></span>
              </div>

              {/* Reason */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-400 uppercase mb-1">매매 이유</p>
                <p className="text-sm text-gray-700">{j.reason}</p>
              </div>

              {/* Strategy */}
              {j.strategy && (
                <div className="mb-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase mb-1">전략</p>
                  <p className="text-sm text-gray-700">{j.strategy}</p>
                </div>
              )}

              {/* Reflection */}
              {j.reflection ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-yellow-700 uppercase mb-1">회고</p>
                  <p className="text-sm text-yellow-800">{j.reflection}</p>
                  <button
                    className="text-xs text-yellow-600 hover:text-yellow-800 mt-1"
                    onClick={() => openReflection(j)}
                  >
                    수정
                  </button>
                </div>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => openReflection(j)} className="text-gray-400">
                  <MessageSquare size={13} />
                  회고를 작성해주세요
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset() }}
        title={editTarget ? '일지 수정' : '매매 일지 추가'}
        size="lg"
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
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
              <select
                {...register('tradeType', { required: true })}
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
                {...register('tradeDate', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
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
                  />
                )}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 *</label>
              <Controller
                control={control}
                name="price"
                rules={{ required: '가격을 입력하세요', min: { value: 0, message: '0 이상' } }}
                render={({ field }) => (
                  <AmountInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">총액</label>
              <Controller
                control={control}
                name="totalAmount"
                render={({ field }) => (
                  <AmountInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={String(Number(watchQty ?? 0) * Number(watchPrice ?? 0))}
                  />
                )}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">매매 이유 *</label>
            <textarea
              {...register('reason', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="이 종목을 매수/매도한 이유를 작성하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">전략</label>
            <textarea
              {...register('strategy')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="투자 전략 (선택)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회고</label>
            <textarea
              {...register('reflection')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="회고 (선택)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditTarget(null); reset() }}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editTarget ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reflection Modal */}
      <Modal
        isOpen={!!reflectionModal}
        onClose={() => setReflectionModal(null)}
        title="회고 작성"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {reflectionModal?.ticker} · {reflectionModal?.tradeDate.substring(0, 10)}
          </p>
          <textarea
            value={reflectionText}
            onChange={(e) => setReflectionText(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
            rows={5}
            placeholder="이 매매에 대한 회고를 작성하세요"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setReflectionModal(null)}>취소</Button>
            <Button onClick={saveReflection} disabled={updateReflectionMutation.isPending}>저장</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`"${deleteTarget?.ticker}" 일지를 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default TradingJournalPage
