# review-layers-lab

> **TL;DR**
> - 코드 리뷰를 **잡는 문제가 서로 다른 여러 층**으로 나눠 거는 구조를 작은 장바구니 앱으로 재현한 학습용 저장소다.
> - 교재는 앱 코드가 아니라 **PR 기록**이다. 샘플 PR [#4](https://github.com/devheedoo/review-layers-lab/pull/4)~[#9](https://github.com/devheedoo/review-layers-lab/pull/9)와 [#12](https://github.com/devheedoo/review-layers-lab/pull/12)에 지적, 수정 커밋, 라벨, 체크 결과가 남아 있다.
> - 지적에는 `[Important]` / `[Nit]` / `[Pre-existing]` 태그를 붙인다. 위험도 라벨(`risk:high`)이 붙으면 사람이 확인해야 병합된다.
> - 가장 값진 지적은 리뷰 시스템 자체의 구멍이었다. 리뷰 규칙과 그 규칙이 실제로 읽히는 경로까지 검증해야 한다.

원문: "How the Claude Code team does code review" (claude.dev, 2026-10-15). 계획과 상세 결과는 [docs/PLAN.md](docs/PLAN.md)에 있다.

## 1. 재현한 리뷰 층

원문의 핵심은 한 사람(또는 AI)에게 모든 걸 맡기지 않는 것이다. 잡는 대상이 다른 층을 쌓는다.

| 층 | 무엇을 잡나 | 저장소에서 어디 |
|---|---|---|
| 1. 작성자 자체 검증 | 문법·타입·빌드 오류. PR을 열기 전에 잡는다 | [CLAUDE.md](CLAUDE.md)의 "PR을 열기 전에" |
| 2. 필수 CI | 1층을 건너뛴 경우 | [ci.yml](.github/workflows/ci.yml) + main ruleset |
| 3. AI 리뷰 | 로직 버그, 경계값, 상태 관리 실수 | [REVIEW.md](REVIEW.md) + `/code-review --comment` |
| 4. 지적 분류 태그 | 모든 지적이 같은 무게로 보이는 문제 | `[Important]` / `[Nit]` / `[Pre-existing]` |
| 5. 위험도 분류 | 어떤 PR에 사람이 꼭 봐야 하는지 | [risk-label.yml](.github/workflows/risk-label.yml) → `risk:low/mid/high` |
| 6. 사람 확인 게이트 | 위험한 변경이 자동으로 통과되는 것 | `risk-gate` 체크 + `reviewed-by-human` 라벨 |
| 7. 되돌리기 계획 | 병합 뒤 문제가 생겼을 때 | [PR 템플릿](.github/pull_request_template.md)의 "어떻게 되돌리나", [src/flags.ts](src/flags.ts) |

요점은 층마다 잡는 대상이 다르다는 것이다. 그래서 `REVIEW.md`의 "지적하지 않을 것"에는 스타일과 타입 오류가 들어 있다. lint와 typecheck가 이미 잡으므로 AI 리뷰어가 시간을 쓰지 않는다.

재현하지 못한 층(보안 리뷰 Action, merge queue, 단계 배포, 투표 기반 검증자)과 그 이유는 [docs/PLAN.md](docs/PLAN.md)의 "목표와 범위"에 있다.

## 2. 읽는 순서

### ① 규칙 (10분)

- [docs/PLAN.md](docs/PLAN.md)의 "목표와 범위", "샘플 PR" 표: 무엇을 왜 실험했는지
- [REVIEW.md](REVIEW.md): 태그 세 개의 정의
  - 특히 "이 PR 때문에 기존 문제가 새로 드러나거나 더 나빠졌다면 `[Pre-existing]`이 아니라 `[Important]`"라는 규칙을 본다.

### ② 샘플 PR (핵심)

PR마다 **Files changed 탭의 인라인 코멘트**와 **Conversation 탭의 resolve 답글**을 같이 본다.

| PR | 내용 | 볼 점 |
|---|---|---|
| [S1 #4](https://github.com/devheedoo/review-layers-lab/pull/4) | 문구만 수정 | "지적 없음"을 기대했지만 6개가 나왔다. AI 리뷰어는 할 말이 없어도 뭔가 찾아낸다. 그래서 Nit을 "고치지 않아도 된다"고 정해둔 게 중요하다 |
| [S2 #5](https://github.com/devheedoo/review-layers-lab/pull/5) | 할인 기능 + 일부러 심은 버그 (경계값 `>=`→`>`, stale closure) | 심은 버그 두 개가 1라운드에서 모두 `[Important]`로 잡혔다. 2라운드에서는 1라운드 수정 커밋이 만든 새 Nit이 나왔다. 리뷰 라운드에 상한이 필요한 이유다 |
| [S3 #6](https://github.com/devheedoo/review-layers-lab/pull/6) | 미리 심어둔 기존 버그 근처 수정 | "이 PR이 만든 문제"와 "원래 있던 문제"를 태그로 나눴다. `[Pre-existing]`은 PR을 막지 않고 이슈로 넘어간다. 리뷰 범위가 끝없이 커지지 않게 하는 장치다 |
| [S4 #9](https://github.com/devheedoo/review-layers-lab/pull/9) | `.github/workflows/` 수정 | `risk:high`가 붙고 `risk-gate`가 병합을 막았다. 사람이 라벨을 붙인 뒤에야 병합됐다 |

### ③ 리뷰가 리뷰 인프라를 고친 PR

[#12](https://github.com/devheedoo/review-layers-lab/pull/12)는 샘플 리뷰에서 `[Pre-existing]`으로 나온 지적 두 개를 고쳤다. 둘 다 앱 버그가 아니라 리뷰 시스템 자체의 구멍이었다.

- [#8](https://github.com/devheedoo/review-layers-lab/issues/8): 금액 계산 파일 변경이 `mid`로 분류돼 사람 확인 없이 통과됐다.
- [#10](https://github.com/devheedoo/review-layers-lab/issues/10): 라벨 이벤트로 `synchronize` 실행을 취소하면 사람 확인을 우회할 수 있었다.

PR 본문에서 해결 방식 세 가지(취소 끄기 / 그룹 분리 / head SHA 비교)를 비교한 부분을 본다.

### ④ 결과

[docs/PLAN.md](docs/PLAN.md)의 "결과"와 "배운 것": PR별 지적 수, 태그 분포, 리뷰 라운드 수를 표로 정리했다.

## 3. 핵심 교훈

1. **AI 리뷰어도 지시문이 닿아야 규칙을 따른다.** `/code-review`는 `REVIEW.md`를 스스로 읽지 않는다. `CLAUDE.md`에 "리뷰할 때 `REVIEW.md`를 따른다"는 연결 고리를 하나 두자 태그 형식이 5번 모두 지켜졌다. 규칙을 쓰는 것보다 규칙이 실제로 읽히는 경로를 확인하는 게 먼저다.
2. **태그가 리뷰 비용을 조절한다.** 샘플 PR 전체 지적은 Important 4 · Nit 16 · Pre-existing 5였다. 태그가 없으면 25개를 전부 고쳐야 할 것처럼 보인다. 태그가 있으면 반드시 처리할 건 4개다.
3. **위험도에 따라 사람의 시간을 배분한다.** 사람은 `risk:high`만 보면 된다. 대신 "무엇이 high인가"를 정하는 규칙이 틀리면 그게 곧 구멍이다(#8).
4. **사람 확인은 커밋 단위여야 한다.** 확인한 뒤 새 커밋이 올라오면 그 확인은 무효다. GitHub의 stale review dismissal이 하는 일이고, #12는 이걸 라벨로 흉내 낼 때 생기는 경합을 막았다.
5. **리뷰어 보고서도 검증 대상이다.** subagent가 "`REVIEW.md`가 저장소에 없다"고 잘못 보고한 적이 있다. AI 리뷰 결과는 근거를 확인한다.

## 4. 직접 해보기

앱 실행:

```bash
npm install
npm run dev
```

- **버그를 심은 PR 만들기.** 예를 들어 `src/cart/pricing.ts`에서 무료배송 기준 비교를 `>=`에서 `>`로 바꾼다. 그리고 `/code-review high --comment <PR 번호>`를 돌린다.
  - `[Important]`로 잡히는지 확인한다.
  - `risk:high`가 붙는지(#8 수정)도 확인한다.
- **#10 재현.** `reviewed-by-human`이 붙은 `risk:high` PR에 빈 커밋을 push한다. 그 직후 아무 라벨이나 붙였다 뗀다. `reviewed-by-human`이 떼어지고 `risk-gate`가 실패하면 수정이 동작하는 것이다.
- **태그 판단 연습.** 기존 PR의 지적 하나를 골라 "나라면 Important인가 Nit인가?"를 먼저 정한다. 그다음 `REVIEW.md` 기준과 비교한다.

## 5. 실제 업무로 옮길 때

모든 층을 한 번에 들일 필요는 없다. 효과가 큰 순서로 하면 이렇다.

1. **PR 템플릿에 "어떻게 되돌리나" 칸 추가:** 비용 거의 0
2. **리뷰 지적에 태그 세 개 쓰기:** 팀 합의만 있으면 된다
3. **경로 기반 위험도 라벨:** `risk-label.yml`을 거의 그대로 가져가고, 경로 목록만 팀 코드에 맞게 바꾼다
4. **AI 리뷰를 `REVIEW.md` 기준으로 돌리기:** `CLAUDE.md` 연결 고리를 잊지 않는다
