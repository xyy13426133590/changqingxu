/**
 * VIP 相关 API
 */
import { get, post } from './api'
import { USE_CLOUD, callCloud } from './cloud'
import { CLOUD_API_MAP } from './cloud-api-map'

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

export interface MiniProgramPayment {
  timeStamp: string
  nonceStr: string
  package: string
  signType: 'RSA'
  paySign: string
}

export interface CreateOrderResult {
  order: VipOrder
  payment?: MiniProgramPayment
  paymentMode: 'live' | 'mock'
}

export function apiGetVipPlans(): Promise<{ plans: VipPlan[] }> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.vip.plans)
  return get<{ plans: VipPlan[] }>('/vip/plans')
}

export function apiCreateOrder(params: { planId: string; payMethod?: string }): Promise<CreateOrderResult> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.vip.createOrder, params)
  return post<CreateOrderResult>('/vip/orders', params)
}

export function apiGetOrder(orderId: string): Promise<VipOrder> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.vip.getOrder, { orderId })
  return get<VipOrder>(`/vip/orders/${encodeURIComponent(orderId)}`)
}

export function apiMockPayOrder(orderId: string): Promise<VipOrder> {
  if (USE_CLOUD) return callCloud(CLOUD_API_MAP.vip.mockPay, { orderId })
  return post<VipOrder>(`/vip/orders/${encodeURIComponent(orderId)}/mock-pay`, {})
}
