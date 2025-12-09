// Game Constants
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_X = 120;
const PLAYER_SIZE = 30;
const GRAVITY = 0.35;
const BOOST_POWER = -8;
const OBSTACLE_WIDTH = 60;
const BASE_GAP_HEIGHT = 180;
const MIN_GAP_HEIGHT = 120;
const BASE_OBSTACLE_SPEED = 3;
const MAX_OBSTACLE_SPEED = 7;

// Game State
const gameState = {
    playerY: CANVAS_HEIGHT / 2,
    playerVelocity: 0,
    obstacles: [],
    particles: [],
    stars: [],
    score: 0,
    highScore: parseInt(localStorage.getItem('neonBoostHighScore') || '0'),
    gameStatus: 'start', // 'start' | 'waiting' | 'playing' | 'gameOver'
    difficulty: 1,
    frameCount: 0
};

// DOM Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('scoreDisplay');
const highScoreDisplay = document.getElementById('highScoreDisplay');
const difficultyDisplay = document.getElementById('difficultyDisplay');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScore = document.getElementById('finalScore');
const finalHighScore = document.getElementById('finalHighScore');
const newHighScore = document.getElementById('newHighScore');

// Initialize high score display
highScoreDisplay.textContent = gameState.highScore;

// Initialize Stars
function initStars() {
    const stars = [];
    for (let i = 0; i < 100; i++) {
        stars.push({
            x: Math.random() * CANVAS_WIDTH,
            y: Math.random() * CANVAS_HEIGHT,
            size: Math.random() * 2 + 0.5,
            speed: Math.random() * 1 + 0.5,
            brightness: Math.random() * 0.5 + 0.5
        });
    }
    return stars;
}

// Create Particle
function createParticle(x, y, type) {
    const colors = {
        boost: ['#00ffff', '#00ccff', '#0099ff'],
        trail: ['#ff00ff', '#cc00ff', '#ff0099'],
        explosion: ['#ffff00', '#ff9900', '#ff0066']
    };
    const colorArray = colors[type];
    return {
        x,
        y,
        vx: (Math.random() - 0.5) * (type === 'explosion' ? 8 : 3) - 2,
        vy: (Math.random() - 0.5) * (type === 'explosion' ? 8 : 2),
        life: type === 'explosion' ? 40 : 20,
        maxLife: type === 'explosion' ? 40 : 20,
        size: Math.random() * (type === 'explosion' ? 6 : 4) + 2,
        color: colorArray[Math.floor(Math.random() * colorArray.length)]
    };
}

// Reset Game
function resetGame() {
    gameState.playerY = CANVAS_HEIGHT / 2;
    gameState.playerVelocity = 0;
    gameState.obstacles = [];
    gameState.particles = [];
    gameState.stars = initStars();
    gameState.score = 0;
    gameState.difficulty = 1;
    gameState.frameCount = 0;
    gameState.gameStatus = 'waiting'; // Start in waiting state

    scoreDisplay.textContent = '0';
    difficultyDisplay.textContent = 'EASY';
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
}

// Handle Input
function handleInput() {
    if (gameState.gameStatus === 'start') {
        resetGame();
    } else if (gameState.gameStatus === 'gameOver') {
        resetGame();
    } else if (gameState.gameStatus === 'waiting') {
        // Transition from waiting to playing on first input
        gameState.gameStatus = 'playing';
        gameState.playerVelocity = BOOST_POWER;
        // Create boost particles
        for (let i = 0; i < 5; i++) {
            gameState.particles.push(createParticle(PLAYER_X - PLAYER_SIZE / 2, gameState.playerY, 'boost'));
        }
    } else if (gameState.gameStatus === 'playing') {
        gameState.playerVelocity = BOOST_POWER;
        // Create boost particles
        for (let i = 0; i < 5; i++) {
            gameState.particles.push(createParticle(PLAYER_X - PLAYER_SIZE / 2, gameState.playerY, 'boost'));
        }
    }
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleInput();
    }
});

document.addEventListener('click', handleInput);
document.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleInput();
}, { passive: false });

// Draw Player
function drawPlayer(y, velocity) {
    const tilt = Math.max(-30, Math.min(30, velocity * 3));

    ctx.save();
    ctx.translate(PLAYER_X, y);
    ctx.rotate((tilt * Math.PI) / 180);

    // Glow effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, PLAYER_SIZE);
    gradient.addColorStop(0, 'rgba(0, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(0, 255, 255, 0.3)');
    gradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, PLAYER_SIZE, 0, Math.PI * 2);
    ctx.fill();

    // Ship body
    ctx.fillStyle = '#00ffff';
    ctx.shadowColor = '#00ffff';
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.moveTo(PLAYER_SIZE / 2 + 5, 0);
    ctx.lineTo(-PLAYER_SIZE / 2, -PLAYER_SIZE / 3);
    ctx.lineTo(-PLAYER_SIZE / 3, 0);
    ctx.lineTo(-PLAYER_SIZE / 2, PLAYER_SIZE / 3);
    ctx.closePath();
    ctx.fill();

    // Inner detail
    ctx.fillStyle = '#ffffff';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(PLAYER_SIZE / 4, 0);
    ctx.lineTo(-PLAYER_SIZE / 4, -PLAYER_SIZE / 6);
    ctx.lineTo(-PLAYER_SIZE / 6, 0);
    ctx.lineTo(-PLAYER_SIZE / 4, PLAYER_SIZE / 6);
    ctx.closePath();
    ctx.fill();

    // Engine glow
    if (velocity < 0) {
        const engineGlow = ctx.createRadialGradient(-PLAYER_SIZE / 2, 0, 0, -PLAYER_SIZE / 2, 0, 20);
        engineGlow.addColorStop(0, 'rgba(255, 0, 255, 1)');
        engineGlow.addColorStop(0.5, 'rgba(255, 0, 255, 0.5)');
        engineGlow.addColorStop(1, 'rgba(255, 0, 255, 0)');
        ctx.fillStyle = engineGlow;
        ctx.shadowColor = '#ff00ff';
        ctx.shadowBlur = 30;
        ctx.beginPath();
        ctx.arc(-PLAYER_SIZE / 2 - 10, 0, 15, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
}

// Draw Obstacle
function drawObstacle(obstacle) {
    const { x, gapY, gapHeight } = obstacle;

    // Top obstacle
    const topGradient = ctx.createLinearGradient(x, 0, x + OBSTACLE_WIDTH, 0);
    topGradient.addColorStop(0, '#ff0066');
    topGradient.addColorStop(0.5, '#ff00ff');
    topGradient.addColorStop(1, '#ff0066');

    ctx.fillStyle = topGradient;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.fillRect(x, 0, OBSTACLE_WIDTH, gapY - gapHeight / 2);

    // Top edge glow
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.moveTo(x, gapY - gapHeight / 2);
    ctx.lineTo(x + OBSTACLE_WIDTH, gapY - gapHeight / 2);
    ctx.stroke();

    // Bottom obstacle
    ctx.fillStyle = topGradient;
    ctx.shadowColor = '#ff00ff';
    ctx.shadowBlur = 20;
    ctx.fillRect(x, gapY + gapHeight / 2, OBSTACLE_WIDTH, CANVAS_HEIGHT - (gapY + gapHeight / 2));

    // Bottom edge glow
    ctx.beginPath();
    ctx.moveTo(x, gapY + gapHeight / 2);
    ctx.lineTo(x + OBSTACLE_WIDTH, gapY + gapHeight / 2);
    ctx.stroke();

    // Decorative lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    for (let i = 0; i < gapY - gapHeight / 2; i += 20) {
        ctx.beginPath();
        ctx.moveTo(x + 10, i);
        ctx.lineTo(x + OBSTACLE_WIDTH - 10, i);
        ctx.stroke();
    }
    for (let i = gapY + gapHeight / 2 + 20; i < CANVAS_HEIGHT; i += 20) {
        ctx.beginPath();
        ctx.moveTo(x + 10, i);
        ctx.lineTo(x + OBSTACLE_WIDTH - 10, i);
        ctx.stroke();
    }
}

// Get Difficulty Label
function getDifficultyLabel() {
    const diff = Math.floor(gameState.difficulty);
    const labels = ['EASY', 'NORMAL', 'HARD', 'EXTREME', 'INSANE'];
    return labels[Math.min(diff - 1, labels.length - 1)] || 'LEGENDARY';
}

// Game Over
function gameOver() {
    gameState.gameStatus = 'gameOver';
    finalScore.textContent = gameState.score;
    finalHighScore.textContent = gameState.highScore;

    if (gameState.score === gameState.highScore && gameState.score > 0) {
        newHighScore.classList.remove('hidden');
    } else {
        newHighScore.classList.add('hidden');
    }

    gameOverScreen.classList.remove('hidden');
}

// Game Loop
function gameLoop() {
    gameState.frameCount++;

    // Clear canvas
    ctx.fillStyle = '#050510';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw stars
    gameState.stars.forEach(star => {
        star.x -= star.speed;
        if (star.x < 0) {
            star.x = CANVAS_WIDTH;
            star.y = Math.random() * CANVAS_HEIGHT;
        }
        ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw grid lines (moving background)
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    const gridOffset = (gameState.frameCount * 2) % 50;
    for (let x = -gridOffset; x < CANVAS_WIDTH; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y < CANVAS_HEIGHT; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }

    if (gameState.gameStatus === 'playing') {
        // Update difficulty
        gameState.difficulty = 1 + Math.floor(gameState.score / 5) * 0.2;
        const obstacleSpeed = Math.min(BASE_OBSTACLE_SPEED + (gameState.difficulty - 1) * 0.5, MAX_OBSTACLE_SPEED);
        const gapHeight = Math.max(BASE_GAP_HEIGHT - (gameState.difficulty - 1) * 10, MIN_GAP_HEIGHT);

        difficultyDisplay.textContent = getDifficultyLabel();

        // Apply gravity
        gameState.playerVelocity += GRAVITY;
        gameState.playerY += gameState.playerVelocity;

        // Create trail particles
        if (gameState.frameCount % 2 === 0) {
            gameState.particles.push(createParticle(PLAYER_X - PLAYER_SIZE / 2, gameState.playerY, 'trail'));
        }

        // Spawn obstacles
        if (gameState.obstacles.length === 0 ||
            gameState.obstacles[gameState.obstacles.length - 1].x < CANVAS_WIDTH - 300) {
            const gapY = Math.random() * (CANVAS_HEIGHT - gapHeight - 100) + 50 + gapHeight / 2;
            gameState.obstacles.push({
                x: CANVAS_WIDTH,
                gapY,
                gapHeight,
                passed: false
            });
        }

        // Update obstacles
        gameState.obstacles.forEach(obstacle => {
            obstacle.x -= obstacleSpeed;

            // Check if passed
            if (!obstacle.passed && obstacle.x + OBSTACLE_WIDTH < PLAYER_X) {
                obstacle.passed = true;
                gameState.score++;
                scoreDisplay.textContent = gameState.score;

                if (gameState.score > gameState.highScore) {
                    gameState.highScore = gameState.score;
                    localStorage.setItem('neonBoostHighScore', gameState.highScore.toString());
                    highScoreDisplay.textContent = gameState.highScore;
                }
            }

            // Collision detection
            if (
                PLAYER_X + PLAYER_SIZE / 2 > obstacle.x &&
                PLAYER_X - PLAYER_SIZE / 2 < obstacle.x + OBSTACLE_WIDTH
            ) {
                if (
                    gameState.playerY - PLAYER_SIZE / 3 < obstacle.gapY - obstacle.gapHeight / 2 ||
                    gameState.playerY + PLAYER_SIZE / 3 > obstacle.gapY + obstacle.gapHeight / 2
                ) {
                    // Collision!
                    for (let i = 0; i < 30; i++) {
                        gameState.particles.push(createParticle(PLAYER_X, gameState.playerY, 'explosion'));
                    }
                    gameOver();
                }
            }
        });

        // Remove off-screen obstacles
        gameState.obstacles = gameState.obstacles.filter(o => o.x + OBSTACLE_WIDTH > 0);

        // Check boundaries
        if (gameState.playerY < PLAYER_SIZE / 2 || gameState.playerY > CANVAS_HEIGHT - PLAYER_SIZE / 2) {
            for (let i = 0; i < 30; i++) {
                gameState.particles.push(createParticle(PLAYER_X, gameState.playerY, 'explosion'));
            }
            gameOver();
        }
    }

    // Update and draw particles
    gameState.particles = gameState.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;

        const alpha = p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;

        return p.life > 0;
    });

    // Draw obstacles
    gameState.obstacles.forEach(obstacle => drawObstacle(obstacle));

    // Draw player
    if (gameState.gameStatus !== 'gameOver') {
        drawPlayer(gameState.playerY, gameState.playerVelocity);
    }

    // Draw "waiting to start" hint
    if (gameState.gameStatus === 'waiting') {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.8)';
        ctx.font = '20px Orbitron, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.fillText('PRESS SPACE OR CLICK TO START', CANVAS_WIDTH / 2, CANVAS_HEIGHT - 50);
        ctx.shadowBlur = 0;
    }

    // Draw scanlines overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let y = 0; y < CANVAS_HEIGHT; y += 4) {
        ctx.fillRect(0, y, CANVAS_WIDTH, 2);
    }

    requestAnimationFrame(gameLoop);
}

// Initialize game
gameState.stars = initStars();
requestAnimationFrame(gameLoop);
