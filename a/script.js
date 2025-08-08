class GomokuGame {
    constructor() {
        this.boardSize = 15;
        this.board = [];
        this.currentPlayer = 'black'; // black or white
        this.gameOver = false;
        this.gameMode = 'pvp'; // pvp or pvc
        this.scores = { black: 0, white: 0 };
        this.round = 0;
        this.maxRounds = 3; // 三局两胜
        
        this.initBoard();
        this.setupEventListeners();
        this.updateUI();
    }
    
    initBoard() {
        this.board = [];
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
        
        this.renderBoard();
    }
    
    renderBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';
        gameBoard.style.width = this.boardSize * 30 + 'px';
        gameBoard.style.height = this.boardSize * 30 + 'px';
        
        // 创建棋盘格子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.style.left = j * 30 + 'px';
                cell.style.top = i * 30 + 'px';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // 如果有棋子，添加棋子
                if (this.board[i][j]) {
                    const piece = document.createElement('div');
                    piece.className = `piece ${this.board[i][j]}-piece`;
                    cell.appendChild(piece);
                }
                
                gameBoard.appendChild(cell);
            }
        }
    }
    
    setupEventListeners() {
        // 棋盘点击事件
        document.getElementById('game-board').addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const cell = e.target.closest('.cell');
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            
            this.makeMove(row, col);
        });
        
        // 重新开始按钮
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // 游戏模式切换
        document.getElementById('game-mode').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
            this.restartMatch();
        });
    }
    
    makeMove(row, col) {
        // 检查位置是否为空
        if (this.board[row][col] !== null) return;
        
        // 下棋
        this.board[row][col] = this.currentPlayer;
        
        // 检查是否获胜
        if (this.checkWin(row, col)) {
            this.handleWin();
            return;
        }
        
        // 检查是否平局
        if (this.checkDraw()) {
            this.handleDraw();
            return;
        }
        
        // 切换玩家
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        
        // 更新UI
        this.updateUI();
        this.renderBoard();
        
        // 如果是人机对战且轮到电脑
        if (this.gameMode === 'pvc' && this.currentPlayer === 'white' && !this.gameOver) {
            setTimeout(() => {
                this.makeAIMove();
            }, 500);
        }
    }
    
    makeAIMove() {
        // 简单AI算法：随机选择一个空位置
        const emptyCells = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    emptyCells.push({row: i, col: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            const {row, col} = emptyCells[randomIndex];
            this.makeMove(row, col);
        }
    }
    
    checkWin(row, col) {
        const player = this.board[row][col];
        if (!player) return false;
        
        // 检查四个方向：水平、垂直、两个对角线
        const directions = [
            [0, 1],   // 水平
            [1, 0],   // 垂直
            [1, 1],   // 对角线 \
            [1, -1]   // 对角线 /
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1; // 包括当前棋子
            
            // 正向检查
            for (let i = 1; i < 5; i++) {
                const r = row + dx * i;
                const c = col + dy * i;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反向检查
            for (let i = 1; i < 5; i++) {
                const r = row - dx * i;
                const c = col - dy * i;
                if (r >= 0 && r < this.boardSize && c >= 0 && c < this.boardSize && this.board[r][c] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 如果连成五子则获胜
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    checkDraw() {
        // 检查是否所有位置都被占满
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    handleWin() {
        this.gameOver = true;
        this.scores[this.currentPlayer]++;
        
        // 更新UI
        this.updateUI();
        this.renderBoard();
        
        document.getElementById('win-message').innerText = 
            `${this.currentPlayer === 'black' ? '黑棋' : '白棋'}获胜！`;
        
        // 检查是否完成比赛
        if (this.scores.black >= 2 || this.scores.white >= 2) {
            this.endMatch();
        } else {
            // 继续下一局
            setTimeout(() => {
                this.nextRound();
            }, 2000);
        }
    }
    
    handleDraw() {
        this.gameOver = true;
        this.updateUI();
        this.renderBoard();
        
        document.getElementById('win-message').innerText = '平局！';
        
        // 继续下一局
        setTimeout(() => {
            this.nextRound();
        }, 2000);
    }
    
    nextRound() {
        this.round++;
        this.currentPlayer = 'black';
        this.gameOver = false;
        document.getElementById('win-message').innerText = '';
        this.initBoard();
        this.updateUI();
    }
    
    endMatch() {
        let winner = '';
        if (this.scores.black > this.scores.white) {
            winner = '黑棋';
        } else {
            winner = '白棋';
        }
        
        document.getElementById('game-status').innerText = `比赛结束！${winner}获得最终胜利！`;
    }
    
    updateUI() {
        // 更新当前玩家
        document.getElementById('current-player').innerText = this.currentPlayer === 'black' ? '黑棋' : '白棋';
        document.getElementById('current-player').style.color = this.currentPlayer === 'black' ? 'black' : 'gray';
        
        // 更新比分
        document.getElementById('black-score').innerText = this.scores.black;
        document.getElementById('white-score').innerText = this.scores.white;
        
        // 更新游戏状态
        if (!this.gameOver) {
            document.getElementById('game-status').innerText = 
                `第${this.round + 1}局进行中`;
        }
    }
    
    restartGame() {
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.scores = { black: 0, white: 0 };
        this.round = 0;
        document.getElementById('win-message').innerText = '';
        document.getElementById('game-status').innerText = '';
        this.initBoard();
        this.updateUI();
    }
    
    restartMatch() {
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.round = 0;
        document.getElementById('win-message').innerText = '';
        document.getElementById('game-status').innerText = '';
        this.initBoard();
        this.updateUI();
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new GomokuGame();
});