import type { CartItem, PriceBreakdown } from './types'

/** 이 금액 이상 담으면 배송비가 무료다. */
export const FREE_SHIPPING_THRESHOLD = 50_000
export const SHIPPING_FEE = 3_000

export function lineTotal(item: CartItem): number {
  return item.unitPrice * item.quantity
}

export function subtotalOf(items: readonly CartItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0)
}

export function shippingFee(subtotal: number): number {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0
  }
  return SHIPPING_FEE
}

/** 무료배송까지 남은 금액. 이미 조건을 채웠으면 0이다. */
export function remainingForFreeShipping(subtotal: number): number {
  return Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
}

export function calculateTotal(items: readonly CartItem[]): PriceBreakdown {
  const subtotal = subtotalOf(items)
  const shipping = shippingFee(subtotal)
  return { subtotal, shipping, total: subtotal + shipping }
}
