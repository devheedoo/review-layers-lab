/** 지금 발급 중인 쿠폰은 하나뿐이다. */
export const COUPON_CODE = 'WELCOME10'
/** 상품 금액이 이 금액 이상이어야 쿠폰을 쓸 수 있다. */
export const COUPON_MIN_SUBTOTAL = 30_000
export const COUPON_RATE = 0.1

export function normalizeCouponCode(code: string): string {
  return code.trim().toUpperCase()
}

/** 코드 자체가 맞는지만 본다. 금액 조건은 보지 않는다. */
export function isValidCouponCode(code: string): boolean {
  return normalizeCouponCode(code) === COUPON_CODE
}

export function meetsCouponMinimum(subtotal: number): boolean {
  return subtotal >= COUPON_MIN_SUBTOTAL
}

/** 쿠폰 최소 금액까지 남은 금액. 이미 채웠으면 0이다. */
export function remainingForCoupon(subtotal: number): number {
  return Math.max(0, COUPON_MIN_SUBTOTAL - subtotal)
}

/** 할인액. 원 단위 미만은 여기서 버린다. */
export function couponDiscount(subtotal: number): number {
  return Math.floor(subtotal * COUPON_RATE)
}
