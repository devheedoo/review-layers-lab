import { catalog } from '../cart/catalog'
import { formatWon } from '../cart/format'
import type { Product } from '../cart/types'
import { copy } from '../copy'

type Props = {
  onAdd: (product: Product) => void
}

export function Catalog({ onAdd }: Props) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold">{copy.catalogTitle}</h2>
      <ul className="grid grid-cols-2 gap-2">
        {catalog.map((product) => (
          <li key={product.id}>
            <button
              type="button"
              className="w-full rounded border border-slate-300 px-3 py-2 text-left hover:bg-slate-50"
              onClick={() => onAdd(product)}
            >
              <span className="block">{product.name}</span>
              <span className="text-sm text-slate-500">
                {formatWon(product.unitPrice)} · {copy.add}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
