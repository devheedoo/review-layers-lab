# CLAUDE.md

장바구니 가격 계산 앱으로 코드 리뷰 층을 실험하는 저장소다. 계획은 `docs/PLAN.md`에 있다.

## PR을 열기 전에 (자체 검증)

아래 세 명령이 모두 통과해야 PR을 연다. CI도 같은 명령을 돌리지만, CI에서 처음 실패를 발견하면 늦다.

```bash
npm run lint       # 경고도 실패로 친다 (--max-warnings 0)
npm run typecheck
npm run build
```

화면이 바뀌는 PR은 `npm run dev`로 직접 띄워 바뀐 부분을 확인하고, PR 본문 "어떻게 확인했나"에 적는다.

## 코드 규칙

- 가격 계산은 `src/cart/`의 순수 함수에만 둔다. 컴포넌트에서 금액을 직접 계산하지 않는다.
- 금액은 원 단위 정수다. 소수가 생기는 계산(할인율 등)은 어디서 반올림하는지 함수 주석에 적는다.
- 상태 업데이트가 이전 상태에 의존하면 함수형 업데이트(`setX((prev) => …)`)를 쓴다.
- 화면 문구는 `src/copy.ts`에만 둔다.
- 새 기능은 `src/flags.ts`에 기본값 `false`인 플래그를 추가하고 그 뒤에 둔다.

## 브랜치와 PR

- main에 직접 push하지 않는다. main은 ruleset으로 PR·`ci`·`risk-gate` 통과·리뷰 스레드 resolve를 강제한다.
- PR 본문은 `.github/pull_request_template.md`의 세 칸(어떻게 확인했나 / 위험도 / 어떻게 되돌리나)을 모두 채운다.
- 위험도 라벨(`risk:low|mid|high`)은 workflow가 붙인다. 손으로 붙이거나 떼지 않는다.

## 코드 리뷰

코드 리뷰를 할 때는 `REVIEW.md`의 규칙과 태그 형식을 따른다.
