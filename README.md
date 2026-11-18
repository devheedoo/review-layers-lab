# review-layers-lab

코드 리뷰를 여러 층으로 나눠 거는 구조를 작은 장바구니 앱으로 재현한 실험 저장소다.
계획과 진행 상황은 [docs/PLAN.md](docs/PLAN.md)에 있다.

## 실행

```bash
npm install
npm run dev
```

## 검증

PR을 열기 전에 아래 세 명령이 모두 통과해야 한다. CI도 같은 명령을 돌린다.

```bash
npm run lint
npm run typecheck
npm run build
```

## 구조

- `src/cart/` — 가격 계산 순수 함수와 상품 데이터
- `src/components/` — 화면 컴포넌트
- `src/copy.ts` — 화면 문구 모음
- `src/flags.ts` — 기능 플래그

## 기능 플래그 켜고 끄기

플래그 기본값은 `src/flags.ts`에 있다. 내 컴퓨터에서만 바꿔 보려면 `.env.local` 파일에 한 줄로 적는다.

```
VITE_FLAG_freeShippingBanner=false
```

- 값은 소문자 `true` 또는 `false`만 인식한다. 그 밖의 값은 무시하고 기본값을 쓴다.
- `.env.local`은 `npm run dev`뿐 아니라 `npm run build`에도 읽힌다. 확인이 끝나면 지운다.
