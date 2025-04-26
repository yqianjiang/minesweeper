// 缓存DOM元素
const selectors = {
  menuButton: '.mobileMenuButton',
  mobileMenu: '.mobileMenu',
  navLinks: '.mobileNav a'
};

export function setupMobileMenuToggle() {
  const menuButton = document.querySelector(selectors.menuButton);
  const mobileMenu = document.querySelector(selectors.mobileMenu);
  
  const handleToggleMenu = (event) => {
    event.stopPropagation(); // 防止事件冒泡触发文档点击事件
    toggleMobileMenu(mobileMenu, menuButton);
  }

  const handleCloseMenu = () => {
    closeMobileMenu(mobileMenu, menuButton);
  }

  // 绑定菜单切换事件
  menuButton.addEventListener('click', handleToggleMenu);

  // 点击菜单项后关闭菜单
  document.querySelectorAll(selectors.navLinks).forEach(link => {
    link.addEventListener('click', handleCloseMenu);
  });

  // 点击页面其他位置关闭菜单
  const handleOutsideClick = (event) => {
    if (!mobileMenu.contains(event.target) && 
        !menuButton.contains(event.target) && 
        mobileMenu.classList.contains('open')) {
      closeMobileMenu(mobileMenu, menuButton);
    }
  };
  
  document.addEventListener('click', handleOutsideClick);
  
  // 提供解绑函数，便于在需要时清理事件监听
  return function unbindMobileMenu() {
    menuButton.removeEventListener('click', handleToggleMenu);
    document.removeEventListener('click', handleOutsideClick);
    document.querySelectorAll(selectors.navLinks).forEach(link => {
      link.removeEventListener('click', handleCloseMenu);
    });
  };
}

function toggleMobileMenu(mobileMenu, menuButton) {
  mobileMenu.classList.toggle('open');
  menuButton.classList.toggle('open');
}

function closeMobileMenu(mobileMenu, menuButton) {
  mobileMenu.classList.remove('open');
  menuButton.classList.remove('open');
}
