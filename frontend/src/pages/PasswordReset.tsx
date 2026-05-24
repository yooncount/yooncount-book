import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { lookupSecurityQuestion, resetPassword } from '../api/auth'
import Button from '../components/ui/Button'

interface Step1Form { email: string }
interface Step2Form { securityAnswer: string }

const PasswordReset: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [email, setEmail] = useState('')
  const [question, setQuestion] = useState('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const step1 = useForm<Step1Form>()
  const step2 = useForm<Step2Form>()

  const onLookup = async ({ email: e }: Step1Form) => {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      const q = await lookupSecurityQuestion(e)
      setEmail(e)
      setQuestion(q)
      setStep(2)
    } catch (err) {
      setErrorMsg((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const onReset = async ({ securityAnswer }: Step2Form) => {
    setSubmitting(true)
    setErrorMsg(null)
    try {
      await resetPassword({ email, securityAnswer })
      setStep(3)
    } catch (err) {
      setErrorMsg((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-blue-600">YoonCount Book</h1>
          <p className="text-xs text-gray-400 mt-1">비밀번호 초기화</p>
        </div>

        {step === 1 && (
          <form onSubmit={step1.handleSubmit(onLookup)} className="space-y-4">
            <p className="text-xs text-gray-500">
              아이디를 입력하면 등록된 보안 질문이 나타납니다.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
              <input
                type="text"
                autoComplete="username"
                {...step1.register('email', { required: '아이디를 입력하세요' })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              {step1.formState.errors.email && (
                <p className="text-xs text-red-500 mt-1">{step1.formState.errors.email.message}</p>
              )}
            </div>
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg p-2.5">
                {errorMsg}
              </div>
            )}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? '조회 중...' : '다음'}
            </Button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={step2.handleSubmit(onReset)} className="space-y-4">
            <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
              <p className="text-xs text-gray-400">아이디</p>
              <p className="text-sm font-medium text-gray-800">{email}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-1">보안 질문</p>
              <p className="text-sm text-gray-600 bg-blue-50 border border-blue-100 rounded-lg p-2.5">
                {question}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">보안 답변</label>
              <input
                type="text"
                {...step2.register('securityAnswer', { required: '답변을 입력하세요' })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                autoFocus
              />
              {step2.formState.errors.securityAnswer && (
                <p className="text-xs text-red-500 mt-1">{step2.formState.errors.securityAnswer.message}</p>
              )}
            </div>
            {errorMsg && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg p-2.5">
                {errorMsg}
              </div>
            )}
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? '초기화 중...' : '비밀번호 초기화'}
            </Button>
          </form>
        )}

        {step === 3 && (
          <div className="space-y-4 text-center">
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <p className="text-sm font-medium text-green-700">비밀번호가 초기화되었습니다.</p>
              <p className="text-xs text-green-600 mt-2">
                새 비밀번호: <span className="font-mono font-bold">0000</span>
              </p>
              <p className="text-xs text-gray-500 mt-3">
                로그인 후 즉시 비밀번호를 변경하세요.
              </p>
            </div>
            <Button onClick={() => navigate('/login', { replace: true })} className="w-full">
              로그인 페이지로
            </Button>
          </div>
        )}

        <p className="text-xs text-gray-500 text-center mt-6">
          <Link to="/login" className="text-gray-400 hover:text-gray-600 hover:underline">
            로그인으로 돌아가기
          </Link>
        </p>
      </div>
    </div>
  )
}

export default PasswordReset
