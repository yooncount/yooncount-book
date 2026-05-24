import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import {
  getPaymentMethods,
  createPaymentMethod,
  updatePaymentMethod,
  deletePaymentMethod,
  getPaymentMethodStats,
} from '../api/payment'
import type { PaymentMethod, PaymentMethodType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'
import { formatAmount, formatPaymentType } from '../utils/format'

const now = dayjs()

interface FormValues {
  name: string
  type: PaymentMethodType
}

const PaymentMethods: React.FC = () => {
  const qc = useQueryClient()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<PaymentMethod | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<PaymentMethod | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const { data: methods = [], isLoading } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  })

  const { data: stats = [], isLoading: statsLoading } = useQuery({
    queryKey: ['payment-methods-stats', year, month],
    queryFn: () => getPaymentMethodStats(year, month),
  })

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: { type: 'CREDIT_CARD' },
  })

  const createMutation = useMutation({
    mutationFn: createPaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      setModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormValues }) =>
      updatePaymentMethod(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      setModalOpen(false)
      setEditTarget(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deletePaymentMethod,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['payment-methods'] })
      setDeleteTarget(null)
    },
  })

  const openAdd = () => {
    setEditTarget(null)
    reset({ type: 'CREDIT_CARD' })
    setModalOpen(true)
  }

  const openEdit = (m: PaymentMethod) => {
    setEditTarget(m)
    setValue('name', m.name)
    setValue('type', m.type)
    setModalOpen(true)
  }

  const onSubmit = (values: FormValues) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body: values })
    } else {
      createMutation.mutate(values)
    }
  }

  const paymentTypeVariantMap: Record<PaymentMethodType, 'income' | 'buy' | 'inactive'> = {
    CREDIT_CARD: 'buy',
    DEBIT_CARD: 'income',
    CASH: 'inactive',
    BANK_TRANSFER: 'income',
    OTHER: 'inactive',
  }

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.year() - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">결제 수단</h2>
        <Button onClick={openAdd}>
          <Plus size={16} />
          결제 수단 추가
        </Button>
      </div>

      {/* Methods List */}
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card title="등록된 결제 수단">
          {methods.length === 0 ? (
            <p className="text-center text-gray-400 py-8">등록된 결제 수단이 없습니다.</p>
          ) : (
            <div className="space-y-2">
              {methods.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant={paymentTypeVariantMap[m.type]}>
                      {formatPaymentType(m.type)}
                    </Badge>
                    <span className="text-sm font-medium text-gray-800">{m.name}</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(m)}>
                      <Trash2 size={13} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Stats Section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">월별 사용 통계</h3>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {yearOptions.map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthOptions.map((m) => <option key={m} value={m}>{m}월</option>)}
          </select>
        </div>

        {statsLoading ? (
          <LoadingSpinner />
        ) : stats.length === 0 ? (
          <p className="text-center text-gray-400 py-8">사용 내역이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {stats.map((stat) => (
              <Card key={stat.paymentMethodId}>
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => setExpandedId(expandedId === stat.paymentMethodId ? null : stat.paymentMethodId)}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={paymentTypeVariantMap[stat.paymentMethodType]}>
                      {formatPaymentType(stat.paymentMethodType)}
                    </Badge>
                    <span className="font-medium text-gray-800">{stat.paymentMethodName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-500">{formatAmount(stat.totalAmount)}</span>
                    {expandedId === stat.paymentMethodId ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                </div>

                {expandedId === stat.paymentMethodId && stat.categories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mb-3">카테고리별 분류</p>
                    <div className="space-y-2">
                      {stat.categories.map((cat) => {
                        const pct = stat.totalAmount > 0 ? (cat.amount / stat.totalAmount) * 100 : 0
                        return (
                          <div key={cat.categoryId} className="flex items-center gap-3">
                            <span className="text-sm text-gray-600 w-24 shrink-0">{cat.categoryName}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-2">
                              <div
                                className="h-2 rounded-full bg-blue-400"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 w-24 text-right">
                              {formatAmount(cat.amount)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset() }}
        title={editTarget ? '결제 수단 수정' : '결제 수단 추가'}
        size="sm"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              {...register('name', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="예: 국민카드"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
            <select
              {...register('type', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="CREDIT_CARD">신용카드</option>
              <option value="DEBIT_CARD">체크카드</option>
              <option value="CASH">현금</option>
              <option value="BANK_TRANSFER">계좌이체</option>
              <option value="OTHER">기타</option>
            </select>
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

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`"${deleteTarget?.name}" 결제 수단을 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default PaymentMethods
