import { loadConfig } from './config.js';
/**
 * 未知的方块表示：
 * 'M' 代表一个 未挖出的 地雷，
 * 'E' 代表一个 未挖出的 空方块，
 * 'E*' 和 'M*'代表玩家的标记...
 * 'E?' 和 'M?'代表玩家的标记...
 * 
 * 已知的方块表示：
 * 'B' 代表没有相邻（上，下，左，右，和所有4个对角线）地雷的 已挖出的 空白方块，
 * 数字（'1' 到 '8'）表示有多少地雷与这块 已挖出的 方块相邻，
 * 'X' 则表示一个 已挖出的 地雷。
 */
const neibour = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];

function revealBoard(board, x, y) {
    let count = 0;
    for (const [dx, dy] of neibour) {
        if (["M", "M*", "M?", "X", "X*"].includes(board[x + dx]?.[y + dy])) { // 所有是雷的格子，不管玩家标了什么
            count++;
        }
    }
    if (count > 0) {
        board[x][y] = count.toString();
    } else {
        // 当前格子为B，计算附近九宫格
        board[x][y] = "B";
        for (const [dx, dy] of neibour) {
            if (["E", "E?"].includes(board[x + dx]?.[y + dy])) {  // TODO: 检查这里E*是否可以揭开？
                // 递归地揭露
                revealBoard(board, x + dx, y + dy);
            }
        }
    }
}

function randInt(lower, upper) {
    return lower + Math.floor(Math.random() * (upper - lower + 1))
}

export class MineSweeper {
    constructor(size, numMine) {
        const userConfig = loadConfig();
        this.size = size;
        this.numMine = numMine;
        this.numMineCurr = numMine;
        this.board = this.initBoard();
        this.spentTime = 0;
        this.state = "unpressed";
        this.timer = null;
        this.isAutoFlag = userConfig.autoFlag;
    }

    setSize(size, numMine) {
        this.size = size;
        this.numMine = numMine;
        this.restart();
    }

    restart() {
        this.numMineCurr = this.numMine;
        this.board = this.initBoard();
        this.spentTime = 0;
        this.state = "unpressed";
        clearTimeout(this.timer);
        this.timer = null;
    }

    initBoard() {
        const [w, h] = this.size;
        let n = this.numMine;
        // h: 高=行数
        // w: 宽=列数
        const board = new Array(w).fill("M").map(x => new Array(h).fill("E"));
        if (n <= 0) return "数据不合法！至少要有一颗地雷！"
        if (n >= w * h) return "数据不合法！雷的数量不能超过格子数量！"
        // 随机放置n个雷
        // 方法一：计算每个格子放雷的概率 => 遍历board，每个格子都判断一下是否要放雷，放了就减少雷的数量，直到雷的数量用完。O(w*h) --适合雷比较密集的情况
        // 方法二：随机抽样一个坐标，如果是E，可以改成M，否则抽样下一个坐标，直到放完雷的数量。O(n) --适合雷比较稀疏的情况
        while (n) {
            const r = randInt(0, w - 1);
            const c = randInt(0, h - 1);
            if (board[r][c] === "E") {
                board[r][c] = "M";
                n--;
            }
        }
        return board;
    }

    startTiming(callback) {
        this.timer = setInterval(() => {
            this.spentTime += 1;
            callback();
        }, 1000)
    }

    updateBoard(click, timerCallback) {
        if (!this.timer) {
            this.startTiming(timerCallback);
        }
        // 检查玩家点击：点击了E或M
        const [x, y] = click;
        const curr = this.board[x][y];
        // 如果curr==="M"，踩了地雷，改成X，游戏结束
        if (curr === "M") {
            this.board[x][y] = "X";
            this.handleLose();
            return;
        }
        // 点击E，需要计算E附近有多少颗雷
        if (curr === "E") {
            revealBoard(this.board, x, y);
        }
        this.autoFlag();
        // 检查游戏是否胜利
        for (const row of this.board) {
            for (const ele of row) {
                if (ele.startsWith("E")) {  // 还有E就不行
                    return;
                }
            }
        }
        this.handleWin();
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
                    for (const [dx, dy] of neibour) {
                        const val2 = this.board[+x + dx]?.[+y + dy];
                        if (["M", "E", "M?", "E?"].includes(val2)) {
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
        // } else if (val === "M*") {
        //     this.board[x][y] = "M?";
        //     this.numMineCurr++;
        // } else if (val === "E*") {
        //     this.board[x][y] = "E?";
        //     this.numMineCurr++;
        // } else if (val === "M?") {
        //     this.board[x][y] = "M";
        // } else if (val === "E?") {
        //     this.board[x][y] = "E";
        // }
    }

    revealRemainingE(x, y) {
        // 检查是否是数字格子
        const number = parseInt(this.board[x][y]);
        if (number) {
            // 检查周围标记的雷的数量是否等于数字
            let count = 0;
            const toReveal = [];
            for (const [dx, dy] of neibour) {
                const val2 = this.board[x + dx]?.[y + dy];
                if (["M*", "E*", "X", "X*"].includes(val2)) {  // 玩家标记的雷或者已知的雷
                    count++;
                }
                // 记录一下未知的格子
                if (["E", "M", "E?", "M?"].includes(val2)) {
                    toReveal.push([dx, dy]);
                }
            }

            // 如果附近的已揭示格子数量等于数字，揭开剩余的格子
            if (count === number) {
                for (const [dx, dy] of toReveal) {
                    this.updateBoard([x + dx, y + dy]);
                }
            }
        }
    }


    handleLose() {
        this.state = "lose";
        clearTimeout(this.timer);

        // 显示所有的雷，用"X*"表示？
        for (const i in this.board) {
            for (const j in this.board[i]) {
                if (this.board[i][j] === "M") {
                    this.board[i][j] = "X*";
                }
            }
        }
    }

    handleWin() {
        if (this.state !== "lose") {
            this.state = "win";
        }
        clearTimeout(this.timer);
    }
}