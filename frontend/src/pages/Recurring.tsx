import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import { Plus, Pencil, Trash2, Play, ToggleLeft, ToggleRight } from 'lucide-react'
import {
  getRecurringTransactions,
  createRecurringTransaction,
  updateRecurringTransaction,
  deleteRecurringTransaction,
  toggleRecurringActive,
  applyRecurringThisMonth,
} from '../api/recurring'
import { getCategories } from '../api/categories'
import { getPaymentMethods } from '../api/payment'
import type { RecurringTransaction, TransactionType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'
import AmountInput from '../components/ui/AmountInput'
import { formatAmount, formatPaymentType } from '../utils/format'
import dayjs from 'dayjs'

interface FormValues {
  name: string
  type: TransactionType
  categoryId: number
  paymentMethodId?: number
  amount: number
  description?: string
  dayOfMonth: number
  startDate: string
  endDate?: string
}

const Recurring: React.FC = () => {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<RecurringTransaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<RecurringTransaction | null>(null)

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['recurring'],
    queryFn: getRecurringTransactions,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  })

  const { register, handleSubmit, reset, setValue, watch, control } = useForm<FormValues>({
    defaultValues: {
      type: 'EXPENSE',
      dayOfMonth: 1,
      startDate: dayjs().format('YYYY-MM-DD'),
    },
  })

  const selectedType = watch('type')
  const filteredCategories = categories.filter((c) => c.type === selectedType)

  const createMutation = useMutation({
    mutationFn: createRecurringTransaction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setModalOpen(false); reset() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: FormValues }) =>
      updateRecurringTransaction(id, {
        ...body,
        categoryId: Number(body.categoryId),
        paymentMethodId: body.paymentMethodId ? Number(body.paymentMethodId) : undefined,
        amount: Number(body.amount),
        dayOfMonth: Number(body.dayOfMonth),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      setModalOpen(false)
      setEditTarget(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteRecurringTransaction,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['recurring'] }); setDeleteTarget(null) },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleRecurringActive,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['recurring'] }),
  })

  const applyMutation = useMutation({
    mutationFn: applyRecurringThisMonth,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['recurring'] })
      qc.invalidateQueries({ queryKey: ['transactions'] })
    },
  })

  const openAdd = () => {
    setEditTarget(null)
    reset({ type: 'EXPENSE', dayOfMonth: 1, startDate: dayjs().format('YYYY-MM-DD') })
    setModalOpen(true)
  }

  const openEdit = (item: RecurringTransaction) => {
    setEditTarget(item)
    setValue('name', item.name)
    setValue('type', item.type)
    setValue('categoryId', item.categoryId)
    setValue('paymentMethodId', item.paymentMethodId)
    setValue('amount', item.amount)
    setValue('description', item.description)
    setValue('dayOfMonth', item.dayOfMonth)
    setValue('startDate', item.startDate.substring(0, 10))
    setValue('endDate', item.endDate?.substring(0, 10))
    setModalOpen(true)
  }

  const onSubmit = (values: FormValues) => {
    const body = {
      ...values,
      categoryId: Number(values.categoryId),
      paymentMethodId: values.paymentMethodId ? Number(values.paymentMethodId) : undefined,
      amount: Number(values.amount),
      dayOfMonth: Number(values.dayOfMonth),
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
        <h2 className="text-2xl font-bold text-gray-900">정기 거래</h2>
        <Button onClick={openAdd}>
          <Plus size={16} />
          정기 거래 추가
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <p className="text-center text-gray-400 py-16">등록된 정기 거래가 없습니다.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={item.type === 'INCOME' ? 'income' : 'expense'}>
                    {item.type === 'INCOME' ? '수입' : '지출'}
                  </Badge>
                  <Badge variant={item.isActive ? 'active' : 'inactive'}>
                    {item.isActive ? '활성' : '비활성'}
                  </Badge>
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.categoryName}
                      {item.paymentMethodName && ` · ${item.paymentMethodName}`}
                      {item.description && ` · ${item.description}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-semibold ${item.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                      {formatAmount(item.amount)}
                    </p>
                    <p className="text-xs text-gray-400">매월 {item.dayOfMonth}일</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => applyMutation.mutate(item.id)}
                      title="이번 달 적용"
                    >
                      <Play size={13} className="text-blue-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMutation.mutate(item.id)}
                      title={item.isActive ? '비활성화' : '활성화'}
                    >
                      {item.isActive
                        ? <ToggleRight size={16} className="text-green-500" />
                        : <ToggleLeft size={16} className="text-gray-400" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(item)}>
                      <Trash2 size={13} className="text-red-400" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset() }}
        title={editTarget ? '정기 거래 수정' : '정기 거래 추가'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="정기 거래 이름"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
              <select
                {...register('type', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="EXPENSE">지출</option>
                <option value="INCOME">수입</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
              <select
                {...register('categoryId', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">선택하세요</option>
                {filteredCategories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">결제 수단</label>
              <select
                {...register('paymentMethodId')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="">없음</option>
                {paymentMethods.map((p) => (
                  <option key={p.id} value={p.id}>{p.name} ({formatPaymentType(p.type)})</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">금액 *</label>
              <Controller
                control={control}
                name="amount"
                rules={{ required: '금액을 입력하세요', min: { value: 1, message: '1원 이상' } }}
                render={({ field }) => (
                  <AmountInput value={field.value} onChange={field.onChange} onBlur={field.onBlur} placeholder="0" />
                )}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">매월 몇 일 *</label>
              <input
                type="number"
                {...register('dayOfMonth', { required: true, min: 1, max: 31 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="1~31"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <input
              type="text"
              {...register('description')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="내용 (선택)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
              <input
                type="date"
                {...register('startDate', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료일</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
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
        message={`"${deleteTarget?.name}" 정기 거래를 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default Recurring
