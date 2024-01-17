const infoKey = 'minesweeper';

function generateUUID() {
  // 能力检测
  if ("crypto" in window && "randomUUID" in window.crypto) {
    return window.crypto.randomUUID();
  }

  // 兼容性处理
  // https://stackoverflow.com/a/2117523/1293256
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    // eslint-disable-next-line no-mixed-operators
    const r = (Math.random() * 16) | 0;
    // eslint-disable-next-line no-mixed-operators,eqeqeq
    const v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

class UserInfo {
  constructor() {
    this.name = '';
    this.loadFromStorage();
    // 若该用户还没有 uuid，生成一个唯一的 uuid
    if (!this.uuid) {
      this.uuid = generateUUID();
      this.saveToStorage();
    }
  }

  loadFromStorage() {
    try {
      const savedInfo = JSON.parse(localStorage.getItem(infoKey + 'UserInfo'));
      for (const key in savedInfo) {
        this[key] = savedInfo[key];
      }
    } catch (error) {
      console.log("Error loading data from local storage:", error);
    }
  }

  saveToStorage() {
    localStorage.setItem(infoKey + 'UserInfo', JSON.stringify(this));
  }

  updateName(name) {
    this.name = name;
    this.saveToStorage();
  }

  updateUuid(uuid) {
    this.uuid = uuid;
    this.saveToStorage();
  }
}

const userInfo = new UserInfo();
export default userInfo;