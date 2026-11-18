/** 지금 발급 중인 쿠폰은 하나뿐이다. */
export const COUPON_CODE = 'WELCOME10'
/** 상품 금액이 이 금액 이상이어야 쿠폰을 쓸 수 있다. */
export const COUPON_MIN_SUBTOTAL = 30_000
export const COUPON_RATE = 0.1

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

export function isCouponEligible(subtotal: number, code: string): boolean {
  return normalizeCouponCode(code) === COUPON_CODE && subtotal > COUPON_MIN_SUBTOTAL
}

/** 할인액. 원 단위 미만은 여기서 버린다. */
export function couponDiscount(subtotal: number): number {
  return Math.floor(subtotal * COUPON_RATE)
}
