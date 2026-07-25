
    // --- 1. 오디오 컨트롤러 (Web Audio API 실시간 합성음) ---
    class SoundController {
        constructor() {
            this.ctx = null;
            this.bgmEnabled = true;
            this.bgmTimer = null;
            this.bgmStep = 0;
            // 8비트 레트로 Synth 멜로디 시퀀스 노트 (Hz)
            this.bgmNotes = [
                164.81, 196.00, 220.00, 246.94, 261.63, 246.94, 220.00, 196.00,
                164.81, 220.00, 246.94, 293.66, 329.63, 293.66, 246.94, 220.00
            ];
        }

        // 브라우저 보안 정책 상 첫 클릭/입력 시점에 컨텍스트 활성화
        init() {
            if (!this.ctx) {
                this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.ctx.state === 'suspended') {
                this.ctx.resume();
            }
            if (this.bgmEnabled && !this.bgmTimer) {
                this.startBGM();
            }
        }

        // BGM 루퍼
        startBGM() {
            if (this.bgmTimer) clearInterval(this.bgmTimer);
            this.bgmTimer = setInterval(() => {
                if (!this.bgmEnabled || !this.ctx || this.ctx.state !== 'running') return;
                const freq = this.bgmNotes[this.bgmStep % this.bgmNotes.length];
                this.playTone(freq, freq * 0.98, 0.12, 'triangle', 0.025);
                this.bgmStep++;
            }, 220); // 220ms 간격 비트
        }

        stopBGM() {
            if (this.bgmTimer) {
                clearInterval(this.bgmTimer);
                this.bgmTimer = null;
            }
        }

        toggleBGM() {
            this.bgmEnabled = !this.bgmEnabled;
            if (this.bgmEnabled) {
                this.init();
                this.startBGM();
            } else {
                this.stopBGM();
            }
            return this.bgmEnabled;
        }

        // 주파수 스윕 톤 생성 유틸리티
        playTone(freqStart, freqEnd, duration, type = 'sine', gainStart = 0.1) {
            if (!this.ctx) return;
            try {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = type;
                osc.frequency.setValueAtTime(freqStart, this.ctx.currentTime);
                if (freqEnd !== freqStart) {
                    osc.frequency.exponentialRampToValueAtTime(freqEnd, this.ctx.currentTime + duration);
                }

                gain.gain.setValueAtTime(gainStart, this.ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + duration);
            } catch (e) {
                console.warn('사운드 재생 오류:', e);
            }
        }

        playPaddleHit() {
            // 부드러운 패들 타격음 (트라이앵글 파형)
            this.playTone(150, 300, 0.1, 'triangle', 0.2);
        }

        playBrickHit(hp) {
            // 벽돌 내구도에 따른 타격음 분기
            if (hp === 99) {
                // 철벽돌 타격 (금속성 고주파음)
                this.playTone(600, 750, 0.08, 'sine', 0.12);
            } else if (hp === 3) {
                // 강철 철근 벽돌 타격
                this.playTone(180, 90, 0.18, 'sawtooth', 0.1);
            } else if (hp === 2) {
                // 단단한 벽돌 (묵직한 음)
                this.playTone(220, 100, 0.15, 'square', 0.08);
            } else {
                // 일반 벽돌
                this.playTone(330, 120, 0.12, 'square', 0.08);
            }
        }

        playExplosion() {
            // 방재 폭발음 (저음 톱니파 내림)
            this.playTone(180, 30, 0.4, 'sawtooth', 0.25);
        }

        playPowerUp() {
            // 상향식 아르페지오 (신비로운 획득 효과음)
            if (!this.ctx) return;
            const now = this.ctx.currentTime;
            const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, freq * 1.1, 0.18, 'sine', 0.07);
                }, idx * 60);
            });
        }

        playLaser() {
            // 경쾌한 레이저 발사음 (톱니파 주파수 급락)
            this.playTone(700, 200, 0.08, 'sawtooth', 0.06);
        }

        playLoseLife() {
            // 실패 사운드 (하향식 하쉬 노이즈 톤)
            this.playTone(280, 50, 0.35, 'sawtooth', 0.15);
        }

        playClear() {
            // 스테이지 클리어 축하 팡파레
            if (!this.ctx) return;
            const notes = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, freq, 0.3, 'sine', 0.08);
                }, idx * 80);
            });
        }

        playGameOver() {
            // 게임오버 마이너 아르페지오
            if (!this.ctx) return;
            const notes = [392.00, 311.13, 261.63, 196.00, 130.81]; // G4, Eb4, C4, G3, C3
            notes.forEach((freq, idx) => {
                setTimeout(() => {
                    this.playTone(freq, freq - 15, 0.45, 'sawtooth', 0.12);
                }, idx * 110);
            });
        }
    }

    const sound = new SoundController();

    // --- 2. 게임 변수 & 요소 초기화 ---
    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");

    // UI 오버레이 엘리먼트
    const startOverlay = document.getElementById("start-overlay");
    const pauseOverlay = document.getElementById("pause-overlay");
    const gameoverOverlay = document.getElementById("gameover-overlay");
    const clearOverlay = document.getElementById("clear-overlay");
    
    const hudStage = document.getElementById("hud-stage");
    const hudScore = document.getElementById("hud-score");
    const hudHighScore = document.getElementById("hud-highscore");
    const hudLives = document.getElementById("hud-lives");
    const gameoverScoreSpan = document.getElementById("gameover-score");
    const clearScoreSpan = document.getElementById("clear-score");
    const activeEffectsDiv = document.getElementById("active-effects");

    // 로컬 스토리지 하이스코어 (보안 오류 예방을 위한 try-catch 처리)
    let highScore = 0;
    try {
        highScore = localStorage.getItem("brick_breaker_highscore") || 0;
    } catch (e) {
        console.warn("localStorage 접근 불가: 임시 변수로 최고 점수를 관리합니다.");
    }
    hudHighScore.textContent = highScore;

    // 게임 상태 변수
    let score = 0;
    let lives = 3;
    let stage = 1;
    let isPlaying = false;
    let isPaused = false;
    let animationFrameId = null;

    // 화면 흔들림 효과
    let shakeIntensity = 0;
    let shakeDecay = 0.88;

    // 입자(파티클) 효과 관리 배열
    let particles = [];

    // 아이템 드랍 아이템 배열
    let items = [];

    // 다중 공(Ball) 배열 관리
    let balls = [];
    const baseBallRadius = 8;
    const baseBallSpeed = 4.5;

    // 패들(Paddle) 속성
    const basePaddleWidth = 100;
    const paddleHeight = 12;
    let paddleWidth = basePaddleWidth;
    let paddleX = (canvas.width - paddleWidth) / 2;
    
    // 키보드 조작 여부
    let rightPressed = false;
    let leftPressed = false;
    let upPressed = false;      // 레이저 발사용 키(W / ArrowUp)
    let mouseClicked = false;    // 레이저 발사용 클릭

    // 액티브 효과 지속 타이머
    let widePaddleTimer = 0;
    let slowBallTimer = 0;
    let laserTimer = 0;          // 레이저 포탑 작동 지속시간 (프레임)
    let fireCooldown = 0;        // 레이저 연사 방지 쿨다운

    // 탄환(Laser Bullets) 배열
    let bullets = [];

    // 벽돌 레이아웃 변수
    const brickWidth = 65;
    const brickHeight = 22;
    const brickPadding = 10;
    const brickOffsetTop = 50;
    let bricks = [];

    // Canvas roundRect 안전 폴리필 (구형 브라우저 및 호환성 보장)
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
            if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
            else {
                const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 };
                for (const side in defaultRadius) {
                    r[side] = r[side] || defaultRadius[side];
                }
            }
            this.beginPath();
            this.moveTo(x + r.tl, y);
            this.lineTo(x + w - r.tr, y);
            this.quadraticCurveTo(x + w, y, x + w, y + r.tr);
            this.lineTo(x + w, y + h - r.br);
            this.quadraticCurveTo(x + w, y + h, x + w - r.br, y + h);
            this.lineTo(x + r.bl, y + h);
            this.quadraticCurveTo(x, y + h, x, y + h - r.bl);
            this.lineTo(x, y + r.tl);
            this.quadraticCurveTo(x, y, x + r.tl, y);
            this.closePath();
            return this;
        };
    }

    // 건설 품질/안전 텍스트 토스트 배열
    let toasts = [];
    const toastMessages = [
        "건설 품질 검측 적합! 🏗️",
        "안전모 착용 상태 굿! ⛑️",
        "콘크리트 강도 검수 완료! 🧪",
        "위험요인 사전 차단! 🛡️",
        "품질 관리 지침 준수! ✅",
        "개인 보호구 착용 완료! 🥽",
        "추락 방지망 점검 완료! 🕸️",
        "작업 전 안전 점검 철저! 👷"
    ];

    function spawnToast(x, y, text = null) {
        const msg = text || toastMessages[Math.floor(Math.random() * toastMessages.length)];
        toasts.push({
            x: x,
            y: y,
            text: msg,
            alpha: 1.0,
            vy: -0.8
        });
    }

    // --- 3. 스테이지 구성 테이블 (Stage 1~5) ---
    // 0: 빈칸, 1: 일반 네온 블록(HP 1), 2: 단단한 벽돌(HP 2), 3: 강철 철근 블록(HP 3),
    // 4: 안전 방재 폭발 블록(HP 1, 주변 동시 연쇄 폭발), 5: 품질 검측 골든 블록(HP 1, 고득점+확정 아이템), 99: 금속 철빔(HP 99)
    const stageLayouts = {
        1: [
            [0, 1, 5, 1, 1, 5, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 1],
            [1, 1, 1, 4, 4, 1, 1, 1],
            [0, 1, 1, 1, 1, 1, 1, 0]
        ],
        2: [
            [2, 3, 2, 5, 5, 2, 3, 2],
            [1, 1, 4, 1, 1, 4, 1, 1],
            [3, 2, 3, 2, 2, 3, 2, 3],
            [0, 1, 1, 1, 1, 1, 1, 0]
        ],
        3: [
            [99, 3, 4, 99, 99, 4, 3, 99],
            [2,  5, 1, 3,  3,  1, 5, 2],
            [99, 4, 3, 99, 99, 3, 4, 99],
            [1,  2, 5, 1,  1,  5, 2, 1]
        ],
        4: [
            [5, 4, 3, 2, 2, 3, 4, 5],
            [3, 99, 2, 4, 4, 2, 99, 3],
            [4, 2, 5, 3, 3, 5, 2, 4],
            [1, 3, 4, 1, 1, 4, 3, 1]
        ],
        5: [
            [99, 5, 4, 3, 3, 4, 5, 99],
            [3,  4, 5, 99, 99, 5, 4, 3],
            [4,  5, 3, 2, 2, 3, 5, 4],
            [5,  3, 4, 5, 5, 4, 3, 5],
            [0,  1, 2, 3, 3, 2, 1, 0]
        ]
    };

    // --- 4. 초기화 함수군 ---

    // 스테이지 빌드 함수
    function buildBricks() {
        const layout = stageLayouts[stage] || stageLayouts[1];
        const rowCount = layout.length;
        const colCount = layout[0].length;
        
        // 전체 벽돌 영역 가로폭 계산 후 가로 중앙 자동 배치 오프셋 설정
        const totalGridWidth = (colCount * brickWidth) + ((colCount - 1) * brickPadding);
        const startX = (canvas.width - totalGridWidth) / 2;

        bricks = [];
        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < colCount; c++) {
                const hp = layout[r][c];
                if (hp > 0) {
                    const bx = startX + c * (brickWidth + brickPadding);
                    const by = brickOffsetTop + r * (brickHeight + brickPadding);
                    bricks.push({
                        x: bx,
                        y: by,
                        w: brickWidth,
                        h: brickHeight,
                        hp: hp,
                        maxHp: hp,
                        type: hp === 4 ? 'EXPLODE' : (hp === 5 ? 'GOLD' : (hp === 3 ? 'REBAR' : 'NORMAL')),
                        // 내구도 및 특수 블록별 색상 지정
                        getColor: function() {
                            if (this.hp === 99) return { border: '#e6c300', fill: 'rgba(230, 195, 0, 0.25)' }; // 금속 철빔
                            if (this.type === 'GOLD') return { border: '#fff01f', fill: 'rgba(255, 240, 31, 0.35)' }; // 골든 품질 블록
                            if (this.type === 'EXPLODE') return { border: '#ff7700', fill: 'rgba(255, 119, 0, 0.35)' }; // 안전 방재 폭발 블록
                            if (this.hp === 3) return { border: '#ff4500', fill: 'rgba(255, 69, 0, 0.3)' }; // 강철 철근 블록
                            if (this.hp === 2) return { border: '#ff007f', fill: 'rgba(255, 0, 127, 0.25)' }; // 단단한 벽돌
                            return { border: '#00f0ff', fill: 'rgba(0, 240, 255, 0.25)' }; // 일반 네온 블루
                        }
                    });
                }
            }
        }
    }

    // 새 공 생성
    function createBall(x, y, dx, dy) {
        return {
            x: x,
            y: y,
            dx: dx,
            dy: dy,
            radius: baseBallRadius,
            trail: [] // 모션 블러 트레일
        };
    }

    // 게임 시작 시 초기 세팅
    function initGame(resetAll = true) {
        if (resetAll) {
            score = 0;
            lives = 3;
            stage = 1;
        }

        widePaddleTimer = 0;
        slowBallTimer = 0;
        laserTimer = 0;
        fireCooldown = 0;
        paddleWidth = basePaddleWidth;
        paddleX = (canvas.width - paddleWidth) / 2;
        
        balls = [createBall(canvas.width / 2, canvas.height - 35, 3, -4.5)];
        particles = [];
        bullets = [];
        items = [];
        toasts = [];
        buildBricks();
        updateHUD();
    }

    // --- 5. 특수 효과 및 보조 로직 ---

    // 안전 방재 연쇄 폭발 함수 (3x3 주변 블록 동시 데미지)
    function triggerExplosion(centerBrick) {
        sound.playExplosion();
        startShake(12);
        const cx = centerBrick.x + centerBrick.w / 2;
        const cy = centerBrick.y + centerBrick.h / 2;
        spawnParticles(cx, cy, 25);
        spawnToast(cx, cy, "🚨 방재 폭발 방어작동!");

        // 주변 115px 반경 내의 벽돌 감지 및 폭파 데미지 처리
        for (let i = bricks.length - 1; i >= 0; i--) {
            const b = bricks[i];
            if (b.hp === 99) continue;
            const bx = b.x + b.w / 2;
            const by = b.y + b.h / 2;
            const dist = Math.hypot(cx - bx, cy - by);
            if (dist <= 115) {
                b.hp--;
                if (b.hp <= 0) {
                    spawnParticles(bx, by, 10);
                    dropItem(bx, by);
                    score += b.maxHp * 120;
                    bricks.splice(i, 1);
                }
            }
        }
    }

    // 벽돌 파괴 공통 처리 유틸리티 (특수 블록 및 건설 품질/안전 토스트 트리거)
    function destroyBrick(brick, bIdx) {
        spawnParticles(brick.x + brick.w / 2, brick.y + brick.h / 2, brick.maxHp);
        
        if (brick.type === 'EXPLODE') {
            bricks.splice(bIdx, 1);
            triggerExplosion(brick);
        } else if (brick.type === 'GOLD') {
            spawnToast(brick.x + brick.w / 2, brick.y + brick.h / 2, "⭐ 품질 검측 PASS! (+500)");
            dropItem(brick.x + brick.w / 2, brick.y + brick.h / 2);
            score += 500;
            bricks.splice(bIdx, 1);
        } else {
            if (Math.random() < 0.35) {
                spawnToast(brick.x + brick.w / 2, brick.y + brick.h / 2);
            }
            dropItem(brick.x + brick.w / 2, brick.y + brick.h / 2);
            score += brick.maxHp * 100;
            bricks.splice(bIdx, 1);
        }
    }

    // 파티클 펑펑 폭발 효과
    function spawnParticles(x, y, colorCount) {
        const colorPalette = ['#00f0ff', '#ff007f', '#39ff14', '#fff01f', '#ffffff'];
        const baseColor = colorPalette[Math.floor(Math.random() * colorPalette.length)];

        for (let i = 0; i < 12; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1.5 + Math.random() * 3.5;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 0.5, // 가볍게 윗방향 벡터 추가
                size: 2 + Math.random() * 4,
                color: baseColor,
                alpha: 1.0,
                decay: 0.02 + Math.random() * 0.02
            });
        }
    }

    // 레이저 피격 시 작은 스파크 입자 효과
    function spawnLaserSparks(x, y) {
        for (let i = 0; i < 5; i++) {
            const angle = (Math.random() * Math.PI) + Math.PI; // 위쪽 반원 방향으로 스파크
            const speed = 1.0 + Math.random() * 2.0;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 1.5 + Math.random() * 2,
                color: '#ff7700', // 레이저 색상 매칭
                alpha: 1.0,
                decay: 0.04 + Math.random() * 0.03
            });
        }
    }

    // 공의 잔상 꼬리 업데이트
    function updateBallTrail(ball) {
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 8) {
            ball.trail.shift();
        }
    }

    // HUD 수치 갱신
    function updateHUD() {
        hudStage.textContent = stage;
        hudScore.textContent = score;
        hudLives.textContent = lives;
        if (score > highScore) {
            highScore = score;
            try {
                localStorage.setItem("brick_breaker_highscore", highScore);
            } catch (e) {
                // localStorage 쓰기 제한 예외 처리
            }
            hudHighScore.textContent = highScore;
        }
        
        // 아이템 타이머 배지 실시간 업데이트
        activeEffectsDiv.innerHTML = '';
        if (widePaddleTimer > 0) {
            activeEffectsDiv.innerHTML += `
                <div class="effect-badge green">
                    ⚡ 와이드 패들 (${Math.ceil(widePaddleTimer / 60)}s)
                </div>`;
        }
        if (slowBallTimer > 0) {
            activeEffectsDiv.innerHTML += `
                <div class="effect-badge blue">
                    ❄️ 볼 감속 (${Math.ceil(slowBallTimer / 60)}s)
                </div>`;
        }
        if (laserTimer > 0) {
            activeEffectsDiv.innerHTML += `
                <div class="effect-badge orange">
                    🔫 레이저 모드 (${Math.ceil(laserTimer / 60)}s)
                </div>`;
        }
    }

    // 화면 흔들림 개시
    function startShake(amount) {
        shakeIntensity = amount;
    }

    // --- 6. 조작 입력 처리 ---

    // 키보드 핸들러
    document.addEventListener("keydown", (e) => {
        if (e.key === "Right" || e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
            rightPressed = true;
        } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
            leftPressed = true;
        } else if (e.key === "Up" || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
            upPressed = true;
        } else if (e.key === " ") {
            // 스페이스바로 일시정지 분기 토글
            e.preventDefault();
            if (isPlaying) {
                togglePause();
            }
        }
    });

    document.addEventListener("keyup", (e) => {
        if (e.key === "Right" || e.key === "ArrowRight" || e.key.toLowerCase() === "d") {
            rightPressed = false;
        } else if (e.key === "Left" || e.key === "ArrowLeft" || e.key.toLowerCase() === "a") {
            leftPressed = false;
        } else if (e.key === "Up" || e.key === "ArrowUp" || e.key.toLowerCase() === "w") {
            upPressed = false;
        }
    });

    // 마우스 조작 연동
    document.addEventListener("mousemove", (e) => {
        if (!isPlaying || isPaused) return;
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
            keepPaddleInBounds();
        }
    });

    // 마우스 클릭 시 레이저 사격 연동
    canvas.addEventListener("mousedown", (e) => {
        if (!isPlaying || isPaused) return;
        mouseClicked = true;
    });

    document.addEventListener("mouseup", () => {
        mouseClicked = false;
    });

    // 모바일 터치 조작 및 터치 사격 지원
    canvas.addEventListener("touchstart", (e) => {
        if (!isPlaying || isPaused) return;
        mouseClicked = true;
        
        // 터치 지점으로 즉시 이동
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const relativeX = touch.clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
            keepPaddleInBounds();
        }
    });

    canvas.addEventListener("touchmove", (e) => {
        if (!isPlaying || isPaused) return;
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const relativeX = touch.clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = relativeX - paddleWidth / 2;
            keepPaddleInBounds();
        }
    }, { passive: false });

    canvas.addEventListener("touchend", () => {
        mouseClicked = false;
    });

    function keepPaddleInBounds() {
        if (paddleX < 0) paddleX = 0;
        if (paddleX + paddleWidth > canvas.width) paddleX = canvas.width - paddleWidth;
    }

    // --- 7. 오버레이 화면 및 헤더 액션 이벤트 ---

    // BGM 사운드 토글
    const btnBgmToggle = document.getElementById("btn-bgm-toggle");
    if (btnBgmToggle) {
        btnBgmToggle.addEventListener("click", () => {
            const isBgmOn = sound.toggleBGM();
            btnBgmToggle.textContent = isBgmOn ? "🎵 BGM ON" : "🔇 BGM OFF";
        });
    }

    // 게임 시작
    document.getElementById("btn-start").addEventListener("click", () => {
        sound.init();
        startOverlay.classList.remove("active");
        isPlaying = true;
        initGame(true);
        loop();
    });

    // 일시정지 토글
    function togglePause() {
        if (!isPlaying) return;
        sound.init();
        isPaused = !isPaused;
        if (isPaused) {
            pauseOverlay.classList.add("active");
        } else {
            pauseOverlay.classList.remove("active");
            loop(); // 루프 재개
        }
    }

    document.getElementById("btn-resume").addEventListener("click", () => {
        togglePause();
    });

    // 재도전 (게임오버 시)
    document.getElementById("btn-restart").addEventListener("click", () => {
        sound.init();
        gameoverOverlay.classList.remove("active");
        isPlaying = true;
        isPaused = false;
        initGame(true);
        loop();
    });

    // 완클 및 재플레이
    document.getElementById("btn-complete").addEventListener("click", () => {
        sound.init();
        clearOverlay.classList.remove("active");
        isPlaying = true;
        isPaused = false;
        initGame(true);
        loop();
    });

    // --- 8. 물리 엔진 & 충돌 판정 구현 ---

    // 원형(Ball)과 사각형(AABB)의 고정밀 충돌 감지 & 물리 반사 구현
    function checkCircleRectCollision(ball, rect) {
        // 벽돌 사각 범위 내에서 공 중심과 가장 가까운 축상의 점 추출
        const closestX = Math.max(rect.x, Math.min(ball.x, rect.x + rect.w));
        const closestY = Math.max(rect.y, Math.min(ball.y, rect.y + rect.h));

        // 해당 거리와 공 반경 비교 검사
        const distVectorX = ball.x - closestX;
        const distVectorY = ball.y - closestY;
        const distanceSquared = (distVectorX * distVectorX) + (distVectorY * distVectorY);

        if (distanceSquared < ball.radius * ball.radius) {
            const distance = Math.sqrt(distanceSquared);
            // 정밀한 겹침 방지를 위해 법선벡터 산출
            let normX = 0;
            let normY = 0;
            if (distance === 0) {
                // 정확히 겹친 이례적인 상태 처리
                normY = -1;
            } else {
                normX = distVectorX / distance;
                normY = distVectorY / distance;
            }

            return {
                hit: true,
                normX: normX,
                normY: normY,
                closestX: closestX,
                closestY: closestY
            };
        }
        return { hit: false };
    }

    // 아이템 드랍 유틸
    function dropItem(x, y) {
        if (Math.random() > 0.45) return; // 45% 확률로 아이템 출현
        const rand = Math.random();
        let type = 'WIDE'; // 패들 확대
        let symbol = 'W';
        let color = '#39ff14'; // 네온 그린

        // 확률 분할
        if (rand < 0.20) {
            type = 'MULTIBALL'; // 볼 멀티스플릿
            symbol = 'M';
            color = '#fff01f'; // 네온 옐로
        } else if (rand < 0.40) {
            type = 'SLOW'; // 볼 속도 저하
            symbol = 'S';
            color = '#00f0ff'; // 네온 블루
        } else if (rand < 0.55) {
            type = 'LIFE'; // 생명 보너스
            symbol = '♥';
            color = '#ff007f'; // 네온 핑크
        } else if (rand < 0.85) {
            type = 'LASER'; // 레이저 캐논 탑재 모드
            symbol = 'L';
            color = '#ff7700'; // 네온 오렌지
        }

        items.push({
            x: x,
            y: y,
            type: type,
            symbol: symbol,
            color: color,
            radius: 12
        });
    }

    // --- 9. 코어 게임 루프 & 업데이트 ---

    function update() {
        // 버프 지속시간 감소 연산
        if (widePaddleTimer > 0) {
            widePaddleTimer--;
            if (widePaddleTimer === 0) {
                paddleWidth = basePaddleWidth;
            }
        }
        if (slowBallTimer > 0) {
            slowBallTimer--;
        }
        if (laserTimer > 0) {
            laserTimer--;
        }
        if (fireCooldown > 0) {
            fireCooldown--;
        }

        // 1) 패들 제어 (키보드 조작 처리)
        const paddleMoveSpeed = 7;
        if (rightPressed) {
            paddleX += paddleMoveSpeed;
        } else if (leftPressed) {
            paddleX -= paddleMoveSpeed;
        }
        keepPaddleInBounds();

        // 1.5) 레이저 탄환 사격 로직 (쿨다운 및 키 입력 체크)
        if (laserTimer > 0 && (upPressed || mouseClicked) && fireCooldown <= 0) {
            // 패들 좌측 캐논 포구 및 우측 캐논 포구 위치 설정
            bullets.push({
                x: paddleX + 8,
                y: canvas.height - paddleHeight - 14,
                w: 3,
                h: 12,
                vy: -6.5,
                color: '#ff7700'
            });
            bullets.push({
                x: paddleX + paddleWidth - 11,
                y: canvas.height - paddleHeight - 14,
                w: 3,
                h: 12,
                vy: -6.5,
                color: '#ff7700'
            });
            
            sound.playLaser();
            fireCooldown = 16; // 대략 0.26초 사격 간격 쿨다운
        }

        // 2) 아이템 업데이트 & 충돌 판정
        for (let i = items.length - 1; i >= 0; i--) {
            const item = items[i];
            item.y += 1.8; // 아이템 하강 속도

            // 패들과 충돌 처리
            if (item.y + item.radius >= canvas.height - paddleHeight && 
                item.x >= paddleX && item.x <= paddleX + paddleWidth) {
                
                sound.playPowerUp();
                
                // 각 효과 발동 분기
                if (item.type === 'WIDE') {
                    paddleWidth = Math.min(canvas.width * 0.45, basePaddleWidth * 1.5);
                    widePaddleTimer = 600; // 60프레임 * 10초 = 600프레임
                } else if (item.type === 'SLOW') {
                    slowBallTimer = 600;
                } else if (item.type === 'LIFE') {
                    lives++;
                    sound.playTone(523, 659, 0.2, 'sine', 0.15); // 특별 생명음
                } else if (item.type === 'MULTIBALL') {
                    // 현재 존재하는 볼을 각각 복제하여 난사 효과 연출
                    const curBallsCount = balls.length;
                    for (let bIdx = 0; bIdx < curBallsCount; bIdx++) {
                        const target = balls[bIdx];
                        // 좌우 각도로 퍼지게 새 공 2개 추가 생성
                        balls.push(createBall(target.x, target.y, target.dx - 1, -Math.abs(target.dy)));
                        balls.push(createBall(target.x, target.y, target.dx + 1, -Math.abs(target.dy)));
                    }
                } else if (item.type === 'LASER') {
                    laserTimer = 480; // 8초 (480프레임)
                }
                
                updateHUD();
                items.splice(i, 1);
                continue;
            }

            // 바닥 아래로 낙하 시 배열에서 탈락
            if (item.y - item.radius > canvas.height) {
                items.splice(i, 1);
            }
        }

        // 2.5) 레이저 탄환 업데이트 및 벽돌 충돌 처리
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            b.y += b.vy;

            let hitSomething = false;
            
            // 모든 벽돌에 대해 AABB 충돌 체크
            for (let bIdx = bricks.length - 1; bIdx >= 0; bIdx--) {
                const brick = bricks[bIdx];
                if (b.x + b.w > brick.x && b.x < brick.x + brick.w &&
                    b.y + b.h > brick.y && b.y < brick.y + brick.h) {
                    
                    hitSomething = true;
                    sound.playBrickHit(brick.hp);

                    // 벽돌 HP 삭감 (금속 철벽돌 제외)
                    if (brick.hp !== 99) {
                        brick.hp--;
                        if (brick.hp <= 0) {
                            destroyBrick(brick, bIdx);
                        } else {
                            spawnLaserSparks(b.x, b.y);
                        }
                    } else {
                        // 금속 벽돌에 맞았을 때 튕겨나가는 파편 연출
                        spawnLaserSparks(b.x, b.y);
                    }

                    startShake(2.5); // 피격 흔들림
                    updateHUD();
                    break;
                }
            }

            // 충돌했거나 화면 상단으로 나갈 시 소멸
            if (hitSomething || b.y + b.h < 0) {
                bullets.splice(i, 1);
            }
        }

        // 3) 공(Ball) 물리학 & 충돌 체크
        for (let i = balls.length - 1; i >= 0; i--) {
            const ball = balls[i];
            
            // 볼 속도 산출 (버프 유무 반영)
            const speedMultiplier = slowBallTimer > 0 ? 0.65 : 1.0;
            const currentMaxSpeed = baseBallSpeed * speedMultiplier;
            
            // 현 프레임 가속도 대입
            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
            if (Math.abs(speed - currentMaxSpeed) > 0.1) {
                const ratio = currentMaxSpeed / speed;
                ball.dx *= ratio;
                ball.dy *= ratio;
            }

            ball.x += ball.dx;
            ball.y += ball.dy;

            updateBallTrail(ball);

            // 좌우 벽 바운드
            if (ball.x + ball.radius > canvas.width) {
                ball.x = canvas.width - ball.radius;
                ball.dx = -ball.dx;
                sound.playTone(280, 280, 0.05, 'sine', 0.05);
            } else if (ball.x - ball.radius < 0) {
                ball.x = ball.radius;
                ball.dx = -ball.dx;
                sound.playTone(280, 280, 0.05, 'sine', 0.05);
            }

            // 상단 천장 바운드
            if (ball.y - ball.radius < 0) {
                ball.y = ball.radius;
                ball.dy = -ball.dy;
                sound.playTone(280, 280, 0.05, 'sine', 0.05);
            } 
            // 하단 패들 충돌 또는 낙하 감지
            else if (ball.y + ball.radius >= canvas.height - paddleHeight) {
                if (ball.x >= paddleX && ball.x <= paddleX + paddleWidth) {
                    // 공의 패들 낙하 시점 겹침 오류 탈출
                    ball.y = canvas.height - paddleHeight - ball.radius;
                    
                    // 정교한 타격 물리 : 타격점 오프셋에 맞춘 각도 계산 (-1 ~ 1)
                    const hitOffset = (ball.x - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
                    const reflectionAngle = hitOffset * (60 * Math.PI / 180); // 최대 60도 전개
                    const ballSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
                    
                    ball.dx = ballSpeed * Math.sin(reflectionAngle);
                    ball.dy = -ballSpeed * Math.cos(reflectionAngle);

                    sound.playPaddleHit();
                    startShake(2.5); // 가벼운 패들 타격 진동
                } else if (ball.y - ball.radius > canvas.height) {
                    // 공 탈락
                    balls.splice(i, 1);
                    continue;
                }
            }

            // 벽돌 충돌 검사
            for (let bIdx = bricks.length - 1; bIdx >= 0; bIdx--) {
                const brick = bricks[bIdx];
                const collision = checkCircleRectCollision(ball, brick);

                if (collision.hit) {
                    // 벽돌 충돌 즉각 물리 반사 (법선벡터 활용)
                    if (Math.abs(collision.normY) > Math.abs(collision.normX)) {
                        ball.dy = -ball.dy;
                        ball.y += collision.normY * (ball.radius - Math.abs(ball.y - collision.closestY));
                    } else {
                        ball.dx = -ball.dx;
                        ball.x += collision.normX * (ball.radius - Math.abs(ball.x - collision.closestX));
                    }

                    sound.playBrickHit(brick.hp);

                    // 강도/골드 판정 및 특수 블록 파괴
                    if (brick.hp !== 99) {
                        brick.hp--;
                        if (brick.hp <= 0) {
                            destroyBrick(brick, bIdx);
                        }
                    }
                    
                    startShake(5); // 충격 진동 발생
                    updateHUD();
                    break; // 중복 충돌 스킵
                }
            }
        }

        // 4) 볼 소멸 상태 체크 (생명 차감)
        if (balls.length === 0) {
            lives--;
            sound.playLoseLife();
            updateHUD();

            if (lives <= 0) {
                // 게임오버 종료 처리
                isPlaying = false;
                sound.playGameOver();
                gameoverScoreSpan.textContent = score;
                gameoverOverlay.classList.add("active");
            } else {
                // 부활 시 공 리스폰 및 상태 초기화
                balls = [createBall(canvas.width / 2, canvas.height - 35, 3, -4.5)];
                bullets = [];
                laserTimer = 0;
            }
        }

        // 5) 스테이지 올 클리어 감지 (Stage 1~5 지원)
        const destructibleCount = bricks.filter(b => b.hp !== 99).length;
        if (destructibleCount === 0 && isPlaying) {
            isPlaying = false;
            sound.playClear();
            
            // 다음 스테이지 이동 또는 엔딩 (Stage 5까지 진행)
            if (stage < 5) {
                stage++;
                setTimeout(() => {
                    isPlaying = true;
                    initGame(false); // 점수 유지한 채 스테이지 빌드
                    loop();
                }, 1500);
            } else {
                // 완클 오버레이 노출
                clearScoreSpan.textContent = score;
                clearOverlay.classList.add("active");
            }
        }

        // 6) 파티클 입자 감쇠 업데이트
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= p.decay;
            if (p.alpha <= 0) {
                particles.splice(i, 1);
            }
        }

        // 6.5) 건설 품질/안전 토스트 텍스트 감쇠 업데이트
        for (let i = toasts.length - 1; i >= 0; i--) {
            const t = toasts[i];
            t.y += t.vy;
            t.alpha -= 0.015;
            if (t.alpha <= 0) {
                toasts.splice(i, 1);
            }
        }

        // 7) 화면 흔들림 감쇠
        if (shakeIntensity > 0.1) {
            shakeIntensity *= shakeDecay;
        } else {
            shakeIntensity = 0;
        }
    }

    // --- 10. 그래픽 렌더링 함수군 ---

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 화면 흔들림 오프셋 가미
        ctx.save();
        if (shakeIntensity > 0) {
            const dx = (Math.random() - 0.5) * shakeIntensity;
            const dy = (Math.random() - 0.5) * shakeIntensity;
            ctx.translate(dx, dy);
        }

        // 1) 격자 패턴 배경 그리기 (미래 지향적 분위기 조성)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
        ctx.lineWidth = 1;
        const gridSize = 40;
        for (let x = 0; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // 2) 벽돌(Bricks) 그리기
        bricks.forEach(brick => {
            const colors = brick.getColor();
            
            // 네온 글로우 테두리
            ctx.strokeStyle = colors.border;
            ctx.lineWidth = 2;
            
            // 약간 흐리게 채워진 내부
            ctx.fillStyle = colors.fill;
            
            // 둥근 모서리 벽돌 드로잉
            ctx.beginPath();
            const radius = 4;
            ctx.roundRect(brick.x, brick.y, brick.w, brick.h, radius);
            ctx.fill();
            ctx.stroke();

            // 특수 블록 이모지 & 이니셜 텍스트 표기
            if (brick.type === 'EXPLODE') {
                ctx.fillStyle = '#ff7700';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('🚨', brick.x + brick.w / 2, brick.y + brick.h / 2);
            } else if (brick.type === 'GOLD') {
                ctx.fillStyle = '#fff01f';
                ctx.font = '11px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('⭐', brick.x + brick.w / 2, brick.y + brick.h / 2);
            } else if (brick.type === 'REBAR') {
                ctx.fillStyle = '#ff4500';
                ctx.font = 'bold 10px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(`🏗️${brick.hp}`, brick.x + brick.w / 2, brick.y + brick.h / 2);
            }

            // HP 2 벽돌 균열 시각화
            if (brick.hp === 1 && brick.maxHp === 2) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(brick.x + 10, brick.y + 5);
                ctx.lineTo(brick.x + 25, brick.y + 15);
                ctx.lineTo(brick.x + 40, brick.y + 7);
                ctx.stroke();
            }

            // 철벽돌 패턴 그리기 (가운데 격자 자물쇠 모양 유사 라인)
            if (brick.hp === 99) {
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.moveTo(brick.x + 5, brick.y + 5);
                ctx.lineTo(brick.x + brick.w - 5, brick.y + brick.h - 5);
                ctx.moveTo(brick.x + brick.w - 5, brick.y + 5);
                ctx.lineTo(brick.x + 5, brick.y + brick.h - 5);
                ctx.stroke();
            }
        });

        // 3) 아이템(Items) 렌더링
        items.forEach(item => {
            ctx.save();
            ctx.shadowColor = item.color;
            ctx.shadowBlur = 12;
            ctx.fillStyle = '#05060b';
            ctx.strokeStyle = item.color;
            ctx.lineWidth = 2.5;

            ctx.beginPath();
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // 아이템 이니셜 텍스트
            ctx.fillStyle = item.color;
            ctx.font = 'bold 12px Orbitron, Inter';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.symbol, item.x, item.y);
            ctx.restore();
        });

        // 4) 패들(Paddle) 및 캐논 포탑 렌더링
        ctx.save();
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = '#00f0ff';
        
        // 상단은 네온 블루, 하단은 딥블루 듀얼 톤 효과
        const paddleGrad = ctx.createLinearGradient(paddleX, canvas.height - paddleHeight, paddleX, canvas.height);
        paddleGrad.addColorStop(0, '#00f0ff');
        paddleGrad.addColorStop(1, '#005b82');
        ctx.fillStyle = paddleGrad;

        ctx.beginPath();
        ctx.roundRect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight, 6);
        ctx.fill();
        ctx.restore();

        // [추가] 레이저 포탑 그리기 (레이저 모드 활성화 시)
        if (laserTimer > 0) {
            ctx.save();
            ctx.shadowColor = '#ff7700';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ff7700';

            // 왼쪽 레이저 캐논 바디
            ctx.beginPath();
            ctx.roundRect(paddleX + 5, canvas.height - paddleHeight - 6, 9, 8, 2);
            ctx.fill();
            // 포신
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(paddleX + 8, canvas.height - paddleHeight - 12, 3, 6);

            // 오른쪽 레이저 캐논 바디
            ctx.fillStyle = '#ff7700';
            ctx.beginPath();
            ctx.roundRect(paddleX + paddleWidth - 14, canvas.height - paddleHeight - 6, 9, 8, 2);
            ctx.fill();
            // 포신
            ctx.fillStyle = '#ffcc00';
            ctx.fillRect(paddleX + paddleWidth - 11, canvas.height - paddleHeight - 12, 3, 6);

            ctx.restore();
        }

        // [추가] 레이저 탄환(Laser Bullets) 렌더링
        bullets.forEach(b => {
            ctx.save();
            ctx.shadowColor = b.color;
            ctx.shadowBlur = 8;
            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.roundRect(b.x, b.y, b.w, b.h, 1.5);
            ctx.fill();
            ctx.restore();
        });

        // 5) 파티클(Particles) 드로잉
        particles.forEach(p => {
            ctx.save();
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 6) 공(Balls) 렌더링 (Motion Blur 및 테일 꼬리 포함)
        balls.forEach(ball => {
            // 잔상 트레일 드로잉
            ball.trail.forEach((pos, idx) => {
                ctx.save();
                ctx.globalAlpha = (idx / ball.trail.length) * 0.25;
                ctx.fillStyle = '#00f0ff';
                ctx.beginPath();
                ctx.arc(pos.x, pos.y, ball.radius * (idx / ball.trail.length), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // 진짜 메인 공 렌더링
            ctx.save();
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        // 7) 건설 품질/안전 토스트 메시지 렌더링
        toasts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.font = '900 13px "Noto Sans KR", sans-serif';
            ctx.fillStyle = '#fff01f';
            ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
            ctx.shadowBlur = 6;
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        });

        ctx.restore(); // 흔들림 복원
    }

    // --- 11. 메인 게임 루프 ---

    function loop() {
        if (!isPlaying || isPaused) return;

        update();
        draw();

        animationFrameId = requestAnimationFrame(loop);
    }
