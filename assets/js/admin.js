//===== Module ===== //
import * as api from './api/dataService.js';
import Chart from './modules/c3.js';
import Order from './modules/order.js';

let c3 = new Chart();
let order = new Order();

//===== DOM ===== //
const orderTable = document.querySelector(".orderPage-table");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const orderList = document.querySelector(".orderPage-list");

//===== API ===== //
async function apiRequest(method) {
  const methodType = {
    "getOrderListData": method === "getOrderListData" && api.ADMIN_apiRequest("GET_orders"),
    "deleteOrderAll": method === "deleteOrderAll" && api.ADMIN_apiRequest("DELETE_allOrders"),
    "deleteOrderItem": method === "deleteOrderItem" && api.ADMIN_apiRequest("DELETE_order", args),
    "changeOrderStatus": method === "changeOrderStatus" && api.ADMIN_apiRequest("PUT_orderStatusChange", {
      "data": {
        "id": args.id,
        "paid": args.status
      }
    }),
  };
  return await methodType[method];
}

//===== editOrder ===== //
async function editOrderEvents(method, orderRender=true, c3Render=false, args={}) {
  try {
    let resDataRes = await apiRequest(method);
    orderRender && renderOrders(resDataRes.data.orders);
    c3Render && (order.getOrderData().length > 0 ? c3.reload(order.getChartColumns()) : c3.destroy());
  } catch (error) {
    throw error;
  }
}

//===== Listener ===== //
function addEventToOrderEdit(order) {
  orderList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    const orderEditListener = {
      'delSingleOrder-Btn': e.target.getAttribute('class').includes('delSingleOrder-Btn') && editOrderEvents("deleteOrderItem", true, true, e.target.dataset.id),
      'delSingleOrder-Btn': e.target.getAttribute('class').includes('discardAllBtn') && editOrderEvents("deleteOrderAll", true, true),
      'orderStatus-not': e.target.getAttribute('class').includes('orderStatus-not') && editOrderEvents("changeOrderStatus", true, false, order.getOrderStatus(e.target.dataset.index)),
      'orderStatus-done': e.target.getAttribute('class').includes('orderStatus-done') && editOrderEvents("changeOrderStatus", true, false, order.getOrderStatus(e.target.dataset.index)),
    };
    orderEditListener[e.target.getAttribute('class')];
  });
}

//===== render view ===== //
function generateOrderProductsTitle(items) {
  let retTempStr = ``;
  items.forEach( item => retTempStr += `<li>${item.title}x${item.quantity}</li>`);
  return retTempStr;
}
function generateOrder(id, index, userName, userTel, userAddress, userEmail, products, productDate, productTime, paid) {
  return `
  <tr>
    <td>${id}</td>
    <td>${userName}</td>
    <td>${userTel}</td>
    <td>${userAddress}</td>
    <td>${userEmail}</td>
    <td>
      <ul>${generateOrderProductsTitle(products)}</ul>
    </td>
    <td>
      <p>${productDate}</p>
      <p>${productTime}</p>
    </td>
    <td class="orderStatus">
      <a href="javascript:void(0);" data-index=${index} class="${paid ? 'orderStatus-done' : 'orderStatus-not'}">${paid ? "已處理" : "未處理"}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${id}>
    </td>
  </tr>
  `
}

function renderOrders(data) {
  if (!data.length) {
    orderList.innerHTML = `
      <div class="empty-cart">
        <p> 加油別氣餒，再加把勁就有訂單了 ༼•̃͡ ɷ•̃͡༽ </p>
      </div>
    ` ;
    return;
  }
  let tempOrderStr = `
    <thead>
      <tr>
          <th>訂單編號</th>
          <th>聯絡人</th>
          <th>聯絡電話</th>
          <th>聯絡地址</th>
          <th>電子郵件</th>
          <th>訂單品項</th>
          <th>訂單日期</th>
          <th>訂單狀態</th>
          <th>操作</th>
      </tr>
    </thead>
  `;
  order.setOrderData(data);
  let dataSort = order.getOrderSort(data);
  dataSort.forEach( (item, index) => tempOrderStr += generateOrder(...order.processOrderData(item, index)));
  delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
  orderTable.innerHTML = tempOrderStr;
}

async function init() {
  await editOrderEvents("getOrderListData", true, true);
  addEventToOrderEdit(order);
}

init();