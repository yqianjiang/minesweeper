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

function isSameSize(sizeA, sizeB) {
  return Array.isArray(sizeA)
    && Array.isArray(sizeB)
    && sizeA.length === sizeB.length
    && sizeA.every((value, index) => value === sizeB[index]);
}

// 以实际棋盘参数为准解析难度，避免配置与恢复的棋盘状态不一致时提交到错误榜单。
export function resolveGameDifficulty(difficulty, size, numMine) {
  const normalizedDifficulty = typeof difficulty === "string"
    ? difficulty.toLowerCase()
    : null;

  if (normalizedDifficulty === "custom") {
    return "custom";
  }

  const matchedLevel = Object.entries(levelsPars).find(([, pars]) => (
    pars.n === numMine && isSameSize(pars.size, size)
  ));

  if (!matchedLevel) {
    return "custom";
  }

  return matchedLevel[0].toLowerCase();
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
    const savedLevelPars = savedConfig?.level || savedConfig?.levelPars;
    this.config = {
      ...this.getConfig(),
      ...savedConfig,
      ...(savedLevelPars ? { levelPars: savedLevelPars } : {}),
    };
    // 兼容旧版本误写入的 level 字段，后续只保留 levelPars。
    delete this.config.level;
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

  updateUserConfigs(values) {
    Object.assign(this.config, values);
    this.saveConfig(this.config);
  }
}

// 导出全局唯一实例
export default new GameConfig();
