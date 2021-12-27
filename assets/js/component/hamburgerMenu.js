export function menuToggle() {
  const menu = document.querySelector('.topBar-menu');
  if(menu.classList.contains('openMenu')) {
    menu.classList.remove('openMenu');
  }else {
    menu.classList.add('openMenu');
  }
}
export function closeMenu(dom) {
  return function() {
    // prevent click effect fast fade out.
    new Promise( () => setTimeout(function() {
      dom.classList.remove('openMenu');
    }, 300));
  }
}