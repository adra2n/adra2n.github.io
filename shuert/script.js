class SchulteGridGame {
    constructor() {
        this.gridSize = 3; // 默认网格大小
        this.sequence = []; // 序列
        this.currentNumber = 1; // 当前应该点击的数字
        this.timer = 0; // 计时器
        this.timerInterval = null; // 计时器句柄
        this.username = ''; // 玩家昵称
        this.isGameActive = false; // 游戏是否正在进行
        
        // 获取DOM元素
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            usernameInput: document.getElementById('username-input'),
            gameContainer: document.getElementById('game-container'),
            gameOver: document.getElementById('game-over'),
            leaderboard: document.getElementById('leaderboard'),
            username: document.getElementById('username'),
            gridContainer: document.getElementById('grid-container'),
            timer: document.getElementById('timer'),
            currentPlayer: document.getElementById('current-player'),
            currentDifficulty: document.getElementById('current-difficulty'),
            finalTime: document.getElementById('final-time'),
            leaderboardBody: document.getElementById('leaderboard-body'),
            leaderboardLevel: document.getElementById('leaderboard-level')
        };
        
        this.initEventListeners();
        this.loadLeaderboard();
    }
    
    initEventListeners() {
        // 难度选择按钮
        document.getElementById('easy-btn').addEventListener('click', () => this.selectDifficulty(3));
        document.getElementById('medium-btn').addEventListener('click', () => this.selectDifficulty(4));
        document.getElementById('hard-btn').addEventListener('click', () => this.selectDifficulty(5));
        
        // 开始游戏按钮
        document.getElementById('start-game-btn').addEventListener('click', () => this.startGame());
        
        // 返回主菜单按钮
        document.getElementById('back-to-menu').addEventListener('click', () => this.showMainMenu());
        document.getElementById('back-to-menu-from-leaderboard').addEventListener('click', () => this.showMainMenu());
        
        // 显示排行榜按钮
        document.getElementById('show-leaderboard-btn').addEventListener('click', () => this.showLeaderboard());
        document.getElementById('show-leaderboard').addEventListener('click', () => this.showLeaderboard());
        
        // 用户名输入框回车事件
        this.elements.username.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
                this.startGame();
            }
        });
    }
    
    selectDifficulty(size) {
        this.gridSize = size;
        this.elements.usernameInput.classList.remove('hidden');
        this.elements.mainMenu.classList.add('hidden');
        this.elements.username.focus();
    }
    
    startGame() {
        this.username = this.elements.username.value.trim();
        if (!this.username) {
            alert('请输入昵称！');
            return;
        }
        
        // 设置游戏状态
        this.currentNumber = 1;
        this.timer = 0;
        this.elements.timer.textContent = '0.00';
        this.elements.currentPlayer.textContent = this.username;
        
        // 根据难度设置显示文本
        const difficultyText = {
            3: '初级 (3x3)',
            4: '中级 (4x4)',
            5: '高级 (5x5)'
        };
        this.elements.currentDifficulty.textContent = difficultyText[this.gridSize];
        
        // 切换到游戏界面
        this.elements.usernameInput.classList.add('hidden');
        this.elements.gameContainer.classList.remove('hidden');
        
        // 生成并显示游戏网格
        this.generateGrid();
        this.startTimer();
        this.isGameActive = true;
    }
    
    generateGrid() {
        // 生成序列
        const totalCells = this.gridSize * this.gridSize;
        this.sequence = Array.from({length: totalCells}, (_, i) => i + 1);
        
        // 随机打乱序列
        for (let i = this.sequence.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.sequence[i], this.sequence[j]] = [this.sequence[j], this.sequence[i]];
        }
        
        // 创建网格
        this.elements.gridContainer.innerHTML = '';
        this.elements.gridContainer.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.textContent = this.sequence[i];
            cell.dataset.number = this.sequence[i];
            
            cell.addEventListener('click', () => this.handleCellClick(cell));
            this.elements.gridContainer.appendChild(cell);
        }
        
        // 标记第一个要点击的单元格
        this.updateCurrentCellHighlight();
    }
    
    handleCellClick(cell) {
        if (!this.isGameActive) return;
        
        const clickedNumber = parseInt(cell.dataset.number);
        
        if (clickedNumber === this.currentNumber) {
            cell.classList.add('completed');
            this.currentNumber++;
            
            if (this.currentNumber > this.gridSize * this.gridSize) {
                // 游戏完成
                this.endGame();
            } else {
                // 更新高亮
                this.updateCurrentCellHighlight();
            }
        }
    }
    
    updateCurrentCellHighlight() {
        // 移除之前的所有高亮
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.classList.remove('current');
        });
        
        // 高亮当前应该点击的数字
        const currentCell = document.querySelector(`.grid-cell[data-number="${this.currentNumber}"]`);
        if (currentCell) {
            currentCell.classList.add('current');
        }
    }
    
    startTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
        
        this.timerInterval = setInterval(() => {
            this.timer += 0.01;
            this.elements.timer.textContent = this.timer.toFixed(2);
        }, 10);
    }
    
    endGame() {
        this.isGameActive = false;
        clearInterval(this.timerInterval);
        
        // 保存成绩
        this.saveScore();
        
        // 显示游戏结束界面
        this.elements.finalTime.textContent = this.timer.toFixed(2);
        this.elements.gameContainer.classList.add('hidden');
        this.elements.gameOver.classList.remove('hidden');
    }
    
    saveScore() {
        // 获取已有的排行榜数据
        let leaderboard = JSON.parse(localStorage.getItem('schulteLeaderboard') || '[]');
        
        // 添加新纪录
        const newRecord = {
            username: this.username,
            gridSize: this.gridSize,
            time: parseFloat(this.timer.toFixed(2)),
            date: new Date().toLocaleDateString('zh-CN')
        };
        
        leaderboard.push(newRecord);
        
        // 按时间排序（升序）
        leaderboard.sort((a, b) => a.time - b.time);
        
        // 只保留前100条记录
        if (leaderboard.length > 100) {
            leaderboard = leaderboard.slice(0, 100);
        }
        
        // 保存到localStorage
        localStorage.setItem('schulteLeaderboard', JSON.stringify(leaderboard));
    }
    
    loadLeaderboard() {
        return JSON.parse(localStorage.getItem('schulteLeaderboard') || '[]');
    }
    
    showLeaderboard() {
        this.elements.mainMenu.classList.add('hidden');
        this.elements.gameOver.classList.add('hidden');
        this.elements.leaderboard.classList.remove('hidden');
        this.renderLeaderboard();
    }
    
    renderLeaderboard() {
        const leaderboard = this.loadLeaderboard();
        const selectedLevel = this.elements.leaderboardLevel.value;
        
        // 过滤数据
        let filteredData = leaderboard;
        if (selectedLevel !== 'all') {
            filteredData = leaderboard.filter(record => record.gridSize == selectedLevel);
        }
        
        // 显示前20条记录
        const displayData = filteredData.slice(0, 20);
        
        // 渲染表格
        this.elements.leaderboardBody.innerHTML = '';
        
        if (displayData.length === 0) {
            const row = document.createElement('tr');
            row.innerHTML = '<td colspan="5">暂无记录</td>';
            this.elements.leaderboardBody.appendChild(row);
            return;
        }
        
        displayData.forEach((record, index) => {
            const row = document.createElement('tr');
            
            // 根据难度设置显示文本
            const difficultyText = {
                3: '初级',
                4: '中级',
                5: '高级'
            };
            
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${record.username}</td>
                <td>${difficultyText[record.gridSize]}</td>
                <td>${record.time.toFixed(2)}</td>
                <td>${record.date}</td>
            `;
            
            this.elements.leaderboardBody.appendChild(row);
        });
    }
    
    showMainMenu() {
        // 隐藏所有界面
        this.elements.usernameInput.classList.add('hidden');
        this.elements.gameContainer.classList.add('hidden');
        this.elements.gameOver.classList.add('hidden');
        this.elements.leaderboard.classList.add('hidden');
        
        // 显示主菜单
        this.elements.mainMenu.classList.remove('hidden');
        
        // 重置用户名输入
        this.elements.username.value = '';
        
        // 停止计时器
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.isGameActive = false;
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.game = new SchulteGridGame();
});