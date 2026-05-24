import client from './client'
import type {
  AuthResponse,
  LoginRequest,
  PasswordChangeRequest,
  PasswordResetRequest,
  SignupRequest,
  User,
} from '../types'

export const signup = async (body: SignupRequest): Promise<AuthResponse> => {
  const { data } = await client.post('/auth/signup', body)
  return data.data ?? data
}

export const login = async (body: LoginRequest): Promise<AuthResponse> => {
  const { data } = await client.post('/auth/login', body)
  return data.data ?? data
}

export const getMe = async (): Promise<User> => {
  const { data } = await client.get('/auth/me')
  return data.data ?? data
}

export const changePassword = async (body: PasswordChangeRequest): Promise<void> => {
  await client.put('/auth/me/password', body)
}

export const deleteAccount = async (): Promise<void> => {
  await client.delete('/auth/me')
}

export const lookupSecurityQuestion = async (email: string): Promise<string> => {
  const { data } = await client.get('/auth/password-reset/question', { params: { email } })
  return (data.data ?? data).question
}

export const resetPassword = async (body: PasswordResetRequest): Promise<void> => {
  await client.post('/auth/password-reset', body)
}
