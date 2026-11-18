import { formatWon } from '../cart/format'
import { remainingForFreeShipping } from '../cart/pricing'
import type { PriceBreakdown } from '../cart/types'
import { copy } from '../copy'
import { isEnabled } from '../flags'

type Props = {
  breakdown: PriceBreakdown
}

export function PriceSummary({ breakdown }: Props) {
  const remaining = remainingForFreeShipping(breakdown.subtotal)

  return (
    <section className="space-y-2 rounded-lg bg-slate-50 p-4">
      {isEnabled('freeShippingBanner') && (
        <p className="text-sm text-emerald-700">
          {remaining > 0 ? copy.freeShippingRemaining(formatWon(remaining)) : copy.freeShippingReached}
        </p>
      )}
      <dl className="space-y-1">
        <Row label={copy.subtotal} value={formatWon(breakdown.subtotal)} />
        <Row
          label={copy.shipping}
          value={breakdown.shipping === 0 ? copy.free : formatWon(breakdown.shipping)}
        />
        <div className="flex justify-between border-t border-slate-200 pt-2 text-lg font-semibold">
          <dt>{copy.total}</dt>
          <dd className="tabular-nums">{formatWon(breakdown.total)}</dd>
        </div>
      </dl>
    </section>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-700">
      <dt>{label}</dt>
      <dd className="tabular-nums">{value}</dd>
    </div>
  )
}
