/**
 * 기능 플래그.
 *
 * 새 기능은 기본값 false로 추가해 main에 병합하고, 확인이 끝나면 켠다.
 * 문제가 생기면 코드를 되돌리지 않고 플래그만 끄면 된다.
 * 로컬에서는 `.env.local`에 `VITE_FLAG_<이름>=true|false`로 기본값을 덮어쓸 수 있다.
 */
const defaults = {
  freeShippingBanner: true,
  discountCoupon: false,
} satisfies Record<string, boolean>

export type FlagName = keyof typeof defaults

export function isEnabled(name: FlagName): boolean {
  const override: unknown = import.meta.env[`VITE_FLAG_${name}`]
  if (override === 'true') return true
  if (override === 'false') return false
  return defaults[name]
}
