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
