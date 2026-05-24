import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Shield, User as UserIcon, Mail, Calendar, Clock } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { changePassword } from '../api/auth'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import type { PasswordChangeRequest } from '../types'

const Profile: React.FC = () => {
  const { user, logout } = useAuth()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<PasswordChangeRequest>()
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (!user) return null

  const onSubmit = async (values: PasswordChangeRequest) => {
    setSubmitting(true)
    setMessage(null)
    try {
      await changePassword(values)
      setMessage({ type: 'success', text: '비밀번호가 변경되었습니다.' })
      reset()
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message })
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleString('ko-KR') : '-'

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-900">내 프로필</h2>

      <Card>
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
            <span className="text-xl font-bold text-blue-600">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
          {user.role === 'ADMIN' && (
            <span className="ml-auto inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2 py-1 rounded-md">
              <Shield size={12} /> 관리자
            </span>
          )}
        </div>

        <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2 text-gray-600">
            <UserIcon size={14} className="text-gray-400" />
            <span className="text-gray-400 w-24">이름</span>
            <span>{user.name}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Mail size={14} className="text-gray-400" />
            <span className="text-gray-400 w-24">이메일</span>
            <span>{user.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-gray-400 w-24">가입일</span>
            <span>{formatDate(user.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock size={14} className="text-gray-400" />
            <span className="text-gray-400 w-24">마지막 로그인</span>
            <span>{formatDate(user.lastLoginAt)}</span>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-gray-900 mb-4">비밀번호 변경</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">현재 비밀번호</label>
            <input
              type="password"
              autoComplete="current-password"
              {...register('currentPassword', { required: '현재 비밀번호를 입력하세요' })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            {errors.currentPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">새 비밀번호</label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('newPassword', {
                required: '새 비밀번호를 입력하세요',
                minLength: { value: 8, message: '8자 이상' },
                maxLength: { value: 64, message: '64자 이하' },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            {errors.newPassword && (
              <p className="text-xs text-red-500 mt-1">{errors.newPassword.message}</p>
            )}
          </div>
          {message && (
            <div className={`text-xs rounded-lg p-2.5 border ${
              message.type === 'success'
                ? 'bg-green-50 border-green-100 text-green-700'
                : 'bg-red-50 border-red-100 text-red-600'
            }`}>
              {message.text}
            </div>
          )}
          <Button type="submit" disabled={submitting}>
            {submitting ? '변경 중...' : '비밀번호 변경'}
          </Button>
        </form>
      </Card>

      <Card>
        <h3 className="text-base font-semibold text-gray-900 mb-3">로그아웃</h3>
        <p className="text-sm text-gray-500 mb-4">이 기기에서 로그아웃합니다.</p>
        <Button variant="secondary" onClick={logout}>로그아웃</Button>
      </Card>
    </div>
  )
}

export default Profile
