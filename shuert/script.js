// 游戏状态管理
const gameState = {
    isPlaying: false,
    isPaused: false,
    nickname: '',
    difficulty: 3,
    gridSize: 3,
    currentNumber: 1,
    startTime: 0,
    elapsedTime: 0,
    timerInterval: null,
    rankingData: []
};

// DOM元素引用
const elements = {
    // 屏幕元素
    startScreen: document.getElementById('start-screen'),
    gameScreen: document.getElementById('game-screen'),
    resultScreen: document.getElementById('result-screen'),
    rankingScreen: document.getElementById('ranking-screen'),
    pauseOverlay: document.getElementById('pause-overlay'),
    
    // 开始界面元素
    nicknameInput: document.getElementById('nickname'),
    difficultySelect: document.getElementById('difficulty'),
    startButton: document.getElementById('start-button'),
    rankingButton: document.getElementById('ranking-button'),
    
    // 游戏界面元素
    playerName: document.getElementById('player-name'),
    gameDifficulty: document.getElementById('game-difficulty'),
    timeDisplay: document.getElementById('time-display'),
    nextNum: document.getElementById('next-num'),
    gridContainer: document.getElementById('grid-container'),
    pauseButton: document.getElementById('pause-button'),
    exitButton: document.getElementById('exit-button'),
    
    // 结果界面元素
    resultName: document.getElementById('result-name'),
    resultDifficulty: document.getElementById('result-difficulty'),
    resultTime: document.getElementById('result-time'),
    playAgainButton: document.getElementById('play-again-button'),
    backToStartButton: document.getElementById('back-to-start-button'),
    
    // 排行榜界面元素
    tabButtons: document.querySelectorAll('.tab-btn'),
    rankingList: document.getElementById('ranking-list'),
    backButton: document.getElementById('back-button'),
    
    // 暂停界面元素
    resumeButton: document.getElementById('resume-button'),
    quitButton: document.getElementById('quit-button')
};

// 初始化游戏
function init() {
    // 加载排行榜数据
    loadRankingData();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 验证开始按钮
    validateStartButton();
}

// 绑定事件监听器
function bindEventListeners() {
    // 开始界面事件
    elements.nicknameInput.addEventListener('input', validateStartButton);
    elements.startButton.addEventListener('click', startGame);
    elements.rankingButton.addEventListener('click', showRankingScreen);
    
    // 游戏界面事件
    elements.pauseButton.addEventListener('click', pauseGame);
    elements.exitButton.addEventListener('click', exitGame);
    
    // 结果界面事件
    elements.playAgainButton.addEventListener('click', playAgain);
    elements.backToStartButton.addEventListener('click', showStartScreen);
    
    // 排行榜界面事件
    elements.tabButtons.forEach(button => {
        button.addEventListener('click', () => filterRankingByDifficulty(button.dataset.difficulty));
    });
    elements.backButton.addEventListener('click', showStartScreen);
    
    // 暂停界面事件
    elements.resumeButton.addEventListener('click', resumeGame);
    elements.quitButton.addEventListener('click', exitGame);
}

// 验证开始按钮
function validateStartButton() {
    elements.startButton.disabled = elements.nicknameInput.value.trim() === '';
}

// 开始游戏
function startGame() {
    // 获取玩家输入
    gameState.nickname = elements.nicknameInput.value.trim();
    gameState.difficulty = parseInt(elements.difficultySelect.value);
    gameState.gridSize = gameState.difficulty;
    
    // 重置游戏状态
    gameState.isPlaying = true;
    gameState.isPaused = false;
    gameState.currentNumber = 1;
    gameState.elapsedTime = 0;
    
    // 更新游戏信息显示
    elements.playerName.textContent = gameState.nickname;
    elements.gameDifficulty.textContent = `${gameState.gridSize}x${gameState.gridSize}`;
    elements.nextNum.textContent = gameState.currentNumber;
    elements.timeDisplay.textContent = '00:00.00';
    
    // 生成舒尔特方格
    generateGrid();
    
    // 切换屏幕
    showGameScreen();
    
    // 开始计时
    startTimer();
}

// 生成舒尔特方格
function generateGrid() {
    elements.gridContainer.innerHTML = '';
    
    // 设置网格样式
    elements.gridContainer.style.gridTemplateColumns = `repeat(${gameState.gridSize}, 1fr)`;
    elements.gridContainer.style.gridTemplateRows = `repeat(${gameState.gridSize}, 1fr)`;
    
    // 生成数字数组
    const numbers = [];
    const totalNumbers = gameState.gridSize * gameState.gridSize;
    for (let i = 1; i <= totalNumbers; i++) {
        numbers.push(i);
    }
    
    // 随机打乱数字
    shuffleArray(numbers);
    
    // 创建网格项
    numbers.forEach(number => {
        const gridItem = document.createElement('div');
        gridItem.classList.add('grid-item');
        gridItem.textContent = number;
        gridItem.dataset.number = number;
        
        // 添加点击事件
        gridItem.addEventListener('click', () => handleGridItemClick(gridItem));
        
        elements.gridContainer.appendChild(gridItem);
    });
}

// 处理网格项点击
function handleGridItemClick(gridItem) {
    if (gameState.isPaused) return;
    
    const clickedNumber = parseInt(gridItem.dataset.number);
    
    // 检查是否是正确的数字
    if (clickedNumber === gameState.currentNumber) {
        gridItem.classList.add('correct');
        gameState.currentNumber++;
        
        // 更新下一个数字显示
        elements.nextNum.textContent = gameState.currentNumber;
        
        // 检查游戏是否结束
        const totalNumbers = gameState.gridSize * gameState.gridSize;
        if (gameState.currentNumber > totalNumbers) {
            endGame();
        }
    } else {
        // 错误的数字
        gridItem.classList.add('clicked');
        setTimeout(() => {
            gridItem.classList.remove('clicked');
        }, 200);
    }
}

// 开始计时器
function startTimer() {
    gameState.startTime = Date.now() - gameState.elapsedTime;
    gameState.timerInterval = setInterval(updateTimer, 10);
}

// 更新计时器显示
function updateTimer() {
    gameState.elapsedTime = Date.now() - gameState.startTime;
    const timeStr = formatTime(gameState.elapsedTime);
    elements.timeDisplay.textContent = timeStr;
}

// 格式化时间
function formatTime(ms) {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
}

// 暂停游戏
function pauseGame() {
    if (!gameState.isPlaying || gameState.isPaused) return;
    
    gameState.isPaused = true;
    clearInterval(gameState.timerInterval);
    elements.pauseOverlay.classList.add('active');
}

// 恢复游戏
function resumeGame() {
    if (!gameState.isPlaying || !gameState.isPaused) return;
    
    gameState.isPaused = false;
    elements.pauseOverlay.classList.remove('active');
    startTimer();
}

// 退出游戏
function exitGame() {
    // 停止计时器
    clearInterval(gameState.timerInterval);
    
    // 重置游戏状态
    gameState.isPlaying = false;
    gameState.isPaused = false;
    
    // 隐藏所有屏幕，显示开始屏幕
    elements.pauseOverlay.classList.remove('active');
    showStartScreen();
}

// 游戏结束
function endGame() {
    // 停止计时器
    clearInterval(gameState.timerInterval);
    gameState.isPlaying = false;
    
    // 保存成绩
    saveScore();
    
    // 更新结果显示
    elements.resultName.textContent = gameState.nickname;
    elements.resultDifficulty.textContent = `${gameState.gridSize}x${gameState.gridSize}`;
    elements.resultTime.textContent = formatTime(gameState.elapsedTime);
    
    // 显示结果屏幕
    showResultScreen();
}

// 保存成绩
function saveScore() {
    const score = {
        nickname: gameState.nickname,
        difficulty: gameState.difficulty,
        time: gameState.elapsedTime,
        timestamp: Date.now()
    };
    
    // 添加到排行榜数据
    gameState.rankingData.push(score);
    
    // 按时间排序（相同难度内）
    gameState.rankingData.sort((a, b) => {
        if (a.difficulty !== b.difficulty) {
            return a.difficulty - b.difficulty;
        }
        return a.time - b.time;
    });
    
    // 保存到本地存储
    localStorage.setItem('shulteRanking', JSON.stringify(gameState.rankingData));
}

// 加载排行榜数据
function loadRankingData() {
    const savedData = localStorage.getItem('shulteRanking');
    if (savedData) {
        gameState.rankingData = JSON.parse(savedData);
    }
}

// 显示排行榜
function displayRanking(filterDifficulty = 'all') {
    elements.rankingList.innerHTML = '';
    
    // 过滤数据
    let filteredData = gameState.rankingData;
    if (filterDifficulty !== 'all') {
        filteredData = gameState.rankingData.filter(item => item.difficulty === parseInt(filterDifficulty));
    }
    
    // 按难度和时间排序
    filteredData.sort((a, b) => {
        if (a.difficulty !== b.difficulty) {
            return a.difficulty - b.difficulty;
        }
        return a.time - b.time;
    });
    
    if (filteredData.length === 0) {
        const noDataEl = document.createElement('p');
        noDataEl.classList.add('no-data');
        noDataEl.textContent = '暂无排行数据';
        elements.rankingList.appendChild(noDataEl);
        return;
    }
    
    // 显示排行数据
    filteredData.forEach((item, index) => {
        const rankingItem = document.createElement('div');
        rankingItem.classList.add('ranking-item');
        
        rankingItem.innerHTML = `
            <div class="rank">${index + 1}</div>
            <div class="player">${item.nickname}</div>
            <div class="difficulty">${item.difficulty}x${item.difficulty}</div>
            <div class="time">${formatTime(item.time)}</div>
        `;
        
        elements.rankingList.appendChild(rankingItem);
    });
}

// 按难度过滤排行榜
function filterRankingByDifficulty(difficulty) {
    // 更新标签按钮状态
    elements.tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.difficulty === difficulty) {
            button.classList.add('active');
        }
    });
    
    // 显示过滤后的排行榜
    displayRanking(difficulty);
}

// 再玩一次
function playAgain() {
    startGame();
}

// 屏幕切换函数
function showStartScreen() {
    hideAllScreens();
    elements.startScreen.classList.add('active');
}

function showGameScreen() {
    hideAllScreens();
    elements.gameScreen.classList.add('active');
}

function showResultScreen() {
    hideAllScreens();
    elements.resultScreen.classList.add('active');
}

function showRankingScreen() {
    hideAllScreens();
    elements.rankingScreen.classList.add('active');
    
    // 重置标签和显示排行榜
    elements.tabButtons.forEach(button => {
        button.classList.remove('active');
        if (button.dataset.difficulty === 'all') {
            button.classList.add('active');
        }
    });
    displayRanking('all');
}

// 隐藏所有屏幕
function hideAllScreens() {
    elements.startScreen.classList.remove('active');
    elements.gameScreen.classList.remove('active');
    elements.resultScreen.classList.remove('active');
    elements.rankingScreen.classList.remove('active');
    elements.pauseOverlay.classList.remove('active');
}

// 工具函数：随机打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', init);