import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, Pencil, Trash2, Landmark } from 'lucide-react'
import { getLoans, createLoan, updateLoan, deleteLoan, toggleLoanInclude } from '../api/loans'
import type { LoanResponse } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { formatAmount, formatDate } from '../utils/format'
import dayjs from 'dayjs'

interface FormValues {
  name: string
  lender?: string
  principal: number
  remainingBalance: number
  interestRate?: number
  startDate: string
  endDate?: string
  includeInAssets: boolean
  memo?: string
}

const Loans: React.FC = () => {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<LoanResponse | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<LoanResponse | null>(null)

  const { data: loans = [], isLoading } = useQuery({
    queryKey: ['loans'],
    queryFn: getLoans,
  })

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: {
      startDate: dayjs().format('YYYY-MM-DD'),
      includeInAssets: true,
    },
  })

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      createLoan({
        ...values,
        principal: Number(values.principal),
        remainingBalance: Number(values.remainingBalance),
        interestRate: values.interestRate ? Number(values.interestRate) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['assets-summary'] })
      setModalOpen(false)
      reset()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: FormValues }) =>
      updateLoan(id, {
        ...values,
        principal: Number(values.principal),
        remainingBalance: Number(values.remainingBalance),
        interestRate: values.interestRate ? Number(values.interestRate) : undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['assets-summary'] })
      setModalOpen(false)
      setEditTarget(null)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteLoan,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['assets-summary'] })
      setDeleteTarget(null)
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleLoanInclude,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['loans'] })
      qc.invalidateQueries({ queryKey: ['assets-summary'] })
    },
  })

  const openAdd = () => {
    setEditTarget(null)
    reset({ startDate: dayjs().format('YYYY-MM-DD'), includeInAssets: true })
    setModalOpen(true)
  }

  const openEdit = (loan: LoanResponse) => {
    setEditTarget(loan)
    setValue('name', loan.name)
    setValue('lender', loan.lender)
    setValue('principal', loan.principal)
    setValue('remainingBalance', loan.remainingBalance)
    setValue('interestRate', loan.interestRate)
    setValue('startDate', loan.startDate.substring(0, 10))
    setValue('endDate', loan.endDate?.substring(0, 10))
    setValue('includeInAssets', loan.includeInAssets)
    setValue('memo', loan.memo)
    setModalOpen(true)
  }

  const onSubmit = (values: FormValues) => {
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, values })
    } else {
      createMutation.mutate(values)
    }
  }

  const totalDebt = loans
    .filter((l) => l.includeInAssets)
    .reduce((s, l) => s + l.remainingBalance, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">대출</h2>
        <Button onClick={openAdd}>
          <Plus size={16} />
          대출 추가
        </Button>
      </div>

      {/* Summary */}
      <div className="flex gap-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div>
          <p className="text-xs text-gray-500">총 부채 (자산 포함 대상)</p>
          <p className="text-xl font-bold text-red-500">{formatAmount(totalDebt)}</p>
        </div>
        <div className="border-l border-gray-100 pl-6">
          <p className="text-xs text-gray-500">대출 건수</p>
          <p className="text-xl font-bold text-gray-700">{loans.length}건</p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : loans.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <Landmark size={48} strokeWidth={1} className="mx-auto mb-4" />
          <p>등록된 대출이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {loans.map((loan) => (
            <Card key={loan.id}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-800">{loan.name}</h4>
                  {loan.lender && (
                    <p className="text-xs text-gray-500">{loan.lender}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(loan)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(loan)}>
                    <Trash2 size={13} className="text-red-400" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                <div>
                  <p className="text-gray-400">원금</p>
                  <p className="font-medium text-gray-700">{formatAmount(loan.principal)}</p>
                </div>
                <div>
                  <p className="text-gray-400">잔여 잔액</p>
                  <p className="font-medium text-red-500">{formatAmount(loan.remainingBalance)}</p>
                </div>
                {loan.interestRate !== undefined && (
                  <div>
                    <p className="text-gray-400">이자율</p>
                    <p className="font-medium text-gray-700">{loan.interestRate}%</p>
                  </div>
                )}
                <div>
                  <p className="text-gray-400">만기일</p>
                  <p className="font-medium text-gray-700">
                    {loan.endDate ? formatDate(loan.endDate) : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">시작일</p>
                  <p className="font-medium text-gray-700">{formatDate(loan.startDate)}</p>
                </div>
              </div>

              {loan.memo && (
                <p className="text-xs text-gray-400 mb-3">{loan.memo}</p>
              )}

              {/* Toggle Include in Assets */}
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  className={`relative w-10 h-5 rounded-full transition-colors ${
                    loan.includeInAssets ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                  onClick={() => toggleMutation.mutate(loan.id)}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                      loan.includeInAssets ? 'translate-x-5' : 'translate-x-0.5'
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-600">자산 계산에 포함</span>
              </label>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); reset() }}
        title={editTarget ? '대출 수정' : '대출 추가'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
              <input
                type="text"
                {...register('name', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="예: 주택담보대출"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">대출기관</label>
              <input
                type="text"
                {...register('lender')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="예: KB국민은행"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">원금 *</label>
              <input
                type="number"
                {...register('principal', { required: true, min: 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">잔여 잔액 *</label>
              <input
                type="number"
                {...register('remainingBalance', { required: true, min: 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이자율 (%)</label>
              <input
                type="number"
                step="0.01"
                {...register('interestRate', { min: 0 })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작일 *</label>
              <input
                type="date"
                {...register('startDate', { required: true })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">만기일</label>
              <input
                type="date"
                {...register('endDate')}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              {...register('memo')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="includeInAssets"
              {...register('includeInAssets')}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="includeInAssets" className="text-sm text-gray-700">
              자산 계산에 포함
            </label>
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
        message={`"${deleteTarget?.name}" 대출을 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default Loans
