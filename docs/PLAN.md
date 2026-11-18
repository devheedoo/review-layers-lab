# review-layers-lab 계획

claude.dev 글 "How the Claude Code team does code review"(2026-10-15)의 리뷰 구조를 작은 샘플 저장소로 재현한다. PR과 코드 리뷰 예시를 남기는 것이 목적이다.

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
- [ ] `/code-review`가 Important / Nit / Pre-existing 태그를 지시대로 붙이는지는 아직 확인하지 않았다. 2.5단계에서 확인한다.

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

- [ ] 1. Vite 앱 스캐폴드 + `ci.yml`(lint·typecheck·build) + `src/flags.ts` — 권장 모델: Sonnet 5.5 (보일러플레이트)
  - 가격 계산은 `src/cart/`의 순수 함수로 두고 UI와 나눈다. S2의 할인 기능은 flag 뒤에 둔다.
  - S3용 기존 버그는 이 스캐폴드 코드에 넣어둔다. lint·typecheck·build를 통과하는 로직 버그여야 한다.
- [ ] 2. `CLAUDE.md`, `REVIEW.md`, `.github/pull_request_template.md`, `.github/CODEOWNERS` 작성 — 권장 모델: Opus 5.5 (리뷰 품질을 좌우하는 문서)
- [ ] 2.5. 버리는 로컬 diff로 `/code-review`를 미리 돌려 태그가 붙는지 확인하고, 안 붙으면 `REVIEW.md` 문구를 고친다 — 권장 모델: Opus 5.5
- [ ] 3. `risk-label.yml` 위험도 라벨 workflow (경로·diff 크기 규칙) — 권장 모델: Opus 5.5 (규칙 경계 설계)
  - `risk:low|mid|high` 라벨은 `gh label create`로 미리 만든다.
  - `risk-gate` 체크: high인데 사람 확인 라벨(`reviewed-by-human`)이 없으면 실패한다.
  - 1~3단계 PR을 main에 병합한 뒤 main에 ruleset을 건다: PR 필수, `ci`·`risk-gate` 통과 필수, 리뷰 스레드 resolve 필수.
- [ ] 4. 샘플 S1~S4 브랜치와 PR 생성 — 권장 모델: Opus 5.5 (자연스러운 버그 설계)
  - S2와 S3는 같은 코드 근처를 건드리므로 S1 → S2 → S3 → S4 순서로 하나씩 병합하거나 닫는다.
- [ ] 5. PR마다 `/code-review --comment`를 실행해 태그 출력 확인 → 수정 커밋 또는 이유를 적어 resolve하는 흐름 시연 — 권장 모델: Opus 5.5
- [ ] 6. 결과 정리: PR별 지적 수, 태그 분포, 리뷰 라운드 수를 이 문서 끝에 기록 — 권장 모델: Sonnet 5.5 Medium (정리 작업)
