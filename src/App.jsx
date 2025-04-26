import { useEffect } from "react";
import LeaderBoard from "./components/LeaderBoard/index.jsx";
import { setupMobileMenuToggle } from "./utils/setupMobileMenuToggle.js"

function App() {
  useEffect(() => {
    // 绑定移动端菜单的点击事件
    const unbindMobileMenu = setupMobileMenuToggle();

    // 清理函数
    return () => {
      unbindMobileMenu();
    };
  }
  , []);

  return (
    <>
      <LeaderBoard />
    </>
  );
}

export default App;
