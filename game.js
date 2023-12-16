import { loadConfig } from './config.js';
import { submitScore } from './leaderboard.js';
import { Timer } from './timer.js';
/**
 * 未知的方块表示：
 * 'M' 代表一个 未挖出的 地雷，
 * 'E' 代表一个 未挖出的 空方块，
 * 'E*' 和 'M*'代表玩家标记的红旗（玩家认为是地雷的格子）...
 * 
 * 已知的方块表示：
 * 'B' 代表没有相邻（上，下，左，右，和所有4个对角线）地雷的 已挖出的 空白方块，
 * 数字（'1' 到 '8'）表示有多少地雷与这块 已挖出的 方块相邻，
 * 'X' 则表示一个 已挖出的 地雷。
 */
const neighbors = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

function countAdjacentMines(board, x, y) {
    let count = 0;
    for (const [dx, dy] of neighbors) {
        const newX = x + dx;
        const newY = y + dy;
        if (board[newX] && board[newX][newY] && ["M", "M*", "X", "X*"].includes(board[newX][newY])) { // 所有是雷的格子，不管玩家标了什么
            count++;
        }
    }
    return count;
}

function revealTiles(board, x, y) {
    const count = countAdjacentMines(board, x, y);
    if (count > 0) {
        board[x][y] = count.toString();
    } else {
        // 当前格子为B，计算附近九宫格
        board[x][y] = "B";
        for (const [dx, dy] of neighbors) {
            if (["E", "E?"].includes(board[x + dx]?.[y + dy])) {  // TODO: 检查这里E*是否可以揭开？
                // 递归地揭露
                revealTiles(board, x + dx, y + dy);
            }
        }
    }
}

function randInt(lower, upper) {
    return lower + Math.floor(Math.random() * (upper - lower + 1))
}

// 当游戏状态改变时，保存状态
function saveGameState(gameState) {
    localStorage.setItem('minesweeper_gameState', JSON.stringify(gameState));
}

// 在页面加载时恢复状态
function loadGameState() {
    const savedGameState = localStorage.getItem('minesweeper_gameState');
    if (savedGameState) {
        const gameState = JSON.parse(savedGameState);
        return gameState;
    }
}

export class MineSweeper {
    constructor(size, numMine) {
        const userConfig = loadConfig();
        this.isAutoFlag = userConfig.autoFlag;
        this.isFirstBlank = userConfig.firstBlank;
        this.isFirstSafe = userConfig.firstSafe;
        if (!this.loadGameState()) {
            this.setSize(size, numMine);
        }
    }

    saveGameState() {
        saveGameState(this);
    }

    loadGameState() {
        const gameState = loadGameState();
        if (gameState) {
            this.size = gameState.size;
            this.numMine = gameState.numMine;
            this.numMineCurr = gameState.numMineCurr;
            this.board = gameState.board;
            this.colorMark = gameState.colorMark;
            this.spentTime = gameState.spentTime;
            this.clicks = gameState.clicks;
            this.state = gameState.state;
            this.timer = null;
            return true;
        }
        return false;
    }

    setSize(size, numMine) {
        this.size = size;
        this.numMine = numMine;
        this.restart();
    }

    restart() {
        this.numMineCurr = this.numMine;
        this.board = this.generateBoard();
        this.colorMark = this.generateColorMark(); // 涂色标记
        this.spentTime = 0;
        this.clicks = {
            active: 0,
            wasted: 0
        };
        this.state = "unpressed";
        this.timer?.clear();
        this.timer = null;
        this.saveGameState();
    }

    generateBoard(click) {
        const [w, h] = this.size;
        let n = this.numMine;
        // h: 高=行数
        // w: 宽=列数
        const board = new Array(w).fill("M").map(x => new Array(h).fill("E"));
        if (n <= 0) return "数据不合法！至少要有一颗地雷！"
        if (n >= w * h) return "数据不合法！雷的数量不能超过格子数量！"
        // 随机放置n个雷
        // 随机抽样一个坐标，如果是E，可以改成M，否则抽样下一个坐标，直到放完雷的数量。最佳O(n) --适合雷比较稀疏的情况
        // Initialize a set to keep track of positions to avoid for mines
        const avoidPositions = new Set();

        // Add the initial click and its neighbors to the set
        if (click) {
            avoidPositions.add(`${click[0]}_${click[1]}`);
            const maxE = w * h - n;
            for (const [dx, dy] of neighbors) {
                const r = click[0] + dx;
                const c = click[1] + dy;
                if (r >= 0 && r < w && c >= 0 && c < h && avoidPositions.size < maxE) {
                    avoidPositions.add(`${r}_${c}`);
                }
            }
        }

        while (n) {
            const r = randInt(0, w - 1);
            const c = randInt(0, h - 1);
            const position = `${r}_${c}`;
            if (board[r][c] === "E" && !avoidPositions.has(position)) {
                board[r][c] = "M";
                n--;
            }
        }
        return board;
    }

    generateColorMark() {
        const colorMark = [];
        const [w, h] = this.size;
        for (let i = 0; i < w; i++) {
            colorMark.push(new Array(h).fill(0));
        }
        return colorMark;
    }

    // 添加设置颜色的方法
    setColor(row, col, color) {
        this.colorMark[row][col] = color;
    }

    // 添加获取颜色的方法
    getColor(row, col) {
        return this.colorMark[row][col];
    }

    // 添加清除颜色的方法
    clearColor(row, col) {
        this.colorMark[row][col] = 0;
    }

    startTiming() {
        this.timer = new Timer(() => {
            this.spentTime += 1;
            this.renderTime(this.spentTime);
            this.saveGameState();
        })
        this.timer.start();
    }

    findNewMineLocation(x, y) {
        const directions = [[-1, 0], [0, -1], [1, 0], [0, 1]]; // Up, Left, Down, Right
        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            if (this.isInsideBoard(newX, newY) && this.board[newX][newY] === "E") {
                return [newX, newY];
            }
        }
        // If no empty cell found in the adjacent positions, search for an empty cell in the entire board.
        for (let i = 0; i < this.board.length; i++) {
            for (let j = 0; j < this.board[i].length; j++) {
                if (this.board[i][j] === "E") {
                    return [i, j];
                }
            }
        }
        // If no empty cell is found anywhere, you should handle this case according to your game rules.
    }

    isInsideBoard(x, y) {
        return x >= 0 && x < this.board.length && y >= 0 && y < this.board[0].length;
    }

    setRenderTime(renderTime) {
        this.renderTime = renderTime;
        // 如果游戏进行中，恢复计时
        if (this.state === "playing" && !this.timer) {
            this.startTiming();
        }
    }

    // 处理点击
    updateBoard(click) {
        const [x, y] = click;
        if (this.state === "unpressed") {
            this.state = "playing";
            if (this.isFirstBlank) {
                // 保证第一个点击为空白
                this.board = this.generateBoard(click);
            } else if (this.isFirstSafe) {
                // 保证第一个点击不踩雷：如果初次点击刚好是地雷，地雷会消失而转移到左上角，如果左上角原来就有地雷，则会移到邻近的方块（优先级：左to右，上to下）
                if (this.board[x][y] === "M") {
                    const [newX, newY] = this.findNewMineLocation(x, y);
                    this.board[x][y] = "E"; // Set the current cell to empty ("E")
                    this.board[newX][newY] = "M"; // Place the mine in a new location
                }
            }
            this.startTiming();
        }
        // 检查玩家点击：点击了E或M
        const curr = this.board[x][y];
        // flag的位置不能点：
        if (curr === "E*" || curr === "M*") {
            return;
        }

        // 如果curr==="M"，踩了地雷，改成X，游戏结束
        if (curr === "M") {
            this.board[x][y] = "X";
            this.handleLose();
            return;
        }
        // 点击E，需要计算E附近有多少颗雷
        if (curr === "E") {
            revealTiles(this.board, x, y);
        }
        this.autoFlag();
    };

    // 自动标雷
    autoFlag() {
        if (!this.isAutoFlag) {
            return;
        }
        // 检查数字格子周围，如果E或M的数量恰好等于数字，就把E或M都标记为雷
        for (const x in this.board) {
            for (const y in this.board[x]) {
                const val = parseInt(this.board[x][y]);
                if (val) {
                    const candidates = [];
                    let count = 0;  // 记录已知的雷 和 未知的格子
                    for (const [dx, dy] of neighbors) {
                        const val2 = this.board[+x + dx]?.[+y + dy];
                        if (["M", "E"].includes(val2)) {
                            candidates.push([dx, dy]);
                            count++;
                        } else if (["M*", "E*", "X", "X*"].includes(val2)) {
                            count++;
                        }
                    }
                    // 如果剩余的未知格子+已知的雷的数量恰好等于数字，就把未知的格子标记为雷
                    if (count === val) {
                        for (const [dx, dy] of candidates) {
                            this.board[+x + dx][+y + dy] += "*";
                            this.numMineCurr--;
                        }
                    }
                }
            }
        }
    }

    toggleFlag(x, y) {
        const val = this.board[x][y];
        if (["M", "E"].includes(val)) {
            if (this.numMineCurr > 0) {
                this.board[x][y] += "*";
                this.numMineCurr--;
            }
        } else if (val === "M*") {
            this.board[x][y] = "M";
            this.numMineCurr++;
        } else if (val === "E*") {
            this.board[x][y] = "E";
            this.numMineCurr++;
        }
    }

    // 涂色标记，可以涂多种颜色。未揭开的格子可以涂色，再次点击已经涂色（任意一种颜色）的格子，可以取消涂色
    toggleColorMark(x, y, color) {
        const val = this.board[x][y];
        if (["E", "M"].includes(val)) {
            if (this.getColor(x, y) === 0) {
                this.setColor(x, y, color);
            } else {
                this.clearColor(x, y);
            }
        }
    }

    isNumTile(x, y) {
        return !!parseInt(this.board[x][y]);
    }

    getAdjacentTiles(x, y) {
        return neighbors.map(([dx, dy]) => [x + dx, y + dy]).filter(([x, y]) => this.isInsideBoard(x, y));
    }

    revealAdjacentTiles(x, y) {
        // 检查是否是数字格子
        const number = parseInt(this.board[x][y]);
        if (number) {
            // 检查周围标记的雷的数量是否等于数字
            let count = 0;
            const toReveal = [];
            for (const [dx, dy] of neighbors) {
                const val2 = this.board[x + dx]?.[y + dy];
                if (["M*", "E*", "X", "X*"].includes(val2)) {  // 玩家标记的雷或者已知的雷
                    count++;
                }
                // 记录一下未知的格子
                if (["E", "M"].includes(val2)) {
                    toReveal.push([dx, dy]);
                }
            }

            // 如果附近的已揭示格子数量等于数字，揭开剩余的格子
            if (count === number) {
                for (const [dx, dy] of toReveal) {
                    this.updateBoard([x + dx, y + dy]);
                }
            } else {
                return toReveal.map(([dx, dy]) => [x + dx, y + dy]);
            }
        }
    }

    handleLose() {
        this.state = "lose";
        this.recordGame(false);
        this.timer?.clear();

        // 显示所有的雷，用"X*"表示？
        for (const i in this.board) {
            for (const j in this.board[i]) {
                if (this.board[i][j] === "M") {
                    this.board[i][j] = "X*";
                }
            }
        }
        this.saveGameState();
    }

    handleWin() {
        if (this.state === "playing") {
            this.state = "win";
            // todo: 自动标旗子
            // this.flagAll();
            this.recordGame(true);
        }
        this.timer?.clear();
        this.saveGameState();
    }

    recordGame(win) {
        const userConfig = loadConfig();
        const difficulty = userConfig.difficulty.toLowerCase();
        submitScore({
            difficulty,
            win,
            clicks: this.clicks,
            time: this.spentTime, // todo: 毫秒
            bv: this.get3BV(),   // 整个盘面的3BV
            currBV: this.get3BVCurr(),  // 到当前步骤为止的3BV
        });
    }

    get3BV() {
        if (this.state === "win") {
            return calculate3BV(this.board);
        } else {
            // TODO: 全部揭开来计算。。
            return calculate3BV(revealAll(this.board));
        }
    }
    get3BVCurr() {
        return calculate3BV(this.board);
    }

    handleClick([x,y]) {
        const snapshot = deepClone(this.board);
        if (this.isNumTile(x, y)) {
            this.revealAdjacentTiles(x, y);  // 双击
        } else {
            this.updateBoard([x, y]);
        }
        if (deepEqual(snapshot, this.board)) {
            this.clicks.wasted++;
        } else {
            this.clicks.active++;
        }

        // 检查游戏是否胜利
        for (const row of this.board) {
            for (const ele of row) {
                if (ele.startsWith("E")) {  // 还有E就不行
                    return;
                }
            }
        }
        this.handleWin();
    }
}

// board为表示扫雷局面的二维数组
function calculate3BV(board) {

    let opCount = 0;
    let numCount = 0;

    // 使用floodFill算法计算op数
    floodFill(board);

    function floodFill(board) {
        const visited = [];

        for (let i = 0; i < board.length; i++) {
            visited[i] = [];
            for (let j = 0; j < board[0].length; j++) {
                visited[i][j] = false;
            }
        }

        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board[0].length; j++) {
                if (board[i][j] === 'B' && !visited[i][j]) {
                    opCount++;
                    dfs(i, j);
                }
            }
        }

        function dfs(i, j) {
            if (i < 0 || j < 0 || i >= board.length || j >= board[0].length || visited[i][j] || board[i][j] !== 'B') {
                return;
            }
            visited[i][j] = true;
            for (const [dx, dy] of neighbors) {
                dfs(i+dx, j+dy);
            }
        }
    }

    // 统计不在op边缘的数字
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
          if (parseInt(board[i][j])) {
            let isBorder = false;
            for (let [x, y] of neighbors) {
              let newX = i + x;
              let newY = j + y;
              if (newX >= 0 && newX < board.length && newY >= 0 && newY < board[0].length) {
                if (board[newX][newY] === "B") {
                  isBorder = true;
                  break;
                }
              }
            }
            if (!isBorder) {
              numCount++;
            }
          }
        }
      }

    // console.log({opCount, numCount});

    return opCount + numCount;
}

function deepClone(arr) {
    if (Array.isArray(arr)) {
        return [...arr].map(x=>deepClone(x));
    } else {
        return arr;
    }
}
function deepEqual(oldBoard, newBoard) {
    return JSON.stringify(oldBoard) === JSON.stringify(newBoard);
}

function revealAll(inputBoard) {
    const rows = inputBoard.length;
    const cols = inputBoard[0].length;
    const revealedBoard = deepClone(inputBoard);
    for (let x = 0; x < rows; x++) {
        for (let y = 0; y < cols; y++) {
            if (["E", "E*"].includes(revealedBoard[x][y])) {
                // 替换为数字，计算附近的雷数
                const count = countAdjacentMines(revealedBoard, x, y);
                if (count > 0) {
                    revealedBoard[x][y] = count.toString();
                } else {
                    // 当前格子为B
                    revealedBoard[x][y] = "B";
                }
            }
        }
    }
    return revealedBoard;
}