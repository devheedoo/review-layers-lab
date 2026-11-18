import { useState, type FormEvent } from 'react'
import {
  COUPON_MIN_SUBTOTAL,
  isValidCouponCode,
  meetsCouponMinimum,
  normalizeCouponCode,
  remainingForCoupon,
} from '../cart/coupon'
import { formatWon } from '../cart/format'
import { copy } from '../copy'

type Props = {
  subtotal: number
  appliedCoupon: string | null
  onApply: (code: string) => void
  onRemove: () => void
}

type Status = 'idle' | 'checking' | 'rejected'

/** 쿠폰 검증은 서버 호출을 흉내 내 잠깐 기다린 뒤 끝난다. */
const VERIFY_DELAY_MS = 600

/**
 * 쿠폰 입력 폼.
 * 여기서는 코드가 맞는지만 확인한다. 최소 금액 조건은 렌더링 시점의 subtotal로
 * 판정한다(할인액은 calculateTotal이 다시 판정). 지연 콜백 안에서 금액을 읽지 않는다.
 */
export function CouponForm({ subtotal, appliedCoupon, onApply, onRemove }: Props) {
  const [code, setCode] = useState('')
  const [status, setStatus] = useState<Status>('idle')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    // 확인 중에는 입력칸이 잠겨 있어 code가 바뀌지 않는다.
    const submitted = code
    setStatus('checking')
    setTimeout(() => {
      if (isValidCouponCode(submitted)) {
        onApply(normalizeCouponCode(submitted))
        setStatus('idle')
        setCode('')
      } else {
        setStatus('rejected')
      }
    }, VERIFY_DELAY_MS)
  }

  if (appliedCoupon) {
    return (
      <div className="space-y-1 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-emerald-800">{copy.couponApplied(appliedCoupon)}</span>
          <button type="button" className="text-slate-500 hover:text-red-600" onClick={onRemove}>
            {copy.couponRemove}
          </button>
        </div>
        {!meetsCouponMinimum(subtotal) && (
          <p className="text-amber-700">
            {copy.couponBelowMinimum(
              formatWon(COUPON_MIN_SUBTOTAL),
              formatWon(remainingForCoupon(subtotal)),
            )}
          </p>
        )}
      </div>
    )
  }

  return (
    <form className="space-y-1" onSubmit={handleSubmit}>
      <label className="block text-sm font-medium" htmlFor="coupon-code">
        {copy.couponLabel}
      </label>
      <div className="flex gap-2">
        <input
          id="coupon-code"
          className="min-w-0 flex-1 rounded border border-slate-300 px-3 py-2"
          value={code}
          onChange={(event) => {
            setCode(event.target.value)
            if (status === 'rejected') setStatus('idle')
          }}
          placeholder={copy.couponPlaceholder}
          disabled={status === 'checking'}
        />
        <button
          type="submit"
          className="rounded bg-slate-900 px-4 py-2 text-white disabled:opacity-40"
          disabled={status === 'checking' || code.trim() === ''}
        >
          {status === 'checking' ? copy.couponChecking : copy.couponApply}
        </button>
      </div>
      {status === 'rejected' && <p className="text-sm text-red-600">{copy.couponRejected}</p>}
    </form>
  )
}
