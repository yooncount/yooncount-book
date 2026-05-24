import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} from '../api/transactions'
import { getCategories } from '../api/categories'
import { getPaymentMethods } from '../api/payment'
import type { Transaction, TransactionCreateRequest, TransactionType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'
import { formatAmount, formatDate, formatPaymentType } from '../utils/format'

const now = dayjs()

interface FormValues {
  amount: number
  type: TransactionType
  categoryId: number
  paymentMethodId?: number
  description?: string
  transactionDate: string
}

const Transactions: React.FC = () => {
  const qc = useQueryClient()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<number | undefined>()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Transaction | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null)

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions', year, month, typeFilter, categoryFilter],
    queryFn: () =>
      getTransactions({
        year,
        month,
        type: typeFilter === 'ALL' ? undefined : typeFilter,
        categoryId: categoryFilter,
      }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['payment-methods'],
    queryFn: getPaymentMethods,
  })

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormValues>({
    defaultValues: {
      type: 'EXPENSE',
      transactionDate: dayjs().format('YYYY-MM-DD'),
    },
  })

  const selectedType = watch('type')

  const createMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['statistics-monthly'] })
      setModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: TransactionCreateRequest }) =>
      updateTransaction(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['statistics-monthly'] })
      setModalOpen(false)
      setEditTarget(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['statistics-monthly'] })
      setDeleteTarget(null)
    },
  })

  const openAdd = () => {
    setEditTarget(null)
    reset({ type: 'EXPENSE', transactionDate: dayjs().format('YYYY-MM-DD') })
    setModalOpen(true)
  }

  const openEdit = (tx: Transaction) => {
    setEditTarget(tx)
    setValue('amount', tx.amount)
    setValue('type', tx.type)
    setValue('categoryId', tx.categoryId)
    setValue('paymentMethodId', tx.paymentMethodId)
    setValue('description', tx.description)
    setValue('transactionDate', formatDate(tx.transactionDate))
    setModalOpen(true)
  }

  const onSubmit = (values: FormValues) => {
    const body: TransactionCreateRequest = {
      ...values,
      amount: Number(values.amount),
      categoryId: Number(values.categoryId),
      paymentMethodId: values.paymentMethodId ? Number(values.paymentMethodId) : undefined,
    }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body })
    } else {
      createMutation.mutate(body)
    }
  }

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0)

  const filteredCategories = categories.filter((c) =>
    selectedType ? c.type === selectedType : true
  )

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.year() - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">거래 관리</h2>
        <Button onClick={openAdd}>
          <Plus size={16} />
          거래 추가
        </Button>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearOptions.map((y) => (
            <option key={y} value={y}>{y}년</option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={month}
          onChange={(e) => setMonth(Number(e.target.value))}
        >
          {monthOptions.map((m) => (
            <option key={m} value={m}>{m}월</option>
          ))}
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'ALL' | TransactionType)}
        >
          <option value="ALL">전체</option>
          <option value="INCOME">수입</option>
          <option value="EXPENSE">지출</option>
        </select>
        <select
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm"
          value={categoryFilter ?? ''}
          onChange={(e) =>
            setCategoryFilter(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">전체 카테고리</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {/* Summary */}
      <div className="flex gap-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div>
          <p className="text-xs text-gray-500">총 수입</p>
          <p className="text-lg font-bold text-green-600">{formatAmount(totalIncome)}</p>
        </div>
        <div className="border-l border-gray-100 pl-6">
          <p className="text-xs text-gray-500">총 지출</p>
          <p className="text-lg font-bold text-red-500">{formatAmount(totalExpense)}</p>
        </div>
        <div className="border-l border-gray-100 pl-6">
          <p className="text-xs text-gray-500">순 저축</p>
          <p className={`text-lg font-bold ${totalIncome - totalExpense >= 0 ? 'text-blue-600' : 'text-red-500'}`}>
            {formatAmount(totalIncome - totalExpense)}
          </p>
        </div>
        <div className="border-l border-gray-100 pl-6">
          <p className="text-xs text-gray-500">건수</p>
          <p className="text-lg font-bold text-gray-700">{transactions.length}건</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <Card>
          {transactions.length === 0 ? (
            <p className="text-center text-gray-400 py-12">거래 내역이 없습니다.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="pb-3 font-medium">날짜</th>
                    <th className="pb-3 font-medium">내용</th>
                    <th className="pb-3 font-medium">카테고리</th>
                    <th className="pb-3 font-medium">결제 수단</th>
                    <th className="pb-3 font-medium text-right">금액</th>
                    <th className="pb-3 font-medium text-right">관리</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-3 text-gray-500">{formatDate(tx.transactionDate)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={tx.type === 'INCOME' ? 'income' : 'expense'}>
                            {tx.type === 'INCOME' ? '수입' : '지출'}
                          </Badge>
                          <span className="text-gray-800">{tx.description || '-'}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-600">{tx.categoryName}</td>
                      <td className="py-3 text-gray-500">
                        {tx.paymentMethodName
                          ? `${tx.paymentMethodName}${tx.paymentMethodType ? ` (${formatPaymentType(tx.paymentMethodType)})` : ''}`
                          : '-'}
                      </td>
                      <td className={`py-3 text-right font-semibold ${tx.type === 'INCOME' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatAmount(tx.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(tx)}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(tx)}>
                            <Trash2 size={13} className="text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset() }}
        title={editTarget ? '거래 수정' : '거래 추가'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">유형 *</label>
              <select
                {...register('type', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              >
                <option value="INCOME">수입</option>
                <option value="EXPENSE">지출</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">금액 *</label>
              <input
                type="number"
                {...register('amount', { required: true, min: 1 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
          </div>
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
                <option key={p.id} value={p.id}>
                  {p.name} ({formatPaymentType(p.type)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">내용</label>
            <input
              type="text"
              {...register('description')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="거래 내용을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">날짜 *</label>
            <input
              type="date"
              {...register('transactionDate', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setModalOpen(false); setEditTarget(null); reset() }}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`"${deleteTarget?.description || deleteTarget?.categoryName}" 거래를 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default Transactions
