# review-layers-lab

> **TL;DR**
> - AI가 코드 대부분을 쓰면 사람이 모든 diff를 읽을 수 없다. 그래서 **잡는 문제가 서로 다른 검사 층에 읽는 일을 나눠 맡기고, 사람은 위험한 변경만 보는** 리뷰 구조가 나왔다. 이 저장소는 그 구조를 작은 장바구니 앱으로 재현한 학습용 저장소다.
> - 교재는 앱 코드가 아니라 **PR 기록**이다. 샘플 PR [#4](https://github.com/devheedoo/review-layers-lab/pull/4)~[#9](https://github.com/devheedoo/review-layers-lab/pull/9)와 [#12](https://github.com/devheedoo/review-layers-lab/pull/12)에 지적, 수정 커밋, 라벨, 체크 결과가 남아 있다.
> - 지적에는 `[Important]` / `[Nit]` / `[Pre-existing]` 태그를 붙인다. 위험도 라벨(`risk:high`)이 붙으면 사람이 확인해야 병합된다.
> - 가장 값진 지적은 리뷰 시스템 자체의 구멍이었다. 리뷰 규칙과 그 규칙이 실제로 읽히는 경로까지 검증해야 한다.

## 1. 목표로 하는 구조

원문: [How the Claude Code team does code review](https://claude.dev/blog/solving-code-review-at-anthropic/) (claude.dev, 2026-10-15). Claude Code 팀이 자기 저장소의 리뷰를 어떻게 다시 짰는지 설명한 글이다. 아래는 그 요약이다.

### 왜 바꿨나

- Claude Code의 코드는 약 90%를 Claude가 쓴다. 에이전트가 만드는 변경이 늘어나자, 사람이 diff를 한 줄씩 읽는 리뷰는 따라갈 수 없게 됐다.
- 원문은 "사람이 코드를 읽었나?"가 "이 변경으로 무엇이 잘못될 수 있나?"를 대신하는 **부정확한 지표**라고 본다. 그래서 질문을 바꾼다. **각 위험을 어느 검사(자동이든 사람이든)가 잡아야 하나?**
- 목표는 **revert와 장애를 늘리지 않는 선에서 사람의 리뷰 시간을 최소로** 하는 것이다. 구체적으로는 대부분의 PR이 사람 한 명 이하(작성자일 수도 있다)를 거쳐 병합되게 한다.
- 리뷰를 없앤 게 아니다. 읽는 일을 대부분 기계로 옮기고, 그 대신 잘못을 빨리 되돌리는 데 투자했다.

### 구조: 문 하나가 아니라 여러 층

리뷰를 PR 끝에 있는 문 하나로 두지 않는다. 변경이 지나가는 단계마다 잡는 대상이 다른 층을 둔다.

| 단계 | 층 | 무엇을 하나 | 누가 |
|---|---|---|---|
| PR 전 | 작성자 자체 검증 | 테스트·빌드·lint를 돌리고 결과를 보인다. 새 컨텍스트의 subagent가 diff를 한 번 리뷰한다 | 작성자 + Claude |
| 모든 PR | 필수 CI | lint, 타입, 플랫폼별 테스트, 빌드. 실패하면 병합할 수 없다 | CI |
| 모든 PR | AI 리뷰 | 여러 에이전트가 버그를 찾고, 검증 에이전트들이 투표해 통과한 지적만 인라인 코멘트로 단다 | AI |
| 모든 PR | 보안 리뷰 | 별도 자동 검사. 열린 지적이 있으면 병합할 수 없다 | AI |
| 병합 | 위험도별 사람 승인 | 분류기가 매긴 위험도에 따라 사람 0명·1명·2명이 승인한다 | 사람 |
| 병합 | 머지 큐 | main에 이 변경을 얹은 상태로 모든 검사를 다시 돌린다 | 자동 |
| 병합 후 | 플래그·단계 배포 | 새 동작은 플래그 뒤에 두고 사내에 먼저 내보낸다. 공개 배포는 `latest` 채널이 `stable`보다 먼저 받는다 | 자동 + 사내 사용자 |
| 병합 후 | 빠른 감지·되돌리기 | 플래그 끄기, revert, 단계 배포로 몇 분 안에 되돌린다. 장애 회고는 "어느 층이 잡았어야 했나"를 묻는다 | 작성자 + on-call |

### 층을 엮는 규칙

- **위험도는 작성자가 아니라 변경이 정한다.**
  - low(문서, 문구, 플래그 뒤의 추가 기능): 자동 검사가 통과하면 사람 승인이 필요 없다.
  - medium(보통의 제품 변경, 캐시·자동 업데이트·시스템 프롬프트 같은 민감 영역): 한 명이 승인한다.
  - high(가장 위험한 코드, 항상 두 명이 봐야 하는 일부 경로): 두 명이 승인한다.
  - CI workflow 파일이나 owner가 민감하다고 지정한 경로는 위험도와 상관없이 항상 사람이 본다. 원문은 사람이 꼭 봐야 할 위험한 코드의 예로 결제, 자동 업데이트, CI workflow를 든다.
- **승인은 특정 커밋에만 유효하다.** 승인 뒤에 새 커밋이 올라오면 다시 승인받아야 한다.
- **에이전트의 승인은 사람의 승인으로 치지 않는다.** 자동 리뷰는 low 변경을 통과시킬 수 있지만, 사람 승인이 필요한 자리를 채우지는 못한다.
- **AI 지적에는 `Important` / `Nit` / `Pre-existing` 태그를 붙이고, 모든 지적에 답한다.** 고치거나, 이유를 적고 resolve한다. `Pre-existing`은 PR이 만들지 않은 버그가 작성자 잘못처럼 보이지 않게 하려고 있다.
- **리뷰는 끝나야 한다.** 밤새 50라운드 넘게 돈 PR이 있었다. 지금은 세 라운드가 지나면 리뷰어가 접근 방식을 다시 생각하라고 권한다. 후반 라운드는 바뀐 diff만 다시 보고, 같은 지적을 반복하지 않는다. 그 결과 리뷰-수정 한 라운드에 통과하는 PR이 65%에서 78%로 늘었다.

원문이 밝힌 결과: 6월부터 9월까지 Claude Code에 병합된 PR 수는 두 배 넘게 늘었다. 그동안 revert된 PR의 비율은 40% 넘게 줄었다.

## 2. 이 저장소에서 재현한 것

혼자, 무료로, API key 없이 만들 수 있는 층만 재현했다. 나머지는 흉내만 내거나 뺐다.

| 원문의 층 | 이 저장소에서 | 재현 정도 |
|---|---|---|
| 작성자 자체 검증 | [CLAUDE.md](CLAUDE.md)의 "PR을 열기 전에": lint·typecheck·build를 통과해야 PR을 연다 | 재현 |
| 필수 CI | [ci.yml](.github/workflows/ci.yml) + main ruleset (`ci` 체크 필수) | 재현 |
| AI 리뷰 + 태그 | [REVIEW.md](REVIEW.md) + 로컬 `/code-review --comment`. 지적마다 `[Important]` / `[Nit]` / `[Pre-existing]` | 부분 재현. 투표하는 검증 에이전트는 없다 |
| 보안 리뷰 | — | 제외 |
| 위험도별 사람 승인 | [risk-label.yml](.github/workflows/risk-label.yml)이 경로·diff 크기로 `risk:low/mid/high`를 붙인다. `risk:high`면 `risk-gate` 체크가 `reviewed-by-human` 라벨을 요구한다. 라벨은 붙인 시점의 커밋에만 유효하다 | 흉내. GitHub에서는 자기 PR을 approve할 수 없어서 1명·2명 승인을 라벨 하나로 대신한다 |
| 머지 큐 | — | 제외 |
| 플래그·단계 배포 | [src/flags.ts](src/flags.ts): 새 기능은 기본값 `false` 플래그 뒤에 둔다 | 플래그만 재현. 배포 채널은 없다 |
| 빠른 되돌리기 | [PR 템플릿](.github/pull_request_template.md)의 "어떻게 되돌리나" 칸 | 부분 재현 |

층마다 잡는 대상이 다르다는 점이 이 구조의 핵심이다. 그래서 `REVIEW.md`의 "지적하지 않을 것"에는 스타일과 타입 오류가 들어 있다. lint와 typecheck가 이미 잡으므로 AI 리뷰어가 시간을 쓰지 않는다.

뺀 층과 그 이유는 [docs/PLAN.md](docs/PLAN.md)의 "목표와 범위"와 "알려진 제약"에 있다.

## 3. 읽는 순서

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

## 4. 핵심 교훈

1. **AI 리뷰어도 지시문이 닿아야 규칙을 따른다.** `/code-review`는 `REVIEW.md`를 스스로 읽지 않는다. `CLAUDE.md`에 "리뷰할 때 `REVIEW.md`를 따른다"는 연결 고리를 하나 두자 태그 형식이 5번 모두 지켜졌다. 규칙을 쓰는 것보다 규칙이 실제로 읽히는 경로를 확인하는 게 먼저다.
2. **태그가 리뷰 비용을 조절한다.** 샘플 PR 전체 지적은 Important 4 · Nit 16 · Pre-existing 5였다. 태그가 없으면 25개를 전부 고쳐야 할 것처럼 보인다. 태그가 있으면 반드시 처리할 건 4개다.
3. **위험도에 따라 사람의 시간을 배분한다.** 사람은 `risk:high`만 보면 된다. 대신 "무엇이 high인가"를 정하는 규칙이 틀리면 그게 곧 구멍이다(#8).
4. **사람 확인은 커밋 단위여야 한다.** 확인한 뒤 새 커밋이 올라오면 그 확인은 무효다. GitHub의 stale review dismissal이 하는 일이고, #12는 이걸 라벨로 흉내 낼 때 생기는 경합을 막았다.
5. **리뷰어 보고서도 검증 대상이다.** subagent가 "`REVIEW.md`가 저장소에 없다"고 잘못 보고한 적이 있다. AI 리뷰 결과는 근거를 확인한다.

## 5. 직접 해보기

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

## 6. 실제 업무로 옮길 때

모든 층을 한 번에 들일 필요는 없다. 효과가 큰 순서로 하면 이렇다.

1. **PR 템플릿에 "어떻게 되돌리나" 칸 추가:** 비용 거의 0
2. **리뷰 지적에 태그 세 개 쓰기:** 팀 합의만 있으면 된다
3. **경로 기반 위험도 라벨:** `risk-label.yml`을 거의 그대로 가져가고, 경로 목록만 팀 코드에 맞게 바꾼다
4. **AI 리뷰를 `REVIEW.md` 기준으로 돌리기:** `CLAUDE.md` 연결 고리를 잊지 않는다
