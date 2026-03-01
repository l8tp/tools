class Minesweeper {
    constructor() {
        this.difficulty = 'easy';
        this.rows = 9;
        this.cols = 9;
        this.mines = 10;
        this.board = [];
        this.revealed = 0;
        this.flags = 0;
        this.gameOver = false;
        this.gameStarted = false;
        this.timer = 0;
        this.timerInterval = null;
        
        this.initElements();
        this.initEventListeners();
        this.initGame();
    }
    
    initElements() {
        this.grid = document.getElementById('game-grid');
        this.mineCount = document.getElementById('mine-count');
        this.timeCount = document.getElementById('time-count');
        this.status = document.getElementById('game-status');
        this.resetBtn = document.getElementById('reset-btn');
        this.difficultySelect = document.getElementById('difficulty');
        this.winModal = document.getElementById('win-modal');
        this.winMessage = document.getElementById('win-message');
        this.closeModalBtn = document.getElementById('close-modal');
    }
    
    initEventListeners() {
        this.resetBtn.addEventListener('click', () => this.resetGame());
        this.difficultySelect.addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            this.resetGame();
        });
        this.closeModalBtn.addEventListener('click', () => this.hideWinModal());
    }
    
    initGame() {
        this.setDifficulty();
        this.createBoard();
        this.renderBoard();
        this.updateMineCount();
        this.status.textContent = '点击开始游戏';
        this.gameOver = false;
        this.gameStarted = false;
        this.revealed = 0;
        this.flags = 0;
        this.timer = 0;
        this.timeCount.textContent = '0';
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    setDifficulty() {
        switch (this.difficulty) {
            case 'easy':
                this.rows = 9;
                this.cols = 9;
                this.mines = 10;
                break;
            case 'medium':
                this.rows = 16;
                this.cols = 16;
                this.mines = 40;
                break;
            case 'hard':
                this.rows = 16;
                this.cols = 30;
                this.mines = 99;
                break;
        }
    }
    
    createBoard() {
        this.board = [];
        for (let i = 0; i < this.rows; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.board[i][j] = {
                    mine: false,
                    revealed: false,
                    flagged: false,
                    neighborMines: 0
                };
            }
        }
    }
    
    placeMines(firstClickRow, firstClickCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            
            // 确保第一个点击的位置及其周围没有地雷
            if (!this.board[row][col].mine && 
                !(Math.abs(row - firstClickRow) <= 1 && Math.abs(col - firstClickCol) <= 1)) {
                this.board[row][col].mine = true;
                minesPlaced++;
            }
        }
        this.calculateNeighborMines();
    }
    
    calculateNeighborMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (!this.board[i][j].mine) {
                    let count = 0;
                    for (let di = -1; di <= 1; di++) {
                        for (let dj = -1; dj <= 1; dj++) {
                            const ni = i + di;
                            const nj = j + dj;
                            if (ni >= 0 && ni < this.rows && nj >= 0 && nj < this.cols) {
                                if (this.board[ni][nj].mine) {
                                    count++;
                                }
                            }
                        }
                    }
                    this.board[i][j].neighborMines = count;
                }
            }
        }
    }
    
    renderBoard() {
        this.grid.innerHTML = '';
        this.grid.style.gridTemplateRows = `repeat(${this.rows}, 1fr)`;
        this.grid.style.gridTemplateColumns = `repeat(${this.cols}, 1fr)`;
        
        // 根据难度设置网格和单元格大小
        let cellSize = 30;
        if (this.difficulty === 'easy') {
            // 第一关设置固定的网格大小，确保方形且不小于300px
            const minSize = 300;
            this.grid.style.width = `${minSize}px`;
            this.grid.style.height = `${minSize}px`;
            // 移除单元格的固定大小，让网格布局自动分配
            cellSize = 'auto';
        } else {
            // 第二和第三关保持现状
            this.grid.style.width = 'auto';
            this.grid.style.height = 'auto';
            if (this.difficulty === 'hard') {
                cellSize = 26;
            }
        }
        
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.dataset.row = i;
                cell.dataset.col = j;
                if (cellSize !== 'auto') {
                    cell.style.width = `${cellSize}px`;
                    cell.style.height = `${cellSize}px`;
                } else {
                    // 对于第一关，让单元格自动填充网格
                    cell.style.width = '100%';
                    cell.style.height = '100%';
                }
                
                cell.addEventListener('click', () => this.handleCellClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    this.handleCellRightClick(i, j);
                });
                
                this.grid.appendChild(cell);
            }
        }
    }
    
    handleCellClick(row, col) {
        if (this.gameOver || this.board[row][col].revealed || this.board[row][col].flagged) {
            return;
        }
        
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        this.revealCell(row, col);
        this.checkWin();
    }
    
    handleCellRightClick(row, col) {
        if (this.gameOver || this.board[row][col].revealed) {
            return;
        }
        
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        this.board[row][col].flagged = !this.board[row][col].flagged;
        this.flags += this.board[row][col].flagged ? 1 : -1;
        this.updateMineCount();
        this.updateCellDisplay(row, col);
    }
    
    revealCell(row, col) {
        if (row < 0 || row >= this.rows || col < 0 || col >= this.cols || 
            this.board[row][col].revealed || this.board[row][col].flagged) {
            return;
        }
        
        this.board[row][col].revealed = true;
        this.revealed++;
        this.updateCellDisplay(row, col);
        
        if (this.board[row][col].mine) {
            this.gameOver = true;
            this.revealAllMines();
            this.stopTimer();
            this.status.textContent = '游戏结束！你踩中了地雷';
            return;
        }
        
        if (this.board[row][col].neighborMines === 0) {
            for (let di = -1; di <= 1; di++) {
                for (let dj = -1; dj <= 1; dj++) {
                    this.revealCell(row + di, col + dj);
                }
            }
        }
    }
    
    revealAllMines() {
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                if (this.board[i][j].mine) {
                    this.board[i][j].revealed = true;
                    this.updateCellDisplay(i, j);
                }
            }
        }
    }
    
    updateCellDisplay(row, col) {
        const cell = this.grid.querySelector(`[data-row="${row}"][data-col="${col}"]`);
        if (!cell) return;
        
        cell.classList.remove('revealed', 'mine', 'flagged', '1', '2', '3', '4', '5', '6', '7', '8');
        
        if (this.board[row][col].revealed) {
            cell.classList.add('revealed');
            if (this.board[row][col].mine) {
                cell.classList.add('mine');
            } else if (this.board[row][col].neighborMines > 0) {
                cell.classList.add(this.board[row][col].neighborMines.toString());
                cell.textContent = this.board[row][col].neighborMines;
            } else {
                cell.textContent = '';
            }
        } else if (this.board[row][col].flagged) {
            cell.classList.add('flagged');
            cell.textContent = '';
        } else {
            cell.textContent = '';
        }
    }
    
    updateMineCount() {
        this.mineCount.textContent = (this.mines - this.flags).toString();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timer++;
            this.timeCount.textContent = this.timer.toString();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }
    }
    
    checkWin() {
        const totalCells = this.rows * this.cols;
        if (this.revealed === totalCells - this.mines) {
            this.gameOver = true;
            this.stopTimer();
            this.status.textContent = `恭喜你赢了！用时 ${this.timer} 秒`;
            this.showWinModal();
        }
    }
    
    showWinModal() {
        this.winMessage.textContent = `用时 ${this.timer} 秒`;
        this.winModal.classList.add('show');
    }
    
    hideWinModal() {
        this.winModal.classList.remove('show');
    }
    
    resetGame() {
        this.hideWinModal();
        this.initGame();
    }
}

// 初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});