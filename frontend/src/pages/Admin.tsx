import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Users, AlertTriangle, BarChart3, ChevronDown, ChevronRight, Shield } from 'lucide-react'
import {
  getAdminStats,
  getAdminUsers,
  getErrorLogs,
  type ErrorLogEntry,
} from '../api/admin'
import Card from '../components/ui/Card'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const formatDate = (iso?: string) => (iso ? new Date(iso).toLocaleString('ko-KR') : '-')

const StatsSection: React.FC = () => {
  const { data, isLoading } = useQuery({ queryKey: ['admin', 'stats'], queryFn: getAdminStats })
  if (isLoading) return <LoadingSpinner />
  if (!data) return null

  const items = [
    { label: '총 사용자', value: data.totalUsers },
    { label: '신규 (7일)', value: data.newUsers7d },
    { label: '신규 (30일)', value: data.newUsers30d },
    { label: '활성 (30일)', value: data.activeUsers30d },
    { label: '총 거래 수', value: data.totalTransactions },
    { label: '에러 (7일)', value: data.totalErrors7d, danger: data.totalErrors7d > 0 },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map((it) => (
        <div key={it.label} className="bg-white border border-gray-100 rounded-xl p-4">
          <p className="text-xs text-gray-500">{it.label}</p>
          <p className={`text-2xl font-bold mt-1 ${it.danger ? 'text-red-500' : 'text-gray-900'}`}>
            {it.value.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  )
}

const UsersSection: React.FC = () => {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: getAdminUsers,
  })

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="py-2 px-3 font-medium">ID</th>
            <th className="py-2 px-3 font-medium">이메일</th>
            <th className="py-2 px-3 font-medium">이름</th>
            <th className="py-2 px-3 font-medium">역할</th>
            <th className="py-2 px-3 font-medium">가입일</th>
            <th className="py-2 px-3 font-medium">마지막 로그인</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50">
              <td className="py-2 px-3 text-gray-500">{u.id}</td>
              <td className="py-2 px-3">{u.email}</td>
              <td className="py-2 px-3">{u.name}</td>
              <td className="py-2 px-3">
                {u.role === 'ADMIN' ? (
                  <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-xs font-medium px-2 py-0.5 rounded">
                    <Shield size={10} /> ADMIN
                  </span>
                ) : (
                  <span className="text-xs text-gray-500">USER</span>
                )}
              </td>
              <td className="py-2 px-3 text-gray-600 text-xs">{formatDate(u.createdAt)}</td>
              <td className="py-2 px-3 text-gray-600 text-xs">{formatDate(u.lastLoginAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const ErrorLogRow: React.FC<{ log: ErrorLogEntry }> = ({ log }) => {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-50">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-2.5 px-3 hover:bg-gray-50 flex items-start gap-2"
      >
        {open ? <ChevronDown size={14} className="text-gray-400 mt-0.5" /> : <ChevronRight size={14} className="text-gray-400 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 text-xs">
            <span className="text-gray-400">{formatDate(log.occurredAt)}</span>
            {log.method && <span className="font-mono text-purple-600">{log.method}</span>}
            {log.path && <span className="font-mono text-gray-600 truncate">{log.path}</span>}
            {log.userId && <span className="text-gray-400">user #{log.userId}</span>}
          </div>
          <p className="text-sm text-red-600 mt-0.5 truncate">{log.message}</p>
        </div>
      </button>
      {open && log.stackTrace && (
        <pre className="text-[11px] bg-gray-900 text-gray-100 p-3 mx-3 mb-2 rounded overflow-x-auto whitespace-pre-wrap break-words">
          {log.stackTrace}
        </pre>
      )}
    </div>
  )
}

const ErrorLogsSection: React.FC = () => {
  const [page, setPage] = useState(0)
  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'error-logs', page],
    queryFn: () => getErrorLogs(page, 20),
  })

  if (isLoading) return <LoadingSpinner />
  if (!data || data.content.length === 0) {
    return <p className="text-sm text-gray-400 text-center py-8">에러 로그가 없습니다.</p>
  }

  return (
    <>
      <div>{data.content.map((log) => <ErrorLogRow key={log.id} log={log} />)}</div>
      <div className="flex justify-between items-center mt-4 text-xs text-gray-500">
        <span>{data.totalElements}건 · {data.totalPages}페이지</span>
        <div className="flex gap-2">
          <button
            disabled={page === 0}
            onClick={() => setPage(page - 1)}
            className="px-2 py-1 border border-gray-200 rounded disabled:opacity-30"
          >
            이전
          </button>
          <span className="px-2 py-1">{page + 1}</span>
          <button
            disabled={page + 1 >= data.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2 py-1 border border-gray-200 rounded disabled:opacity-30"
          >
            다음
          </button>
        </div>
      </div>
    </>
  )
}

const Admin: React.FC = () => {
  const [tab, setTab] = useState<'stats' | 'users' | 'errors'>('stats')

  const tabs = [
    { key: 'stats', label: '시스템 통계', icon: BarChart3 },
    { key: 'users', label: '회원', icon: Users },
    { key: 'errors', label: '에러 로그', icon: AlertTriangle },
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="text-purple-600" size={22} />
        <h2 className="text-2xl font-bold text-gray-900">관리자</h2>
      </div>

      <div className="flex gap-1 border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
              tab === t.key
                ? 'border-purple-600 text-purple-700 font-medium'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      <Card>
        {tab === 'stats' && <StatsSection />}
        {tab === 'users' && <UsersSection />}
        {tab === 'errors' && <ErrorLogsSection />}
      </Card>
    </div>
  )
}

export default Admin
