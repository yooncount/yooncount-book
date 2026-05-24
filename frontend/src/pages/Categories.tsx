import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { Plus, X } from 'lucide-react'
import { getCategories, createCategory, deleteCategory } from '../api/categories'
import type { TransactionType } from '../types'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import LoadingSpinner from '../components/ui/LoadingSpinner'

interface FormValues {
  name: string
  type: TransactionType
}

const Categories: React.FC = () => {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null)

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  })

  const { register, handleSubmit, reset } = useForm<FormValues>({
    defaultValues: { type: 'EXPENSE' },
  })

  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setModalOpen(false)
      reset()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['categories'] })
      setDeleteTarget(null)
    },
  })

  const incomeCategories = categories.filter((c) => c.type === 'INCOME')
  const expenseCategories = categories.filter((c) => c.type === 'EXPENSE')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">카테고리</h2>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          카테고리 추가
        </Button>
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="space-y-6">
          {/* Income Categories */}
          <Card title="수입 카테고리">
            {incomeCategories.length === 0 ? (
              <p className="text-sm text-gray-400">수입 카테고리가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 text-sm"
                  >
                    <span>{c.name}</span>
                    {c.isDefault ? (
                      <span
                        className="text-green-400 cursor-default"
                        title="기본 카테고리는 삭제할 수 없습니다"
                      >
                        <X size={13} className="opacity-30" />
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                        className="text-green-500 hover:text-red-500 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Expense Categories */}
          <Card title="지출 카테고리">
            {expenseCategories.length === 0 ? (
              <p className="text-sm text-gray-400">지출 카테고리가 없습니다.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full px-3 py-1.5 text-sm"
                  >
                    <span>{c.name}</span>
                    {c.isDefault ? (
                      <span
                        className="text-red-400 cursor-default"
                        title="기본 카테고리는 삭제할 수 없습니다"
                      >
                        <X size={13} className="opacity-30" />
                      </span>
                    ) : (
                      <button
                        onClick={() => setDeleteTarget({ id: c.id, name: c.name })}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); reset() }} title="카테고리 추가">
        <form onSubmit={handleSubmit((v) => createMutation.mutate(v))} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">이름 *</label>
            <input
              type="text"
              {...register('name', { required: true })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="카테고리 이름"
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
        message={`"${deleteTarget?.name}" 카테고리를 삭제하시겠습니까?`}
      />
    </div>
  )
}

export default Categories
