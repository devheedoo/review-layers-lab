# review-layers-lab 계획

claude.dev 글 [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/)(2026-10-15)의 리뷰 구조를 작은 샘플 저장소로 재현한다. PR과 코드 리뷰 예시를 남기는 것이 목적이다.

## 목표와 범위

- 원문의 7개 층 중 혼자서, 무료로 재현할 수 있는 층만 만든다.
  - 재현: PR 전 자체 검증(CLAUDE.md), 필수 CI, AI 리뷰(REVIEW.md + 태그), 위험도 분류, 되돌리기 칸이 있는 PR 템플릿, feature flag
  - 흉내만: 위험도별 사람 승인 수(라벨과 상태 체크로 표시)
  - 제외: 보안 리뷰 Action, merge queue, 단계 배포 채널, eval set
- 영향 범위: 새 저장소 `review-layers-lab` 1개. 다른 저장소는 건드리지 않는다.
- 위험: 샘플 PR에 일부러 넣은 버그가 main에 병합되지 않게 한다. 병합 전에 모두 수정하거나 PR을 닫는다. 단, S3용 기존 버그는 일부러 main에 둔다.

## 결정 사항

- AI 리뷰어는 로컬 `/code-review --comment`를 쓴다. 저장소에 API key secret을 두지 않는다.
  - 한계: 원문의 투표 기반 검증자 구조는 재현되지 않는다.
- 스택: React + Vite + TypeScript + Tailwind. 장바구니 가격 계산 앱 하나만 만든다.
- 위험도 라벨: `risk:low|mid|high` (p2s-web과 같은 이름)
- PR 템플릿 칸: 어떻게 확인했나 / 위험도 / 어떻게 되돌리나
- 저장소는 **public** (2026-11-19 결정). 처음엔 private 유지로 정했다가, 필수 체크를 강제하려고 바꿨다.
- 브랜치 진행 방식
  - 인프라 단계(1~3)는 `step/N-…` 브랜치를 앞 단계 브랜치 위에 쌓고, PR도 앞 단계 브랜치를 base로 쌓는다. 3단계까지 끝나면 순서대로 main에 merge commit으로 병합한다.
  - 샘플 PR은 인프라 PR이 앞 번호를 쓰므로 S1~S4로 부르고, 실제 PR 번호는 결과 절에 기록한다.
  - 샘플 PR 브랜치는 `sample/N-…`. 앞 샘플을 병합하거나 닫은 뒤 최신 main에서 다음 브랜치를 딴다.

## 열린 질문

- [x] 저장소 공개 여부: public (위 결정 사항 참고)
  - 계정은 GitHub Free다. private일 때는 ruleset·branch protection API가 403을 돌려줬다.
- [x] 위험도 분류 방식: 규칙 기반(경로 + diff 크기)
  - API key 없이 Actions에서 돌릴 수 있다. LLM 기반은 로컬 리뷰로 판정하는 방식만 가능하다.
- [x] `/code-review`가 Important / Nit / Pre-existing 태그를 지시대로 붙이는가 → **CLAUDE.md를 거치면 붙는다** (2.5단계, 2026-11-19)
  - `/code-review`의 지시문은 CLAUDE.md만 읽고 REVIEW.md는 읽지 않는다. 그래서 CLAUDE.md에 "리뷰할 때 REVIEW.md를 따른다"는 절을 두었다.
  - 시험 diff(경계값 `>=`→`>` + `== true` + 근처의 기존 버그)에서 Important 1 · Pre-existing 1 · Nit 3이 나왔고, 심은 세 가지가 모두 의도한 태그로 분류됐다.
  - 한계: 시험한 리뷰어가 REVIEW.md를 쓴 세션 자신이라 결과가 유리하게 나왔을 수 있다. 5단계에서 새 세션으로 다시 확인한다.

## 알려진 제약

- GitHub에서는 자기 PR을 approve할 수 없다. 1명·2명 승인은 실제로 보여줄 수 없어서 라벨과 체크로만 표시한다.
- `pull_request` 트리거는 PR 브랜치에 있는 workflow 파일로 돌아간다. PR이 `risk-label.yml`을 고치면 자기 분류 규칙을 바꿀 수 있으므로 S4는 `ci.yml`만 고친다.

## 샘플 PR

| 샘플 | 내용 | 기대 결과 |
|---|---|---|
| S1 | README·UI 문구만 수정 | low, 지적 없음 |
| S2 | 할인 계산 기능 + 일부러 넣은 버그(경계값, stale closure) | mid, Important 지적 → 수정 커밋으로 해소 |
| S3 | 기존 코드 근처 수정 (main에 미리 버그를 심어둠) | Pre-existing 태그 분리 |
| S4 | `.github/workflows/` 수정 | high, CI 경로라 사람이 꼭 봐야 하는 경로 |

## 단계

- [x] 1. Vite 앱 스캐폴드 + `ci.yml`(lint·typecheck·build) + `src/flags.ts` — 권장 모델: Sonnet 5.5 (보일러플레이트)
  - 가격 계산은 `src/cart/`의 순수 함수로 두고 UI와 나눈다. S2의 할인 기능은 flag 뒤에 둔다.
  - S3용 기존 버그는 이 스캐폴드 코드에 넣어둔다. lint·typecheck·build를 통과하는 로직 버그여야 한다.
- [x] 2. `CLAUDE.md`, `REVIEW.md`, `.github/pull_request_template.md`, `.github/CODEOWNERS` 작성 — 권장 모델: Opus 5.5 (리뷰 품질을 좌우하는 문서)
- [x] 2.5. 버리는 로컬 diff로 `/code-review`를 미리 돌려 태그가 붙는지 확인하고, 안 붙으면 `REVIEW.md` 문구를 고친다 — 권장 모델: Opus 5.5
- [x] 3. `risk-label.yml` 위험도 라벨 workflow (경로·diff 크기 규칙) — 권장 모델: Opus 5.5 (규칙 경계 설계)
  - `risk:low|mid|high` 라벨은 `gh label create`로 미리 만든다.
  - `risk-gate` 체크: high인데 사람 확인 라벨(`reviewed-by-human`)이 없으면 실패한다.
  - 1~3단계 PR을 main에 병합한 뒤 main에 ruleset을 건다: PR 필수, `ci`·`risk-gate` 통과 필수, 리뷰 스레드 resolve 필수.
- [x] 4. 샘플 S1~S4 브랜치와 PR 생성 — 권장 모델: Opus 5.5 (자연스러운 버그 설계)
  - S2와 S3는 같은 코드 근처를 건드리므로 S1 → S2 → S3 → S4 순서로 하나씩 병합하거나 닫는다.
- [x] 5. PR마다 `/code-review --comment`를 실행해 태그 출력 확인 → 수정 커밋 또는 이유를 적어 resolve하는 흐름 시연 — 권장 모델: Opus 5.5
- [x] 6. 결과 정리: PR별 지적 수, 태그 분포, 리뷰 라운드 수를 이 문서 끝에 기록 — 권장 모델: Sonnet 5.5 Medium (정리 작업)

## 결과 (2026-11-19)

### PR 목록

| 구분 | PR | 브랜치 | 상태 |
|---|---|---|---|
| step 1 | #1 | `step/1-scaffold` | 병합 |
| step 2 | #2 | `step/2-review-docs` (base: step/1) | 병합 |
| step 3 | #3 | `step/3-risk-label` (base: step/2) | 병합 |
| S1 | #4 | `sample/1-copy-fix` | 병합 |
| S2 | #5 | `sample/2-discount-coupon` | 병합 |
| S3 | #6 | `sample/3-free-shipping-threshold` | 병합 |
| S4 | #9 | `sample/4-ci-cache` | **사람 확인 대기** (`risk-gate` 실패로 병합 막힘) |
| step 6 | 이 PR | `step/6-results` | — |

리뷰에서 넘긴 이슈: #7 빈 장바구니 배송비, #8 금액 계산 경로가 mid로 분류됨, #10 risk workflow 라벨 경합

### 샘플별 리뷰 결과

리뷰어는 매번 새 컨텍스트의 subagent가 `/code-review high --comment <PR>`로 실행했다.

| 샘플 | 위험도 | 라운드 | Important | Nit | Pre-existing | 수정 커밋으로 해소 | 이유 적고 resolve | 기대와 비교 |
|---|---|---|---|---|---|---|---|---|
| S1 | low | 1 | 0 | 5 | 1 | 4 | 2 | 위험도는 맞음. "지적 없음"은 빗나감 |
| S2 | mid | 2 | 4 | 7 | 1 | 9 | 3 | 맞음. 심은 버그 2개 모두 1라운드에서 Important |
| S3 | mid | 1 | 0 | 3 | 2 | 1 | 4 (이슈 1) | 태그 분리는 맞음. 심은 버그는 S2에서 먼저 잡힘 |
| S4 | high | 1 | 0 | 1 | 1 | 1 | 1 | 맞음. `risk-gate`가 병합을 막음 |
| 합계 | | 5 | 4 | 16 | 5 | 15 | 10 | |

S2 라운드별: 1라운드 Important 3 · Nit 3 → 2라운드 Important 1 · Nit 4 · Pre-existing 1.
2라운드 Nit 하나는 1라운드 수정 커밋이 새로 만든 문제였다.

### 배운 것

- **`/code-review`는 REVIEW.md를 스스로 읽지 않는다.** CLAUDE.md에 "리뷰할 때 REVIEW.md를 따른다"는 절을 두자, 새 컨텍스트 리뷰어 5회 모두 태그 형식을 지켰다.
- **심은 버그는 다 잡혔지만, 라운드마다 새 Nit이 나온다.** 그래서 라운드 상한을 정해야 한다. 이번에는 S2를 2라운드에서 멈췄다. 문서만 바꾼 S1에서도 지적이 6개 나왔다.
- **가장 값진 지적은 리뷰 인프라 자체의 구멍이었다.** #8(금액 경로가 mid로 분류됨), #10(라벨 경합으로 사람 확인 우회 가능)은 둘 다 `[Pre-existing]`이나 diff 밖 지적으로 나왔다.
- **GitHub 인라인 코멘트는 diff 줄에만 달린다.** 그래서 diff 밖 문제는 엉뚱한 줄에 달리거나(S3) 리뷰 보고서에만 남았다(S4 → #10). Pre-existing 지적은 이슈로 넘기는 경로가 필요하다.
- **리뷰어 보고서도 검증해야 한다.** subagent가 "REVIEW.md가 저장소에 없다"고 잘못 보고한 적이 있다.
- **부트스트랩 예외:** step 3 PR(#3)은 `risk:high`였다. 하지만 ruleset을 그 뒤에 걸었기 때문에 `risk-gate` 실패 상태로 병합됐다.
- **원문 대비 한계:** 승인 수는 라벨로만 흉내 냈고, 투표 기반 검증자는 없다. 사람 확인도 `reviewed-by-human` 라벨 하나로 대신한다.
