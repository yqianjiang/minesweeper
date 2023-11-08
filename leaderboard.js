import { showModal, showWinModal } from "./components/prompt.js";

// 获取按钮和英雄榜元素
const beginnerLeaderboard = document.getElementById("beginner-leaderboard");
const intermediateLeaderboard = document.getElementById("intermediate-leaderboard");
const expertLeaderboard = document.getElementById("expert-leaderboard");
const leaderboard = {
    beginner: beginnerLeaderboard,
    intermediate: intermediateLeaderboard,
    expert: expertLeaderboard,
}

// 更新初级英雄榜
export function updateLeaderboard(level) {
    
    // 从localStorage中获取英雄榜数据（如果有的话）
    const scores = JSON.parse(localStorage.getItem(`${level}-scores`)) || [];
    
    if (!scores.length) {
        return;
    }
    // 清空英雄榜
    leaderboard[level].innerHTML = "";
    
    // 排序并显示前N名成绩（假设显示前5名）
    const topScores = scores.slice(0, 5);

    topScores.forEach((score, index) => {
        const listItem = document.createElement("li");
        listItem.textContent = `${index + 1}. ${score.name} - ${score.time}秒 - ${score.date||"2023/10/22前"}`;
        leaderboard[level].appendChild(listItem);
    });
}

// 处理提交成绩按钮点击事件
export function submitScore(level, playerTime) {
    level = level.toLowerCase();
    if (level === "custom") {
        showWinModal(playerTime);
        return;
    }
    // 从localStorage中获取英雄榜数据（如果有的话）
    const scores = JSON.parse(localStorage.getItem(`${level}-scores`)) || [];
    const topScores = scores.slice(0, 5);
    if (topScores.length<5 || playerTime<topScores.slice(-1)[0].time) {
        showModal("新记录",`请在英雄榜留下你的名字（可选）`, (playerName) => {
            if (!playerName) {
                return;  // 用户不想输入名字
            }
            // 将新成绩添加到初级英雄榜
            const day = new Date();
            const curr = { name: playerName, time: playerTime, date: day.toLocaleDateString()};
            const idx = searchInsert(topScores, playerTime);
        
            // 保存数据到localStorage
            localStorage.setItem(`${level}-scores`, JSON.stringify([...topScores.slice(0, idx), curr, ...topScores.slice(idx)]));
        
            // 更新初级英雄榜
            updateLeaderboard(level);
        });
    } else {
        showWinModal(playerTime);
    }
}

// 初始化英雄榜
updateLeaderboard("beginner");
updateLeaderboard("intermediate");
updateLeaderboard("expert");


function searchInsert(nums, target) {
    // nums有序：二分法
    let left = 0, right = nums.length -1;
    while (left <= right) {
        const middle = left + Math.floor((right - left) / 2);
        if (target === nums[middle].time) {
            return middle;
        }
        if (target > nums[middle].time) {
            left = middle + 1;
        } else {
            right = middle - 1;
        }
    }
    return left;
};