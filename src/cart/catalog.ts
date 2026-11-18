import type { CartItem, Product } from './types'

export const catalog: readonly Product[] = [
  { id: 'tumbler', name: '텀블러', unitPrice: 12_000 },
  { id: 'notebook', name: '노트', unitPrice: 4_500 },
  { id: 'pen-set', name: '볼펜 세트', unitPrice: 6_800 },
  { id: 'eco-bag', name: '에코백', unitPrice: 15_000 },
]

/** 첫 화면 장바구니. 무료배송 기준보다 적게 둬서 배송비·안내 배너가 보이게 한다. */
export const initialCart: CartItem[] = [
  { id: 'tumbler', name: '텀블러', unitPrice: 12_000, quantity: 1 },
  { id: 'notebook', name: '노트', unitPrice: 4_500, quantity: 3 },
  { id: 'pen-set', name: '볼펜 세트', unitPrice: 6_800, quantity: 1 },
]
