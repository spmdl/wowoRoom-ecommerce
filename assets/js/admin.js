//===== Module ===== //
import * as api from './api/dataService.js';
import Chart from './component/c3.js';
import { closeMenu, menuToggle } from './component/hamburgerMenu.js';
import Order from './modules/order.js';
import * as generateTemp from './template/renderTemplate.js';

let c3 = new Chart();
let order = new Order();

//===== DOM ===== //
// order
const orderTable = document.querySelector(".orderPage-table");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const orderList = document.querySelector(".orderPage-list");
// hamburger menu
const menuOpenBtn = document.querySelector('.menuToggle');
const menu = document.querySelector('.topBar-menu');

//===== editOrder ===== //
async function editOrderEvents(method, orderRender=true, c3Render=false, args={}) {
  try {
    let resDataRes = await api.getRequest(method, args);
    orderRender && await renderOrders(resDataRes.data.orders);
    c3Render && (order.getOrderData().length > 0 ? c3.reload() : c3.destroy());
  } catch (error) {
    throw error;
  }
}

//===== Listener ===== //
function addEventToHamburger() {
  menuOpenBtn.addEventListener('click', menuToggle(menu));
  menu.addEventListener('click', closeMenu(menu));
}
function addEventToOrderEdit(order) {
  orderList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    const orderEditListener = {
      'delSingleOrder-Btn': e.target.getAttribute('class').includes('delSingleOrder-Btn') && editOrderEvents("deleteOrderItem", true, true, {"id": e.target.dataset.id}),
      'discardAllBtn': e.target.getAttribute('class').includes('discardAllBtn') && editOrderEvents("deleteOrderAll", true, true),
      'orderStatus-not': e.target.getAttribute('class').includes('orderStatus-not') && editOrderEvents("changeOrderStatus", true, false, order.getOrderStatus(e.target.dataset.index)),
      'orderStatus-done': e.target.getAttribute('class').includes('orderStatus-done') && editOrderEvents("changeOrderStatus", true, false, order.getOrderStatus(e.target.dataset.index)),
    };
    orderEditListener[e.target.getAttribute('class')];
  });
}

//===== render view ===== //
function renderProductsTitle(products) {
  let tempProductsTitle = ``;
  products.forEach( product => {
    c3.setColumns(product);
    tempProductsTitle += generateTemp.generateOrderProductsTitle(product.title, product.quantity);
  });
  return tempProductsTitle;
}
async function renderOrders(data) {
  if (!data.length) {
    orderList.innerHTML = generateTemp.orderEmpty();
    return;
  }
  let tempOrderStr = generateTemp.orderThead();
  c3.setColumnsInit();
  order.setOrderData(data);
  let dataSort = order.getOrderSort(data);
  dataSort.forEach( (item, index) => {
    tempOrderStr += generateTemp.orderItem(
      ...order.processOrderData(item, index), 
      renderProductsTitle(item.products)
    );
  });
  delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
  orderTable.innerHTML = tempOrderStr;
}

async function init() {
  await editOrderEvents("getOrderListData", true, true);
  addEventToOrderEdit(order);
  addEventToHamburger();
}

init();