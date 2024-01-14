const infoKey = 'minesweeper';

class UserInfo {
  constructor() {
    this.name = '';
    this.loadFromStorage();
    // 若该用户还没有 uuid，生成一个唯一的 uuid
    if (!this.uuid) {
      this.uuid = window.crypto.randomUUID();
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