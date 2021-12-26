//===== Module ===== //
import * as api from './api/dataService.js';
import * as c3 from './modules/c3.js';
import Order from './modules/order.js';

let order = new Order();

//===== DOM ===== //
const orderTable = document.querySelector(".orderPage-table");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const orderList = document.querySelector(".orderPage-list");

//===== API ===== //
async function getOrderListData() {
  try {
    const { GET_orders } = api.ADMIN_apiRequest();
    const ordersDataRes = await GET_orders();
    renderOrders(ordersDataRes.data.orders);
    c3.reload(order.chartColumns);
  } catch (error) {
    throw error;
  }
}

async function changeOrderStatus([id, status]) {
  try {
    const { PUT_orderStatusChange } = api.ADMIN_apiRequest();
    const orderStatusChangeRes = await PUT_orderStatusChange({
      "data": {
        "id": id,
        "paid": status
      }
    });
    renderOrders(orderStatusChangeRes.data.orders);
  } catch (error) {
    throw error;
  }
}

async function deleteOrderItem(id) {
  try {
    const { DELETE_order } = api.ADMIN_apiRequest();
    const orderDeleteRes = await DELETE_order(id);
    renderOrders(orderDeleteRes.data.orders);
    c3.reload(order.chartColumns);
  } catch (error) {
    throw error;
  }
}

async function deleteOrderAll() {
  try {
    const { DELETE_allOrders } = api.ADMIN_apiRequest();
    const orderDeleteAll = await DELETE_allOrders();
    renderOrders(orderDeleteAll.data.orders);
    c3.reload(order.chartColumns);
  } catch (error) {
    throw error;
  }
}

//===== Listener ===== //
function addEventToOrderEdit(order) {
  orderList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    const orderEditListener = {
      'delSingleOrder-Btn': e.target.getAttribute('class').includes('delSingleOrder-Btn') && deleteOrderItem(e.target.dataset.id),
      'discardAllBtn': e.target.getAttribute('class').includes('discardAllBtn') && deleteOrderAll(),
      'orderStatus-not': e.target.getAttribute('class').includes('orderStatus-not') && changeOrderStatus(order.getOrderStatus(e.target.dataset.index)),
      'orderStatus-done': e.target.getAttribute('class').includes('orderStatus-done') && changeOrderStatus(order.getOrderStatus(e.target.dataset.index)),
    };
    orderEditListener[e.target.getAttribute('class')];
  });
}

//===== render view ===== //
function generateOrder(id, index, userName, userTel, userAddress, userEmail, productTitle, productDate, productTime, paid) {
  return `
  <tr>
    <td>${id}</td>
    <td>${userName}</td>
    <td>${userTel}</td>
    <td>${userAddress}</td>
    <td>${userEmail}</td>
    <td>
      <p>${productTitle}</p>
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
    c3.destroy();
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
  order.setCartsData(data);
  let dataSort = order.getOrderSort(data);
  dataSort.forEach( (item, index) => tempOrderStr += generateOrder(...order.processOrderData(item, index)));
  delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
  orderTable.innerHTML = tempOrderStr;
}

async function init() {
  await getOrderListData();
  addEventToOrderEdit(order);
}

init();