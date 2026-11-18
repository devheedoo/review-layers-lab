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
  total: '결재 예정 금액',
  freeShippingRemaining: (remaining: string) => `${remaining} 더 담으면 무료배송이에요.`,
  freeShippingReached: '무료배송 조건을 채웠어요.',
} as const
