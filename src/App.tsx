import { useState } from 'react'
import { initialCart } from './cart/catalog'
import { calculateTotal } from './cart/pricing'
import type { CartItem, Product } from './cart/types'
import { CartItemRow } from './components/CartItemRow'
import { Catalog } from './components/Catalog'
import { PriceSummary } from './components/PriceSummary'
import { copy } from './copy'

export default function App() {
  const [items, setItems] = useState<CartItem[]>(initialCart)
  const breakdown = calculateTotal(items)

  const changeQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
      ),
    )
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const addItem = (product: Product) => {
    setItems((prev) => {
      if (prev.some((item) => item.id === product.id)) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  return (
    <main className="mx-auto max-w-xl space-y-6 p-6 text-slate-900">
      <h1 className="text-2xl font-bold">{copy.title}</h1>

      {items.length === 0 ? (
        <p className="text-slate-500">{copy.empty}</p>
      ) : (
        <ul className="divide-y divide-slate-200">
          {items.map((item) => (
            <CartItemRow
              key={item.id}
              item={item}
              onChangeQuantity={changeQuantity}
              onRemove={removeItem}
            />
          ))}
        </ul>
      )}

      <PriceSummary breakdown={breakdown} />
      <Catalog onAdd={addItem} />
    </main>
  )
}
