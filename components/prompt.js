// 通用弹窗
const createModal = (title, content, { onSubmit, onBeforeClose, customId }) => {
    if (!customId) {
        // 生成一个随机的 customId，可以根据需要进行更复杂的生成
        customId = Math.random().toString(36).substring(7);
    }
    let customModal = document.querySelector(`#customModal_${customId}`);

    if (!customModal) {
        customModal = document.createElement("div");
        customModal.className = "modal";
        customModal.id = `customModal_${customId}`;

        // 创建弹窗内容
        const modalContent = document.createElement("div");
        modalContent.className = "modal-content";

        // 创建关闭按钮
        const closeModalBtn = document.createElement("span");
        closeModalBtn.className = "close";
        closeModalBtn.innerHTML = "&times;";
        modalContent.appendChild(closeModalBtn);

        // 创建标题
        const h2 = document.createElement("h2");
        h2.className = "modal-title";
        h2.innerHTML = title;
        modalContent.appendChild(h2);

        // 创建内容
        if (typeof content === 'string') {
            const contentElement = document.createElement("p");
            contentElement.innerHTML = content;
            modalContent.appendChild(contentElement);
        } else if (content instanceof Element) {
            modalContent.appendChild(content);
        }

        // 创建提交按钮
        if (onSubmit) {
            const submitBtn = document.createElement("button");
            submitBtn.innerHTML = "提交";
            submitBtn.id = "submitBtn";
            modalContent.appendChild(submitBtn);

            submitBtn.addEventListener("click", () => {
                onSubmit();
                customModal.style.display = "none";
            });
        }

        // 将内容添加到容器
        customModal.appendChild(modalContent);

        // 添加弹窗到页面
        document.body.appendChild(customModal);

        // 添加事件处理程序
        closeModalBtn.addEventListener("click", () => {
            if (onBeforeClose) {
                onBeforeClose();
            }
            customModal.style.display = "none";
        });
    } else {
        customModal.querySelector("h2").innerHTML = title;
        // 更新内容
        if (typeof content === 'string') {
            customModal.querySelector("p").innerHTML = content;
        } else if (content instanceof Element) {
            //
        }
    }

    customModal.style.display = "block";
};


// 英雄榜留名弹窗
const showModal = (title, msg, onSubmit) => {
    // 弹窗内容
    const content = document.createElement("div");

    // 创建文案
    const msgDom = document.createElement("p");
    msgDom.className = "modal-msg";
    msgDom.innerHTML = msg;
    content.appendChild(msgDom);

    // 创建输入框
    const playerNameInput = document.createElement("input");
    playerNameInput.type = "text";
    playerNameInput.id = "playerNameInput";
    playerNameInput.placeholder = "请输入您的名字";
    content.appendChild(playerNameInput);

    // 创建弹窗
    createModal(title, content, {
        onSubmit: () => {
            const playerName = playerNameInput.value;
            onSubmit(playerName);
            // todo: 把输入的名字保存到local
        },
        customId: "name"
    });
};

import { levels, loadConfig } from '../config.js';

// 自定义弹窗
const showCustomModal = (title, onSubmit) => {
    const userConfig = loadConfig();
    const pars = userConfig.level || levels["BEGINNER"];

    // 创建弹窗内容
    const content = document.createElement("div");

    // 创建输入框和标签
    const rowLabel = document.createElement("label");
    rowLabel.for = "rowInput";
    rowLabel.innerHTML = "行数: ";
    const rowInput = document.createElement("input");
    rowInput.type = "number";
    rowInput.id = "rowInput";
    rowInput.value = pars.size[0]; // 初始值
    rowInput.min = 8;
    rowInput.max = 30;

    const colLabel = document.createElement("label");
    colLabel.for = "colInput";
    colLabel.innerHTML = "列数: ";
    const colInput = document.createElement("input");
    colInput.type = "number";
    colInput.id = "colInput";
    colInput.value = pars.size[1]; // 初始值
    colInput.min = 8;
    colInput.max = 24;

    const minesLabel = document.createElement("label");
    minesLabel.for = "minesInput";
    minesLabel.innerHTML = "地雷数量: ";
    const minesInput = document.createElement("input");
    minesInput.type = "number";
    minesInput.id = "minesInput";
    minesInput.value = pars.n; // 初始值
    minesInput.max = (rowInput.value - 1) * (colInput.value - 1);

    // 添加事件监听器以根据行和列的更改更新地雷数量上限
    rowInput.addEventListener("change", () => {
        if (rowInput.value < 8) {
            rowInput.value = 8;
        } else if (rowInput.value > 24) {
            rowInput.value = 24;
        }
        minesInput.max = (rowInput.value - 1) * (colInput.value - 1);
    });

    colInput.addEventListener("change", () => {
        if (colInput.value < 8) {
            colInput.value = 8;
        } else if (colInput.value > 24) {
            colInput.value = 24;
        }
        minesInput.max = (rowInput.value - 1) * (colInput.value - 1);
    });

    // 添加到内容
    content.appendChild(rowLabel);
    content.appendChild(rowInput);
    content.appendChild(document.createElement("br"));
    content.appendChild(colLabel);
    content.appendChild(colInput);
    content.appendChild(document.createElement("br"));
    content.appendChild(minesLabel);
    content.appendChild(minesInput);
    content.appendChild(document.createElement("br"));

    // 创建弹窗
    createModal(title, content, {
        onSubmit: () => {
            const rows = parseInt(rowInput.value, 10);
            const cols = parseInt(colInput.value, 10);
            const mines = parseInt(minesInput.value, 10);

            if (isNaN(rows) || isNaN(cols) || isNaN(mines)) {
                alert("请输入有效的数值");
                return;
            }

            if (rows < 8 || rows > 30 || cols < 8 || cols > 24 || mines > (rows - 1) * (cols - 1)) {
                alert("请输入有效范围内的数值");
                return;
            }

            const customPars = {
                size: [rows, cols],
                n: mines,
            };

            onSubmit(customPars);
        },
        customId: "custom-"+userConfig.difficulty,
    });
};

// 胜利弹窗
const showWinModal = (time) => {
    const title = "恭喜🎉";
    const content = `你赢了！用时${time}秒`
    // 创建弹窗
    createModal(title, content, {customId: 'win'});
};

export { showModal, showWinModal, showCustomModal };