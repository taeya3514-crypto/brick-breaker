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
