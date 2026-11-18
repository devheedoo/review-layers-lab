import { formatWon } from '../cart/format'
import { lineTotal } from '../cart/pricing'
import type { CartItem } from '../cart/types'
import { copy } from '../copy'

type Props = {
  item: CartItem
  onChangeQuantity: (id: string, delta: number) => void
  onRemove: (id: string) => void
}

export function CartItemRow({ item, onChangeQuantity, onRemove }: Props) {
  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-slate-500">{formatWon(item.unitPrice)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="size-8 rounded border border-slate-300 disabled:opacity-40"
          onClick={() => onChangeQuantity(item.id, -1)}
          disabled={item.quantity <= 1}
          aria-label={`${item.name} 수량 줄이기`}
        >
          −
        </button>
        <span className="w-6 text-center tabular-nums">{item.quantity}</span>
        <button
          type="button"
          className="size-8 rounded border border-slate-300"
          onClick={() => onChangeQuantity(item.id, 1)}
          aria-label={`${item.name} 수량 늘리기`}
        >
          +
        </button>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-24 text-right tabular-nums">{formatWon(lineTotal(item))}</span>
        <button
          type="button"
          className="text-sm text-slate-500 hover:text-red-600"
          onClick={() => onRemove(item.id)}
        >
          {copy.remove}
        </button>
      </div>
    </li>
  )
}
