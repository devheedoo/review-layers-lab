# review-layers-lab 계획

claude.dev 글 "How the Claude Code team does code review"(2026-10-15)의 리뷰 구조를 작은 샘플 저장소로 재현한다. PR과 코드 리뷰 예시를 남기는 것이 목적이다.

## 목표와 범위

- 원문의 7개 층 중 혼자서, 무료로 재현할 수 있는 층만 만든다.
  - 재현: PR 전 자체 검증(CLAUDE.md), 필수 CI, AI 리뷰(REVIEW.md + 태그), 위험도 분류, 되돌리기 칸이 있는 PR 템플릿, feature flag
  - 흉내만: 위험도별 사람 승인 수(라벨과 상태 체크로 표시)
  - 제외: 보안 리뷰 Action, merge queue, 단계 배포 채널, eval set
- 영향 범위: 새 저장소 `review-layers-lab` 1개. 다른 저장소는 건드리지 않는다.
- 위험: 샘플 PR에 일부러 넣은 버그가 main에 병합되지 않게 한다. 병합 전에 모두 수정하거나 PR을 닫는다. 단, PR #3용 기존 버그는 일부러 main에 둔다.

## 결정 사항

- AI 리뷰어는 로컬 `/code-review --comment`를 쓴다. 저장소에 API key secret을 두지 않는다.
  - 한계: 원문의 투표 기반 검증자 구조는 재현되지 않는다.
- 스택: React + Vite + TypeScript + Tailwind. 장바구니 가격 계산 앱 하나만 만든다.
- 위험도 라벨: `risk:low|mid|high` (p2s-web과 같은 이름)
- PR 템플릿 칸: 어떻게 확인했나 / 위험도 / 어떻게 되돌리나

## 열린 질문

- [ ] 저장소 공개 여부: public 권장
  - GitHub Free의 private 저장소에서는 branch protection·ruleset을 쓸 수 없다. 계정 플랜은 아직 확인하지 않았다.
- [ ] 위험도 분류 방식: 규칙 기반(경로 + diff 크기) 권장
  - API key 없이 Actions에서 돌릴 수 있다. LLM 기반은 로컬 리뷰로 판정하는 방식만 가능하다.
- [ ] `/code-review`가 Important / Nit / Pre-existing 태그를 지시대로 붙이는지는 확인하지 않았다. 4단계에서 확인한다.

## 알려진 제약

- GitHub에서는 자기 PR을 approve할 수 없다. 1명·2명 승인은 실제로 보여줄 수 없어서 라벨과 체크로만 표시한다.

## 샘플 PR

| PR | 내용 | 기대 결과 |
|---|---|---|
| #1 | README·문구만 수정 | low, 지적 없음 |
| #2 | 할인 계산 기능 + 일부러 넣은 버그(경계값, stale closure) | mid, Important 지적 → 수정 커밋으로 해소 |
| #3 | 기존 코드 근처 수정 (main에 미리 버그를 심어둠) | Pre-existing 태그 분리 |
| #4 | `.github/workflows/` 수정 | high, CI 경로라 사람이 꼭 봐야 하는 경로 |

## 단계

- [ ] 1. GitHub 원격 저장소 연결 + Vite 앱 스캐폴드 + `ci.yml`(lint·typecheck·build) + `src/flags.ts` — 권장 모델: Sonnet 5.5 (보일러플레이트)
- [ ] 2. `CLAUDE.md`, `REVIEW.md`, `.github/pull_request_template.md`, `.github/CODEOWNERS` 작성 — 권장 모델: Opus 5.5 (리뷰 품질을 좌우하는 문서)
- [ ] 3. `risk-label.yml` 위험도 라벨 workflow (경로·diff 크기 규칙) — 권장 모델: Opus 5.5 (규칙 경계 설계)
- [ ] 4. main에 PR #3용 기존 버그를 심고, 샘플 PR #1~#4 브랜치와 PR 생성 — 권장 모델: Opus 5.5 (자연스러운 버그 설계)
- [ ] 5. PR마다 `/code-review --comment`를 실행해 태그 출력 확인 → 수정 커밋 또는 이유를 적어 resolve하는 흐름 시연 — 권장 모델: Opus 5.5
- [ ] 6. 결과 정리: PR별 지적 수, 태그 분포, 리뷰 라운드 수를 이 문서 끝에 기록 — 권장 모델: Sonnet 5.5 Medium (정리 작업)
