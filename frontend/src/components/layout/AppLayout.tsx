import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

const AppLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 ml-60 pt-8 px-8 pb-12">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
