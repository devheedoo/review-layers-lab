/** 판매 상품. 가격은 원 단위 정수다. */
export type Product = {
  id: string
  name: string
  unitPrice: number
}

/** 장바구니에 담긴 상품. quantity는 1 이상이다. */
export type CartItem = Product & {
  quantity: number
}

export type PriceBreakdown = {
  subtotal: number
  discount: number
  shipping: number
  total: number
}
