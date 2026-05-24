import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import dayjs from 'dayjs'
import { Plus, Trash2 } from 'lucide-react'
import { getBudgets, createBudget, deleteBudget } from '../api/budget'
import { getCategories } from '../api/categories'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import ProgressBar from '../components/ui/ProgressBar'
import { formatAmount, formatPercent } from '../utils/format'
import type { BudgetResponse } from '../types'

const now = dayjs()

interface FormValues {
  categoryId: number
  budgetAmount: number
}

const Budget: React.FC = () => {
  const qc = useQueryClient()
  const [year, setYear] = useState(now.year())
  const [month, setMonth] = useState(now.month() + 1)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BudgetResponse | null>(null)

  const { data: budgets = [], isLoading } = useQuery({
    queryKey: ['budgets', year, month],
    queryFn: () => getBudgets(year, month),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')
  const usedCategoryIds = new Set(budgets.map((b) => b.categoryId))
  const availableCategories = expenseCategories.filter((c) => !usedCategoryIds.has(c.id))

  const { register, handleSubmit, reset } = useForm<FormValues>()

  const createMutation = useMutation({
    mutationFn: (values: FormValues) =>
      createBudget({
        categoryId: Number(values.categoryId),
        year,
        month,
        budgetAmount: Number(values.budgetAmount),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setModalOpen(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBudget,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['budgets'] })
      setDeleteTarget(null)
    },
  })

  const yearOptions = Array.from({ length: 5 }, (_, i) => now.year() - 2 + i)
  const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1)

  const totalBudget = budgets.reduce((s, b) => s + b.budgetAmount, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spentAmount, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">예산 관리</h2>
        <Button onClick={() => setModalOpen(true)} disabled={availableCategories.length === 0}>
          <Plus size={16} />
          예산 추가
        </Button>
      </div>

      <div className="flex gap-3">
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

      {/* Summary */}
      <div className="flex gap-6 bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
        <div>
          <p className="text-xs text-gray-500">총 예산</p>
          <p className="text-lg font-bold text-gray-800">{formatAmount(totalBudget)}</p>
        </div>
        <div className="border-l border-gray-100 pl-6">
          <p className="text-xs text-gray-500">총 지출</p>
          <p className="text-lg font-bold text-red-500">{formatAmount(totalSpent)}</p>
        </div>
        <div className="border-l border-gray-100 pl-6">
          <p className="text-xs text-gray-500">잔여 예산</p>
          <p className={`text-lg font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {formatAmount(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : budgets.length === 0 ? (
        <div className="text-center text-gray-400 py-16">예산이 없습니다. 예산을 추가해보세요.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {budgets.map((budget) => (
            <Card key={budget.id}>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-800">{budget.categoryName}</h4>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${budget.usageRatio >= 100 ? 'text-red-500' : budget.usageRatio >= 80 ? 'text-yellow-500' : 'text-gray-500'}`}>
                    {formatPercent(budget.usageRatio)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteTarget(budget)}
                  >
                    <Trash2 size={13} className="text-red-400" />
                  </Button>
                </div>
              </div>
              <ProgressBar value={budget.usageRatio} className="mb-3" />
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-400">예산</p>
                  <p className="font-medium text-gray-700">{formatAmount(budget.budgetAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-400">지출</p>
                  <p className="font-medium text-red-500">{formatAmount(budget.spentAmount)}</p>
                </div>
                <div>
                  <p className="text-gray-400">잔여</p>
                  <p className={`font-medium ${budget.remainingAmount >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {formatAmount(budget.remainingAmount)}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="예산 추가">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 *</label>
            <select
              {...register('categoryId', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">선택하세요</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">예산 금액 *</label>
            <input
              type="number"
              {...register('budgetAmount', { required: true, min: 1 })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="0"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); reset() }}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>추가</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`"${deleteTarget?.categoryName}" 예산을 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default Budget
