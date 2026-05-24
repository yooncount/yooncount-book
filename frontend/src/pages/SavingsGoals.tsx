import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm, Controller } from 'react-hook-form'
import dayjs from 'dayjs'
import { Plus, Pencil, Trash2, CheckCircle, PlusCircle } from 'lucide-react'
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  depositSavingsGoal,
  toggleSavingsGoalComplete,
} from '../api/savings'
import type { SavingsGoal } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import Badge from '../components/ui/Badge'
import ProgressBar from '../components/ui/ProgressBar'
import AmountInput from '../components/ui/AmountInput'
import { formatAmount, formatDate, formatPercent } from '../utils/format'

interface GoalFormValues {
  name: string
  targetAmount: number
  targetDate: string
  memo?: string
}

interface DepositFormValues {
  amount: number
}

const SavingsGoals: React.FC = () => {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [depositModalOpen, setDepositModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<SavingsGoal | null>(null)
  const [depositTarget, setDepositTarget] = useState<SavingsGoal | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavingsGoal | null>(null)

  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['savings-goals'],
    queryFn: getSavingsGoals,
  })

  const { register: registerGoal, handleSubmit: handleSubmitGoal, reset: resetGoal, setValue, control: controlGoal } = useForm<GoalFormValues>({
    defaultValues: { targetDate: dayjs().add(1, 'year').format('YYYY-MM-DD') },
  })

  const { handleSubmit: handleSubmitDeposit, reset: resetDeposit, control: controlDeposit } = useForm<DepositFormValues>()

  const createMutation = useMutation({
    mutationFn: createSavingsGoal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings-goals'] }); setModalOpen(false); resetGoal() },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, body }: { id: number; body: GoalFormValues }) =>
      updateSavingsGoal(id, { ...body, targetAmount: Number(body.targetAmount) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      setModalOpen(false)
      setEditTarget(null)
      resetGoal()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteSavingsGoal,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['savings-goals'] }); setDeleteTarget(null) },
  })

  const depositMutation = useMutation({
    mutationFn: ({ id, amount }: { id: number; amount: number }) => depositSavingsGoal(id, amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['savings-goals'] })
      setDepositModalOpen(false)
      setDepositTarget(null)
      resetDeposit()
    },
  })

  const toggleMutation = useMutation({
    mutationFn: toggleSavingsGoalComplete,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['savings-goals'] }),
  })

  const openAdd = () => {
    setEditTarget(null)
    resetGoal({ targetDate: dayjs().add(1, 'year').format('YYYY-MM-DD') })
    setModalOpen(true)
  }

  const openEdit = (goal: SavingsGoal) => {
    setEditTarget(goal)
    setValue('name', goal.name)
    setValue('targetAmount', goal.targetAmount)
    setValue('targetDate', goal.targetDate.substring(0, 10))
    setValue('memo', goal.memo)
    setModalOpen(true)
  }

  const openDeposit = (goal: SavingsGoal) => {
    setDepositTarget(goal)
    resetDeposit()
    setDepositModalOpen(true)
  }

  const onSubmitGoal = (values: GoalFormValues) => {
    const body = { ...values, targetAmount: Number(values.targetAmount) }
    if (editTarget) {
      updateMutation.mutate({ id: editTarget.id, body: values })
    } else {
      createMutation.mutate(body)
    }
  }

  const onSubmitDeposit = (values: DepositFormValues) => {
    if (!depositTarget) return
    depositMutation.mutate({ id: depositTarget.id, amount: Number(values.amount) })
  }

  const activeGoals = goals.filter((g) => !g.isCompleted)
  const completedGoals = goals.filter((g) => g.isCompleted)

  const getDaysRemaining = (targetDate: string) => {
    const diff = dayjs(targetDate).diff(dayjs(), 'day')
    return diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">저축 목표</h2>
        <Button onClick={openAdd}>
          <Plus size={16} />
          목표 추가
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          {/* Active Goals */}
          <div>
            <h3 className="text-sm font-semibold text-gray-500 mb-3">진행 중 ({activeGoals.length})</h3>
            {activeGoals.length === 0 ? (
              <p className="text-center text-gray-400 py-8">진행 중인 목표가 없습니다.</p>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {activeGoals.map((goal) => (
                  <Card key={goal.id}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-800">{goal.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400">{formatDate(goal.targetDate)}</span>
                          <span className={`text-xs font-medium ${dayjs(goal.targetDate).diff(dayjs(), 'day') < 30 ? 'text-red-500' : 'text-blue-500'}`}>
                            {getDaysRemaining(goal.targetDate)}
                          </span>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-blue-600">{formatPercent(goal.progressRate)}</span>
                    </div>

                    <ProgressBar value={goal.progressRate} className="mb-3" />

                    <div className="flex justify-between text-xs text-gray-500 mb-4">
                      <span>적립: {formatAmount(goal.savedAmount)}</span>
                      <span>목표: {formatAmount(goal.targetAmount)}</span>
                    </div>
                    <div className="mb-4 text-xs text-gray-500">
                      잔여: <span className="text-orange-500 font-medium">{formatAmount(goal.remainingAmount)}</span>
                    </div>

                    {goal.memo && (
                      <p className="text-xs text-gray-400 mb-4">{goal.memo}</p>
                    )}

                    <div className="flex items-center gap-1.5">
                      <Button size="sm" variant="secondary" onClick={() => openDeposit(goal)}>
                        <PlusCircle size={13} />
                        적립하기
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate(goal.id)}>
                        <CheckCircle size={13} />
                        완료
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(goal)}>
                        <Pencil size={13} />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(goal)}>
                        <Trash2 size={13} className="text-red-400" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-500 mb-3">완료됨 ({completedGoals.length})</h3>
              <div className="grid grid-cols-2 gap-4">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-70">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-700">{goal.name}</h4>
                      <Badge variant="active">완료</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      {formatAmount(goal.savedAmount)} / {formatAmount(goal.targetAmount)}
                    </p>
                    <div className="flex items-center gap-1.5 mt-3">
                      <Button size="sm" variant="ghost" onClick={() => toggleMutation.mutate(goal.id)}>
                        재개
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleteTarget(goal)}>
                        <Trash2 size={13} className="text-red-400" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditTarget(null); resetGoal() }}
        title={editTarget ? '목표 수정' : '저축 목표 추가'}
        size="sm"
      >
        <form onSubmit={handleSubmitGoal(onSubmitGoal)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">목표 이름 *</label>
            <input
              type="text"
              {...registerGoal('name', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="예: 여행 자금"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">목표 금액 *</label>
            <Controller
              control={controlGoal}
              name="targetAmount"
              rules={{ required: '목표 금액을 입력하세요', min: { value: 1, message: '1 이상' } }}
              render={({ field }) => (
                <AmountInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="0"
                />
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">목표 날짜 *</label>
            <input
              type="date"
              {...registerGoal('targetDate', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
            <textarea
              {...registerGoal('memo')}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none"
              rows={2}
              placeholder="메모 (선택)"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditTarget(null); resetGoal() }}>
              취소
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {editTarget ? '수정' : '추가'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Deposit Modal */}
      <Modal
        isOpen={depositModalOpen}
        onClose={() => { setDepositModalOpen(false); setDepositTarget(null); resetDeposit() }}
        title={`${depositTarget?.name} 적립`}
        size="sm"
      >
        <form onSubmit={handleSubmitDeposit(onSubmitDeposit)} className="space-y-4">
          <p className="text-sm text-gray-600">
            현재 적립: {formatAmount(depositTarget?.savedAmount ?? 0)} /
            목표: {formatAmount(depositTarget?.targetAmount ?? 0)}
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">적립 금액 *</label>
            <Controller
              control={controlDeposit}
              name="amount"
              rules={{ required: '적립 금액을 입력하세요', min: { value: 1, message: '1 이상' } }}
              render={({ field }) => (
                <AmountInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="0"
                />
              )}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setDepositModalOpen(false); resetDeposit() }}>
              취소
            </Button>
            <Button type="submit" disabled={depositMutation.isPending}>적립</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}
        message={`"${deleteTarget?.name}" 목표를 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default SavingsGoals
