export function menuToggle(dom) {
  return function() {
    if(dom.classList.contains('openMenu')) {
        dom.classList.remove('openMenu');
    }else {
        dom.classList.add('openMenu');
    }
  }
}
export function closeMenu(dom) {
  return function() {
    new Promise( () => setTimeout(function() {
      dom.classList.remove('openMenu');
    }, 300));
  }
}