// config.js
const configKey = 'minesweeper_config2';

export const levels = {
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

// 默认配置
const defaultConfig = {
  difficulty: "BEGINNER",
  autoFlag: true,
  firstBlank: true,
  firstSafe: true,
  level: levels["BEGINNER"],
};

// 从localStorage加载用户配置
function loadConfig() {
  const savedConfig = JSON.parse(localStorage.getItem(configKey));
  return { ...defaultConfig, ...savedConfig };
}

// 保存用户配置到localStorage
function saveConfig(config) {
  localStorage.setItem(configKey, JSON.stringify(config));
}

// 用户更改配置后保存配置
function updateUserConfig(key, value) {
  const userConfig = loadConfig();
  userConfig[key] = value;
  saveConfig(userConfig);
}


// 导出配置相关的函数和默认配置
export { loadConfig, saveConfig, updateUserConfig };
