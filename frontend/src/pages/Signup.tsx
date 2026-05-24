import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../auth/AuthContext'
import Button from '../components/ui/Button'
import type { SignupRequest } from '../types'

const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const { register, handleSubmit, formState: { errors } } = useForm<SignupRequest>()
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = async (values: SignupRequest) => {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      await signup(values)
      navigate('/', { replace: true })
    } catch (e) {
      setErrorMsg((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-blue-600">YoonCount Book</h1>
          <p className="text-xs text-gray-400 mt-1">회원가입</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <input
              type="text"
              autoComplete="name"
              {...register('name', { required: '이름을 입력하세요', maxLength: { value: 100, message: '100자 이하' } })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
            <input
              type="email"
              autoComplete="email"
              {...register('email', {
                required: '이메일을 입력하세요',
                pattern: { value: /.+@.+/, message: '올바른 이메일 형식이 아닙니다' },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
            <input
              type="password"
              autoComplete="new-password"
              {...register('password', {
                required: '비밀번호를 입력하세요',
                minLength: { value: 8, message: '8자 이상' },
                maxLength: { value: 64, message: '64자 이하' },
              })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {errorMsg && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg p-2.5">
              {errorMsg}
            </div>
          )}

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <p className="text-xs text-gray-500 text-center mt-6">
          이미 계정이 있으신가요?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">로그인</Link>
        </p>
      </div>
    </div>
  )
}

export default Signup
