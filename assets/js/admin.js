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
const orderFilterSelect = document.querySelector(".orderFilterSelect");
const orderSortSelect = document.querySelector(".orderSortSelect");
const searchNum = document.querySelector(".searchNum");
// hamburger menu
const menuOpenBtn = document.querySelector('.menuToggle');
const menu = document.querySelector('.topBar-menu');

//===== Decorator ===== //
function checkOrdersEmpty(data) {
  if (!data.length) {
    orderList.innerHTML = generateTemp.orderEmpty();
    return;
  }
  renderOrders(order.processOrderData(data, orderFilterSelect.value, orderSortSelect.value));
}

//===== listener ===== //
async function orderEditListener(method, orderRender=true, c3Render=false, args={}) {
  try {
    let resData = await api.getRequest(method, args);
    order.setOriginData(resData.data.orders);
    orderRender && checkOrdersEmpty(resData.data.orders);
    c3Render && (resData.data.orders.length > 0 ? c3.reload() : c3.destroy());
  } catch (error) {
    throw error;
  }
}

//===== event type ===== //
function addEventToHamburger() {
  menuOpenBtn.addEventListener('click', menuToggle);
  menu.addEventListener('click', closeMenu(menu));
}
function addEventToOrderEdit(order) {
  orderSortSelect.addEventListener('change', e => renderOrders(order.processOrderData(
      order.getOriginData(), 
      orderFilterSelect.value, 
      e.target.value
    ))
  );
  orderFilterSelect.addEventListener('change', e => {
    let retData = order.processOrderData(
      order.getOriginData(), 
      e.target.value, 
      orderSortSelect.value
    );
    searchNum.textContent = retData.length;
    renderOrders(retData);
  });
  orderList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    const getOrderEditListener = {
      'delSingleOrder-Btn': e.target.getAttribute('class').includes('delSingleOrder-Btn') && orderEditListener("deleteOrderItem", true, true, {"id": e.target.dataset.id}),
      'discardAllBtn': e.target.getAttribute('class').includes('discardAllBtn') && orderEditListener("deleteOrderAll", true, true),
      'orderStatus-not': e.target.getAttribute('class').includes('orderStatus-not') && orderEditListener("changeOrderStatus", true, false, order.getOrderStatus(e.target.dataset.index)),
      'orderStatus-done': e.target.getAttribute('class').includes('orderStatus-done') && orderEditListener("changeOrderStatus", true, false, order.getOrderStatus(e.target.dataset.index)),
    };
    getOrderEditListener[e.target.getAttribute('class')];
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

function renderOrders(data) {
  let tempOrderStr = generateTemp.orderThead();
  c3.setColumnsInit();
  data.forEach( (item, index) => {
    tempOrderStr += generateTemp.orderItem(
      ...order.setProductData(item, index), 
      renderProductsTitle(item.products)
    );
  });
  delAllOrderBtn.textContent = "清除全部訂單";
  searchNum.textContent = data.length;
  orderTable.innerHTML = tempOrderStr;
}

async function init() {
  await orderEditListener("getOrderListData", true, true);
  addEventToOrderEdit(order);
  addEventToHamburger();
}

init();