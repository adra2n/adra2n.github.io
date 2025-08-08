const board = document.getElementById('board');
const status = document.getElementById('status');
const score = document.getElementById('score');
const pvpBtn = document.getElementById('pvp');
const pvcBtn = document.getElementById('pvc');

let currentPlayer = 'black';
let gameMode = null;
let gameOver = false;
let boardState = Array(15).fill().map(() => Array(15).fill(null));
let playerScore = 0;
let aiScore = 0;

// Initialize the board
function initBoard() {
    board.innerHTML = '';
    boardState = Array(15).fill().map(() => Array(15).fill(null));
    gameOver = false;
    status.textContent = `当前玩家: ${currentPlayer === 'black' ? '黑子' : '白子'}`;

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = i;
            cell.dataset.col = j;
            cell.addEventListener('click', () => handleCellClick(i, j));
            board.appendChild(cell);
        }
    }
}

// Handle cell click
function handleCellClick(row, col) {
    if (gameOver || boardState[row][col] !== null) return;

    boardState[row][col] = currentPlayer;
    const cell = document.querySelector(`[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add(currentPlayer);

    if (checkWin(row, col)) {
        gameOver = true;
        if (currentPlayer === 'black') {
            playerScore++;
            status.textContent = '黑子获胜！';
        } else {
            if (gameMode === 'pvc') {
                aiScore++;
                status.textContent = 'AI 获胜！';
            } else {
                status.textContent = '白子获胜！';
            }
        }
        score.textContent = `比分: 玩家 ${playerScore} - ${aiScore} AI`;
        setTimeout(() => {
            if (playerScore === 2 || aiScore === 2) {
                alert(`比赛结束！最终比分: 玩家 ${playerScore} - ${aiScore} AI`);
                resetGame();
            } else {
                initBoard();
                currentPlayer = 'black';
            }
        }, 1000);
        return;
    }

    currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    status.textContent = `当前玩家: ${currentPlayer === 'black' ? '黑子' : '白子'}`;

    if (gameMode === 'pvc' && currentPlayer === 'white') {
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}

// Check for win condition
function checkWin(row, col) {
    const directions = [
        [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (const [dx, dy] of directions) {
        let count = 1;

        for (let i = 1; i < 5; i++) {
            const newRow = row + i * dx;
            const newCol = col + i * dy;
            if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15 || boardState[newRow][newCol] !== currentPlayer) break;
            count++;
        }

        for (let i = 1; i < 5; i++) {
            const newRow = row - i * dx;
            const newCol = col - i * dy;
            if (newRow < 0 || newRow >= 15 || newCol < 0 || newCol >= 15 || boardState[newRow][newCol] !== currentPlayer) break;
            count++;
        }

        if (count >= 5) return true;
    }

    return false;
}

// AI move
function aiMove() {
    const emptyCells = [];
    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            if (boardState[i][j] === null) {
                emptyCells.push({ row: i, col: j });
            }
        }
    }

    if (emptyCells.length > 0) {
        const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        handleCellClick(randomCell.row, randomCell.col);
    }
}

// Reset game
function resetGame() {
    playerScore = 0;
    aiScore = 0;
    currentPlayer = 'black';
    gameMode = null;
    gameOver = false;
    status.textContent = '请选择游戏模式';
    score.textContent = '比分: 玩家 0 - 0 AI';
    board.innerHTML = '';
}

// Event listeners for game mode selection
pvpBtn.addEventListener('click', () => {
    gameMode = 'pvp';
    initBoard();
});

pvcBtn.addEventListener('click', () => {
    gameMode = 'pvc';
    initBoard();
});

// Initialize the game
resetGame();