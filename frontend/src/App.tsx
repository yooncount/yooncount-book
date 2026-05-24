import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import ProtectedRoute from './auth/ProtectedRoute'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import Transactions from './pages/Transactions'
import Statistics from './pages/Statistics'
import Budget from './pages/Budget'
import Categories from './pages/Categories'
import PaymentMethods from './pages/PaymentMethods'
import Recurring from './pages/Recurring'
import SavingsGoals from './pages/SavingsGoals'
import Investment from './pages/Investment'
import TradingJournal from './pages/TradingJournal'
import Loans from './pages/Loans'
import NetWorth from './pages/NetWorth'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import PasswordReset from './pages/PasswordReset'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/password-reset" element={<PasswordReset />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="statistics" element={<Statistics />} />
            <Route path="budget" element={<Budget />} />
            <Route path="categories" element={<Categories />} />
            <Route path="payment-methods" element={<PaymentMethods />} />
            <Route path="recurring" element={<Recurring />} />
            <Route path="savings" element={<SavingsGoals />} />
            <Route path="investment" element={<Investment />} />
            <Route path="journal" element={<TradingJournal />} />
            <Route path="loans" element={<Loans />} />
            <Route path="net-worth" element={<NetWorth />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route
              path="admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
