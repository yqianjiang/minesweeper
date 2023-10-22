const showModal = (title, msg, onSubmit) => {
    // 创建弹窗容器
    const customModal = document.createElement("div");
    customModal.className = "modal";

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

    // 创建文案
    const msgDom = document.createElement("p");
    msgDom.className = "modal-msg";
    msgDom.innerHTML = msg;
    modalContent.appendChild(msgDom);

    // 创建输入框
    const playerNameInput = document.createElement("input");
    playerNameInput.type = "text";
    playerNameInput.id = "playerNameInput";
    playerNameInput.placeholder = "请输入您的名字";
    modalContent.appendChild(playerNameInput);

    // 创建提交按钮
    const submitNameBtn = document.createElement("button");
    submitNameBtn.innerHTML = "提交";
    submitNameBtn.id = "submitNameBtn";
    modalContent.appendChild(submitNameBtn);

    // 将内容添加到容器
    customModal.appendChild(modalContent);

    // 添加弹窗到页面
    document.body.appendChild(customModal);

    customModal.style.display = "block";

    // 添加事件处理程序
    closeModalBtn.addEventListener("click", () => {
        // const playerName = playerNameInput.value;
        // 把输入的名字保存到local
        customModal.style.display = "none";
    });
    
    submitNameBtn.addEventListener("click", () => {
        const playerName = playerNameInput.value;
        onSubmit(playerName);
        // 把输入的名字保存到local
        customModal.style.display = "none";
    });

    // 在此处添加逻辑以加载上次的默认名字
};

export { showModal };