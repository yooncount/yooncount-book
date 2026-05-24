import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { settingsApi } from '../api/settings'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { CheckCircle, XCircle, ExternalLink, Key, Trash2 } from 'lucide-react'

const Settings: React.FC = () => {
  const queryClient = useQueryClient()
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const { data: status, isLoading } = useQuery({
    queryKey: ['settings-finnhub-key'],
    queryFn: settingsApi.getFinnhubKeyStatus,
  })

  const saveMutation = useMutation({
    mutationFn: (key: string) => settingsApi.setFinnhubApiKey(key),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-finnhub-key'] })
      setApiKeyInput('')
      setMessage({ type: 'success', text: 'API 키가 저장되었습니다.' })
      setTimeout(() => setMessage(null), 3000)
    },
    onError: () => {
      setMessage({ type: 'error', text: 'API 키 저장에 실패했습니다.' })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: settingsApi.deleteFinnhubApiKey,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings-finnhub-key'] })
      setMessage({ type: 'success', text: 'API 키가 삭제되었습니다.' })
      setTimeout(() => setMessage(null), 3000)
    },
    onError: () => {
      setMessage({ type: 'error', text: 'API 키 삭제에 실패했습니다.' })
    },
  })

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!apiKeyInput.trim()) return
    saveMutation.mutate(apiKeyInput.trim())
  }

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">설정</h1>

      <Card>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Key className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">Finnhub API 키</h2>
          </div>

          <p className="text-sm text-gray-600">
            주식 현재가 조회 기능을 사용하려면 Finnhub API 키가 필요합니다.{' '}
            <a
              href="https://finnhub.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              finnhub.io
              <ExternalLink className="w-3 h-3" />
            </a>
            에서 무료로 발급받을 수 있습니다. (무료 플랜: 분당 60회 요청)
          </p>

          <div className="flex items-center gap-2">
            {status?.configured ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">API 키가 등록되어 있습니다.</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-sm font-medium text-red-600">API 키가 등록되지 않았습니다.</span>
              </>
            )}
          </div>

          {message && (
            <div
              className={`text-sm px-3 py-2 rounded ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSave} className="flex gap-2">
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={status?.configured ? '새 API 키를 입력하면 덮어씁니다' : 'Finnhub API 키를 입력하세요'}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!apiKeyInput.trim() || saveMutation.isPending}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveMutation.isPending ? '저장 중...' : '저장'}
            </button>
            {status?.configured && (
              <button
                type="button"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
                className="px-3 py-2 border border-red-300 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center gap-1"
              >
                <Trash2 className="w-4 h-4" />
                삭제
              </button>
            )}
          </form>

          <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">발급 방법</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>
                <a href="https://finnhub.io" target="_blank" rel="noopener noreferrer" className="underline">
                  finnhub.io
                </a>
                에서 회원가입
              </li>
              <li>Dashboard → API Key 복사</li>
              <li>위 입력창에 붙여넣기 후 저장</li>
            </ol>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default Settings
