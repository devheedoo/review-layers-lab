/** 화면에 보이는 문구 모음. 문구만 바꾸는 PR은 이 파일만 건드린다. */
export const copy = {
  title: '장바구니',
  catalogTitle: '상품 담기',
  add: '담기',
  remove: '삭제',
  empty: '장바구니가 비어 있어요.',
  subtotal: '상품 금액',
  shipping: '배송비',
  free: '무료',
  total: '결제 예정 금액',
  freeShippingRemaining: (remaining: string) => `${remaining} 더 담으면 무료배송이에요.`,
  freeShippingReached: '무료배송 조건을 채웠어요.',
  discount: '쿠폰 할인',
  couponLabel: '쿠폰 코드',
  couponPlaceholder: '예: WELCOME10',
  couponApply: '적용',
  couponChecking: '확인 중…',
  couponRemove: '쿠폰 빼기',
  couponApplied: (code: string) => `${code} 쿠폰을 적용했어요.`,
  couponRejected: '없는 쿠폰 코드예요.',
  couponBelowMinimum: (minimum: string, remaining: string) =>
    `${minimum} 이상 담아야 할인돼요. ${remaining} 더 담아 주세요.`,
} as const
