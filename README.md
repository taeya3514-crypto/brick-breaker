# BUILD & NEON BREAKER (건설 품질·안전 네온 벽돌깨기)

본 프로젝트는 HTML5 Canvas 2D 및 Web Audio API 기반의 미래지향적 네온 벽돌깨기 게임에 **건설 현장 품질·안전 지식 테마**를 결합하여 프리미엄 웹 애플리케이션으로 고도화한 프로젝트입니다.

---

## 1. 주요 고도화 기능 & 기술 스택

- **렌더링 엔진 (Graphics)**: HTML5 Canvas 2D API (`requestAnimationFrame` 기반 60fps).
- **실시간 오디오 엔진 & BGM**: Web Audio API 순수 파형 합성(Sine, Square, Sawtooth, Triangle) 및 Synth BGM 8-Bit 루퍼 (BGM ON/OFF 토글 지원).
- **건설 품질·안전 특수 블록 연동**:
  - 🚨 **안전 방재 폭발 블록**: 파괴 시 3x3 반경 연쇄 폭발 및 충격진동 연출.
  - ⭐ **품질 검측 골든 블록**: 파괴 시 +500점 고득점 및 100% 확정 아이템 드랍.
  - 🏗️ **강철 철근 블록**: 내구도 3의 묵직한 고강도 블록.
  - 💬 **건설 품질·안전 텍스트 토스트**: 블록 파쇄 시 현장 품질 및 안전 지침(안전모 착용, 콘크리트 강도 검수 등) 팝업 플로팅 연출.
- **다단 스테이지 (Stage 1 ~ 5)**: 난이도 곡선 및 블록 패턴 맵 구성.
- **인터페이스 (Glassmorphism & Neon)**: 반투명 블러 패널, 네온 글로우(`box-shadow`, `shadowBlur`), Google Fonts (Orbitron, Inter, Noto Sans KR).

---

## 2. 플레이어 조작법 & 아이템

### 🎮 컨트롤
- **패들 이동**: 마우스 좌우 이동 / 키보드 `A` 및 `D` (또는 좌우 방향키 `←` / `→`) / 모바일 스와이프 터치.
- **일시정지**: `Space` 키.
- **레이저 사격**: 레이저 모드(L) 획득 후 **마우스 클릭 / `W` / `↑`** 입력 시 연속 발사.
- **BGM 토글**: HUD 상단 `🎵 BGM ON/OFF` 버튼.

### ⚡ 드랍 아이템 (45% 확률)
- **`L` (Laser)**: 패들 좌우에 캐논 포탑 탑재 후 레이저 탄환 사격.
- **`W` (Wide)**: 패들 폭 1.5배 확대.
- **`M` (Multiball)**: 필드 위 공들을 분할 증식.
- **`S` (Slow)**: 공의 속도 감속.
- **`♥` (Life)**: 생명(기회) 1회 추가.

---

## 3. 로컬 구동 방법

```bash
# Python을 사용한 로컬 HTTP 서버 구동
cd C:\Users\DAEWOO\Projects\brick-breaker
python -m http.server 8080
```
웹 브라우저로 **[http://localhost:8080](http://localhost:8080)**에 접속하여 플레이하세요.

---

## 4. 실제 배포(업그레이드) 방법 — 2026-07-25 신설

이 게임은 **GitHub Pages**에 공개 배포되어 있다. localhost는 이 컴퓨터에서만 보이지만, 아래 공개 주소는 누구나 접속 가능하다.

- **공개 플레이 주소**: https://taeya3514-crypto.github.io/brick-breaker/
- **GitHub 저장소**: https://github.com/taeya3514-crypto/brick-breaker (계정: taeya3514-crypto)
- **공사일보(협력업체용) 바로가기에도 링크 등록됨** (2026-07-25, "테스트버전" 배지)

### 업그레이드(수정사항 반영) 절차

`index.html`(또는 다른 파일)을 수정한 뒤, **아래 3줄이면 끝**이다. GAS 웹앱처럼 별도 `clasp deploy` 개념이 없다 — git push가 곧 배포다.

```bash
cd C:\Users\DAEWOO\Projects\brick-breaker
git add -A && git commit -m "수정 내용 요약"
git push
```

- push 후 GitHub이 자동으로 다시 빌드하며, 보통 **1~2분 안에** 공개 주소에 반영된다.
- `gh api repos/taeya3514-crypto/brick-breaker/pages/builds/latest`로 빌드 상태(`"status":"built"`) 확인 가능.
- 별도의 배포 승인·버전 배포ID 관리 절차 없음(GAS 프로젝트들과 다른 점).

**Why:** 태야님이 "루나가 만든 이 게임을 앞으로 업그레이드할 때 어떻게 해야 하는지 모두가 알 수 있게 해달라"고 요청(2026-07-25) — 로컬에서만 열리던 걸 GitHub Pages로 처음 공개 배포하면서 이 절차를 신설.
