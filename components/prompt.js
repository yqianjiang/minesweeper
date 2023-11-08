// 通用弹窗
const modals = {};
const createModal = (title, content, { onSubmit, onBeforeClose, modalId, onShow }) => {
    if (!modalId) {
        // 生成一个随机的 modalId
        modalId = Math.random().toString(36).substring(7);
    }

    let modal = modals[modalId];

    if (!modal) {
        modal = document.createElement("div");
        modal.className = "modal";
        modal.id = `customModal_${modalId}`;

        // 创建弹窗内容
        const modalContent = document.createElement('div');
        modalContent.classList.add('game-window');
        modalContent.classList.add('modal-content');

        const closeButton = document.createElement('span');
        closeButton.classList.add('close');
        closeButton.textContent = '×';
        modalContent.appendChild(closeButton);

        const titleElement = document.createElement('h2');
        titleElement.classList.add('window-title-bar');
        titleElement.classList.add('modal-title');
        titleElement.textContent = title;
        modalContent.appendChild(titleElement);
        
        if (typeof content === 'string') {
            const paragraph = document.createElement('p');
            paragraph.textContent = content;
            modalContent.appendChild(paragraph);
        } else {
            modalContent.appendChild(content);
        }
        
        const footer = document.createElement('div');
        footer.classList.add('modal-footer');
        modalContent.appendChild(footer);
        if (onSubmit) {
            const submitButton = document.createElement('button');
            submitButton.id = 'submitBtn';
            submitButton.textContent = '确定';
            footer.appendChild(submitButton);
        }

        modal.appendChild(modalContent);


        // 关闭按钮事件监听
        const closeModalBtn = modal.querySelector(".close");
        closeModalBtn.addEventListener("click", () => {
            modal.style.display = "none";
        });

        // 将内容添加到容器
        document.body.appendChild(modal);

        modals[modalId] = modal;
    } else {
        const titleElemet = modal.querySelector(".modal-title");
        titleElemet.innerHTML = title;
        // 更新内容
        if (typeof content === 'string') {
            modal.querySelector("p").innerHTML = content;
        } else {
            // 更新content
        }
    }

    const setEvent = (element, callback, event) => {
        if (modal[event]) {
            element.removeEventListener("click", modal[event]);
        }

        if (callback) {
            modal[event] = callback;
            element.addEventListener("click", modal[event]);
        }
    };

    // 更新onSubmit回调函数
    if (onSubmit || modal.onSubmit) {
        const submitBtn = modal.querySelector("#submitBtn");
        setEvent(submitBtn, () => {
            onSubmit();
            modal.style.display = "none";
        }, 'onSubmit');
    }

    // 更新onBeforeClose回调函数
    if (onBeforeClose || modal.onBeforeClose) {
        const closeModalBtn = modal.querySelector(".close");
        setEvent(closeModalBtn, onBeforeClose, 'onBeforeClose');
    }

    modal.style.display = "block";
    if (onShow) {
        onShow();
    }
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
            const playerNameInput = document.getElementById("playerNameInput");
            const playerName = playerNameInput.value;
            onSubmit(playerName);
            // todo: 把输入的名字保存到local
        },
        modalId: "name",
    });
};

import { levels, loadConfig } from '../config.js';

// 自定义弹窗
const showCustomModal = (title, onSubmit) => {
    // 创建弹窗内容
    const content = document.createElement("div");

    // 创建输入框和标签
    const rowLabel = document.createElement("label");
    rowLabel.for = "rowInput";
    rowLabel.innerHTML = "行数: ";
    const rowInput = document.createElement("input");
    rowInput.type = "number";
    rowInput.id = "rowInput";
    rowInput.classList.add('custom-input');
    rowInput.min = 8;
    rowInput.max = 30;
    
    const colLabel = document.createElement("label");
    colLabel.for = "colInput";
    colLabel.innerHTML = "列数: ";
    const colInput = document.createElement("input");
    colInput.type = "number";
    colInput.id = "colInput";
    colInput.classList.add('custom-input');
    colInput.min = 8;
    colInput.max = 30;
    
    const minesLabel = document.createElement("label");
    minesLabel.for = "minesInput";
    minesLabel.innerHTML = "雷数: ";
    const minesInput = document.createElement("input");
    minesInput.type = "number";
    minesInput.id = "minesInput";
    minesInput.classList.add('custom-input');

    function clamp(element) {
        const val = element.value;
        const min = +element.min;
        const max = +element.max;
        if (val < min) {
            element.value = min;
        } else if (val > max) {
            element.value = max;
        }
    }

    // 添加事件监听器以根据行和列的更改更新地雷数量上限
    rowInput.addEventListener("change", () => {
        clamp(rowInput);
        minesInput.max = (rowInput.value - 1) * (colInput.value - 1);
    });
    colInput.addEventListener("change", () => {
        clamp(colInput);
        minesInput.max = (rowInput.value - 1) * (colInput.value - 1);
    });
    minesInput.addEventListener("change", () => {
        clamp(minesInput);
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
            const rowInput = document.getElementById("rowInput");
            const colInput = document.getElementById("colInput");
            const minesInput = document.getElementById("minesInput");
            clamp(rowInput);
            clamp(colInput);
            clamp(minesInput);
            const rows = parseInt(rowInput.value, 10);
            const cols = parseInt(colInput.value, 10);
            const mines = parseInt(minesInput.value, 10);

            if (isNaN(rows) || isNaN(cols) || isNaN(mines)) {
                alert("请输入有效的数值");
                return;
            }

            const customPars = {
                size: [rows, cols],
                n: mines,
            };

            onSubmit(customPars);
        },
        modalId: "custom",
        onShow: () => {
            const userConfig = loadConfig();
            const pars = userConfig.level || levels["BEGINNER"];
            const rowInput = document.getElementById("rowInput");
            const colInput = document.getElementById("colInput");
            const minesInput = document.getElementById("minesInput");
            rowInput.value = pars.size[0]; // 初始值
            colInput.value = pars.size[1]; // 初始值
            minesInput.value = pars.n; // 初始值
            minesInput.max = (rowInput.value - 1) * (colInput.value - 1);
        }
    });
};

// 胜利弹窗
const showWinModal = (time) => {
    const title = "恭喜";
    const content = `你赢了！用时${time}秒`
    // 创建弹窗
    createModal(title, content, { modalId: 'win' });
};

export { showModal, showWinModal, showCustomModal };