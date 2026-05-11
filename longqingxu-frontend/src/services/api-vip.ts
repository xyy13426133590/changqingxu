/**
 * VIP 相关 API
 */
import { get, post } from './api'

// VIP 套餐
export interface VipPlan {
  id: string
  name: string
  durationMonths: number
  price: number
  originalPrice?: number
  features: string[]
  tag?: string
  sortOrder: number
}

// VIP 订单
export interface VipOrder {
  id: string
  userId: string
  planId: string
  amount: number
  status: 'pending' | 'paid' | 'cancelled' | 'refunded'
  payMethod?: string
  payTime?: string
  expiresAt?: string
  createdAt: string
  plan?: VipPlan
}

// 获取套餐列表
export function apiGetVipPlans(): Promise<{ plans: VipPlan[] }> {
  return get<{ plans: VipPlan[] }>('/vip/plans')
}

// 创建订单
export function apiCreateOrder(params: { planId: string; payMethod?: string }): Promise<VipOrder> {
  return post<VipOrder>('/vip/orders', params)
}

// 查询订单状态
export function apiGetOrder(orderId: string): Promise<VipOrder> {
  return get<VipOrder>(`/vip/orders/${orderId}`)
}
