import { couponDiscount, isValidCouponCode, meetsCouponMinimum } from './coupon'
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

/**
 * 결제 예정 금액.
 * 배송비는 할인 전 상품 금액으로 정한다.
 * 쿠폰 조건(코드·최소 금액)은 여기서 현재 상품 금액으로 매번 다시 판정한다.
 * 그래서 쿠폰을 적용한 뒤 상품을 빼 최소 금액 아래로 내려가면 할인이 사라진다.
 */
export function calculateTotal(
  items: readonly CartItem[],
  appliedCoupon: string | null = null,
): PriceBreakdown {
  const subtotal = subtotalOf(items)
  const discount =
    appliedCoupon !== null && isValidCouponCode(appliedCoupon) && meetsCouponMinimum(subtotal)
      ? couponDiscount(subtotal)
      : 0
  const shipping = shippingFee(subtotal)
  return { subtotal, discount, shipping, total: subtotal - discount + shipping }
}
