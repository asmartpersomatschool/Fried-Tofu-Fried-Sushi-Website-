// Game Elements
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreBoard = document.getElementById('scoreBoard');
const highScoreDisplay = document.getElementById('highScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const winScreen = document.getElementById('winScreen');

// Button References
const startBtn = document.getElementById('startBtn');
const retryBtn = document.getElementById('retryBtn');
const playAgainBtn = document.getElementById('playAgainBtn');

// Game Variables
let score = 0;
let highScore = localStorage.getItem('tofuHighScore') || 0;
let isPlaying = false;
let items = [];
let gameLoop;
let scallionsCaught = 0;
let startTime = 0;
const WIN_SCORE = 200;

// Player Object
const player = { x: 0, y: 0, w: 55, h: 55 };

// Initialize high score display
highScoreDisplay.innerText = "HIGH SCORE: " + highScore;

// Canvas resize handler
function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    player.y = canvas.height - 70;
}

window.addEventListener('resize', resize);
resize();

// Mouse/Touch movement handler
function handleMove(e) {
    if (!isPlaying) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    player.x = (clientX - rect.left) - player.w / 2;
}

canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('touchmove', (e) => { 
    e.preventDefault(); 
    handleMove(e); 
}, { passive: false });

// Get rank based on score
function getRank(s) {
    if(s >= WIN_SCORE) return "🏆 Master Chef";
    if(s > 150) return "👨‍🍳 Executive Chef";
    if(s > 100) return "🍳 Sous Chef";
    if(s > 50) return "🔪 Line Cook";
    return "🌱 Kitchen Helper";
}

// Initialize game
function initGame() {
    score = 0;
    items = [];
    scallionsCaught = 0;
    startTime = Date.now();
    isPlaying = true;
    scoreBoard.innerText = "SCORE: 0";
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    winScreen.classList.add('hidden');
    if(gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(spawnItem, 700);
    requestAnimationFrame(update);
}

// Spawn falling items
function spawnItem() {
    if(!isPlaying) return;
    const isChili = Math.random() < 0.25;
    items.push({
        x: Math.random() * (canvas.width - 30),
        y: -30,
        type: isChili ? 'chili' : 'scallion',
        speed: 3 + (score / 200)
    });
}

// End game function
function endGame(won) {
    isPlaying = false;
    clearInterval(gameLoop);
    
    const timeSurvived = Math.floor((Date.now() - startTime) / 1000);
    
    // Update high score
    if(score > highScore) {
        highScore = score;
        localStorage.setItem('tofuHighScore', highScore);
        highScoreDisplay.innerText = "HIGH SCORE: " + highScore;
    }

    if(won) {
        // Victory screen
        winScreen.classList.remove('hidden');
        document.getElementById('winScore').innerText = "Final Score: " + score;
        document.getElementById('winScallions').innerText = scallionsCaught;
        document.getElementById('winTime').innerText = timeSurvived + "s";
        document.getElementById('winHighScore').innerText = highScore;
    } else {
        // Game over screen
        gameOverScreen.classList.remove('hidden');
        document.getElementById('rankBadge').innerText = getRank(score);
        document.getElementById('finalScore').innerText = "Score: " + score;
        document.getElementById('statScallions').innerText = scallionsCaught;
        document.getElementById('statTime').innerText = timeSurvived + "s";
        document.getElementById('statHighScore').innerText = highScore;
    }
}

// Main game loop
function update() {
    if(!isPlaying) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Player Tofu with glow effect
    ctx.shadowColor = '#FFC107';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#FFC107';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.shadowBlur = 0;
    
    // Tofu border
    ctx.strokeStyle = '#F57F17';
    ctx.lineWidth = 3;
    ctx.strokeRect(player.x, player.y, player.w, player.h);
    
    // Draw tofu face
    ctx.fillStyle = '#5D4037';
    ctx.fillRect(player.x + 12, player.y + 15, 5, 5);
    ctx.fillRect(player.x + 38, player.y + 15, 5, 5);
    ctx.beginPath();
    ctx.arc(player.x + 27, player.y + 35, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw and update falling items
    for(let i = items.length - 1; i >= 0; i--) {
        let item = items[i];
        item.y += item.speed;

        if(item.type === 'scallion') {
            // Draw scallion with glow
            ctx.fillStyle = '#2ecc71';
            ctx.shadowColor = '#2ecc71';
            ctx.shadowBlur = 5;
            ctx.fillRect(item.x, item.y, 25, 10);
            ctx.shadowBlur = 0;
        } else {
            // Draw chili with glow
            ctx.fillStyle = '#e74c3c';
            ctx.shadowColor = '#e74c3c';
            ctx.shadowBlur = 5;
            ctx.beginPath();
            ctx.moveTo(item.x + 10, item.y);
            ctx.lineTo(item.x + 18, item.y + 15);
            ctx.lineTo(item.x + 10, item.y + 25);
            ctx.lineTo(item.x + 2, item.y + 15);
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        // Collision detection
        if(item.y + 20 > player.y && item.x < player.x + player.w && item.x + 20 > player.x) {
            if(item.type === 'scallion') {
                score += 10;
                scallionsCaught++;
                scoreBoard.innerText = "SCORE: " + score;
                items.splice(i, 1);
                
                // Check for win
                if(score >= WIN_SCORE) {
                    endGame(true);
                }
            } else {
                // Hit chili - game over
                endGame(false);
            }
        }
        
        // Remove items that fall off screen
        if(item.y > canvas.height) {
            items.splice(i, 1);
        }
    }
    
    requestAnimationFrame(update);
}

// Event listeners for buttons
startBtn.addEventListener('click', initGame);
retryBtn.addEventListener('click', initGame);
playAgainBtn.addEventListener('click', initGame);

// ============================================
// SUSHI GAME CODE
// ============================================

// Game Elements
const sushiCanvas = document.getElementById('sushiGameCanvas');
const sushiCtx = sushiCanvas.getContext('2d');
const sushiScoreBoard = document.getElementById('sushiScoreBoard');
const sushiHighScoreDisplay = document.getElementById('sushiHighScore');
const sushiStartScreen = document.getElementById('sushiStartScreen');
const sushiGameOverScreen = document.getElementById('sushiGameOverScreen');
const sushiWinScreen = document.getElementById('sushiWinScreen');

// Button References
const sushiStartBtn = document.getElementById('sushiStartBtn');
const sushiRetryBtn = document.getElementById('sushiRetryBtn');
const sushiPlayAgainBtn = document.getElementById('sushiPlayAgainBtn');

// Game Variables
let sushiScore = 0;
let sushiHighScore = localStorage.getItem('sushiHighScore') || 0;
let sushiIsPlaying = false;
let sushiItems = [];
let sushiGameLoop;
let sushiCaught = 0;
let sushiStartTime = 0;
const SUSHI_WIN_SCORE = 200;

// Player Object
const sushiPlayer = { x: 0, y: 0, w: 55, h: 55 };

// Initialize high score display
sushiHighScoreDisplay.innerText = "HIGH SCORE: " + sushiHighScore;

// Canvas resize handler
function sushiResize() {
    sushiCanvas.width = sushiCanvas.offsetWidth;
    sushiCanvas.height = sushiCanvas.offsetHeight;
    sushiPlayer.y = sushiCanvas.height - 70;
}

window.addEventListener('resize', sushiResize);
sushiResize();

// Mouse/Touch movement handler
function sushiHandleMove(e) {
    if (!sushiIsPlaying) return;
    const rect = sushiCanvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    sushiPlayer.x = (clientX - rect.left) - sushiPlayer.w / 2;
}

sushiCanvas.addEventListener('mousemove', sushiHandleMove);
sushiCanvas.addEventListener('touchmove', (e) => { 
    e.preventDefault(); 
    sushiHandleMove(e); 
}, { passive: false });

// Get rank based on score
function getSushiRank(s) {
    if(s >= SUSHI_WIN_SCORE) return "🏆 Sushi Master";
    if(s > 150) return "👨‍🍳 Sushi Chef";
    if(s > 100) return "🍱 Sushi Cook";
    if(s > 50) return "🔪 Apprentice";
    return "🍱 Beginner";
}

// Initialize sushi game
function initSushiGame() {
    sushiScore = 0;
    sushiItems = [];
    sushiCaught = 0;
    sushiStartTime = Date.now();
    sushiIsPlaying = true;
    sushiScoreBoard.innerText = "SCORE: 0";
    sushiStartScreen.classList.add('hidden');
    sushiGameOverScreen.classList.add('hidden');
    sushiWinScreen.classList.add('hidden');
    if(sushiGameLoop) clearInterval(sushiGameLoop);
    sushiGameLoop = setInterval(spawnSushiItem, 700);
    requestAnimationFrame(updateSushi);
}

// Spawn falling items
function spawnSushiItem() {
    if(!sushiIsPlaying) return;
    const isWasabi = Math.random() < 0.25;
    sushiItems.push({
        x: Math.random() * (sushiCanvas.width - 30),
        y: -30,
        type: isWasabi ? 'wasabi' : 'sushi',
        speed: 3 + (sushiScore / 200)
    });
}

// End sushi game function
function endSushiGame(won) {
    sushiIsPlaying = false;
    clearInterval(sushiGameLoop);
    
    const timeSurvived = Math.floor((Date.now() - sushiStartTime) / 1000);
    
    // Update high score
    if(sushiScore > sushiHighScore) {
        sushiHighScore = sushiScore;
        localStorage.setItem('sushiHighScore', sushiHighScore);
        sushiHighScoreDisplay.innerText = "HIGH SCORE: " + sushiHighScore;
    }

    if(won) {
        // Victory screen
        sushiWinScreen.classList.remove('hidden');
        document.getElementById('sushiWinScore').innerText = "Final Score: " + sushiScore;
        document.getElementById('sushiWinCaught').innerText = sushiCaught;
        document.getElementById('sushiWinTime').innerText = timeSurvived + "s";
        document.getElementById('sushiWinHighScore').innerText = sushiHighScore;
    } else {
        // Game over screen
        sushiGameOverScreen.classList.remove('hidden');
        document.getElementById('sushiRankBadge').innerText = getSushiRank(sushiScore);
        document.getElementById('sushiFinalScore').innerText = "Score: " + sushiScore;
        document.getElementById('sushiStatCaught').innerText = sushiCaught;
        document.getElementById('sushiStatTime').innerText = timeSurvived + "s";
        document.getElementById('sushiStatHighScore').innerText = sushiHighScore;
    }
}

// Main sushi game loop
function updateSushi() {
    if(!sushiIsPlaying) return;
    sushiCtx.clearRect(0, 0, sushiCanvas.width, sushiCanvas.height);

    // Draw Player Plate with glow effect
    sushiCtx.shadowColor = '#e74c3c';
    sushiCtx.shadowBlur = 10;
    sushiCtx.fillStyle = '#e74c3c';
    sushiCtx.fillRect(sushiPlayer.x, sushiPlayer.y, sushiPlayer.w, sushiPlayer.h);
    sushiCtx.shadowBlur = 0;
    
    // Plate border
    sushiCtx.strokeStyle = '#c0392b';
    sushiCtx.lineWidth = 3;
    sushiCtx.strokeRect(sushiPlayer.x, sushiPlayer.y, sushiPlayer.w, sushiPlayer.h);
    
    // Draw plate face
    sushiCtx.fillStyle = '#fff';
    sushiCtx.fillRect(sushiPlayer.x + 12, sushiPlayer.y + 15, 5, 5);
    sushiCtx.fillRect(sushiPlayer.x + 38, sushiPlayer.y + 15, 5, 5);
    sushiCtx.beginPath();
    sushiCtx.arc(sushiPlayer.x + 27, sushiPlayer.y + 35, 8, 0.2 * Math.PI, 0.8 * Math.PI);
    sushiCtx.strokeStyle = '#fff';
    sushiCtx.lineWidth = 2;
    sushiCtx.stroke();

    // Draw and update falling items
    for(let i = sushiItems.length - 1; i >= 0; i--) {
        let item = sushiItems[i];
        item.y += item.speed;

        if(item.type === 'sushi') {
            // Draw sushi roll with glow
            sushiCtx.fillStyle = '#2ecc71';
            sushiCtx.shadowColor = '#27ae60';
            sushiCtx.shadowBlur = 5;
            
            // Sushi roll shape (rectangle)
            sushiCtx.fillRect(item.x, item.y, 25, 12);
            
            // Rice details
            sushiCtx.fillStyle = '#fff';
            sushiCtx.fillRect(item.x + 2, item.y + 2, 21, 8);
            sushiCtx.fillStyle = '#e74c3c';
            sushiCtx.fillRect(item.x + 8, item.y + 4, 10, 4);
            
            sushiCtx.shadowBlur = 0;
        } else {
            // Draw wasabi bomb with glow
            sushiCtx.fillStyle = '#27ae60';
            sushiCtx.shadowColor = '#27ae60';
            sushiCtx.shadowBlur = 5;
            sushiCtx.beginPath();
            sushiCtx.arc(item.x + 12, item.y + 12, 12, 0, Math.PI * 2);
            sushiCtx.fill();
            
            // Wasabi texture
            sushiCtx.fillStyle = '#2ecc71';
            sushiCtx.beginPath();
            sushiCtx.arc(item.x + 10, item.y + 10, 4, 0, Math.PI * 2);
            sushiCtx.fill();
            
            sushiCtx.shadowBlur = 0;
        }

        // Collision detection
        if(item.y + 20 > sushiPlayer.y && item.x < sushiPlayer.x + sushiPlayer.w && item.x + 20 > sushiPlayer.x) {
            if(item.type === 'sushi') {
                sushiScore += 10;
                sushiCaught++;
                sushiScoreBoard.innerText = "SCORE: " + sushiScore;
                sushiItems.splice(i, 1);
                
                // Check for win
                if(sushiScore >= SUSHI_WIN_SCORE) {
                    endSushiGame(true);
                }
            } else {
                // Hit wasabi - game over
                endSushiGame(false);
            }
        }
        
        // Remove items that fall off screen
        if(item.y > sushiCanvas.height) {
            sushiItems.splice(i, 1);
        }
    }
    
    requestAnimationFrame(updateSushi);
}

// Event listeners for sushi buttons
sushiStartBtn.addEventListener('click', initSushiGame);
sushiRetryBtn.addEventListener('click', initSushiGame);
sushiPlayAgainBtn.addEventListener('click', initSushiGame);
// Poll Logic
function updatePollUI() {
    const tofuVotes = parseInt(localStorage.getItem('tofuVotes') || 0);
    const sushiVotes = parseInt(localStorage.getItem('sushiVotes') || 0);
    const total = tofuVotes + sushiVotes;

    if (total > 0) {
        const tofuPct = Math.round((tofuVotes / total) * 100);
        const sushiPct = Math.round((sushiVotes / total) * 100);

        document.getElementById('tofu-bar').style.width = tofuPct + '%';
        document.getElementById('sushi-bar').style.width = sushiPct + '%';
        document.getElementById('tofu-percent').innerText = tofuPct + '%';
        document.getElementById('sushi-percent').innerText = sushiPct + '%';
    }
}

function castVote(choice) {
    const currentVotes = parseInt(localStorage.getItem(choice + 'Votes') || 0);
    localStorage.setItem(choice + 'Votes', currentVotes + 1);
    
    document.getElementById('poll-thanks').style.display = 'block';
    updatePollUI();
    
    // Disable clicking after vote
    document.querySelectorAll('.poll-card').forEach(card => card.style.pointerEvents = 'none');
}

// Initialize poll on load
updatePollUI();
