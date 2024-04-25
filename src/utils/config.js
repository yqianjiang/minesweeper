// config.js
const configKey = 'minesweeper_config3';

export const levelsPars = {
  BEGINNER: {
    size: [9, 9],
    n: 10,
  },
  INTERMEDIATE: {
    size: [16, 16],
    n: 40,
  },
  EXPERT: {
    size: [16, 30],
    n: 99,
  }
}

export const defaultStyles = {
  BORDER_COLOR_LIGHT: "#fff",
  BORDER_COLOR_DARK: "#7B7B7B",
  BG_COLOR_MAIN: "#C0C0C0",
};

export const defaultSizes = {
  BORDER_INNER: 6,
  BORDER_MAIN: 18,
};

class GameConfig {
  constructor() {
    this.config = {
      difficulty: "BEGINNER",
      autoFlag: true,
      firstBlank: true,
      firstSafe: true,
      levelPars: levelsPars["BEGINNER"],
    };
    this.loadConfig();
  }

  getConfig() {
    return this.config;
  }

  getDifficulty() {
    return this.config.difficulty.toLowerCase();
  }

  // 从localStorage加载用户配置
  loadConfig() {
    const savedConfig = JSON.parse(localStorage.getItem(configKey));
    this.config = { ...this.getConfig(), ...savedConfig };
    return this.config;
  }

  // 保存用户配置到localStorage
  saveConfig(config) {
    localStorage.setItem(configKey, JSON.stringify(config));
  }

  // 用户更改配置后保存配置
  updateUserConfig(key, value) {
    this.config[key] = value;
    this.saveConfig(this.config);
  }
}

// 导出全局唯一实例
export default new GameConfig();
