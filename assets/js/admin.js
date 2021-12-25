//===== Module ===== //
import * as api from './api/dataService.js';
import * as c3 from './modules/c3.js';
import Order from './modules/order.js';

//===== DOM ===== //
const orderTable = document.querySelector(".orderPage-table");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const orderList = document.querySelector(".orderPage-list");

//===== API ===== //
async function getOrderListData() {
  const { GET_orders } = api.ADMIN_apiRequest();
  const ordersDataRes = await GET_orders();
  return ordersDataRes.data.orders;
}

async function changeOrderStatus(order, [id, status]) {
  const { PUT_orderStatusChange } = api.ADMIN_apiRequest();
  const orderStatusChangeRes = await PUT_orderStatusChange({
    "data": {
      "id": id,
      "paid": status
    }
  });
  renderOrders(order, orderStatusChangeRes.data.orders);
}

//===== Listener ===== //
function addEventToOrderEdit(order) {
  orderList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    if (e.target.getAttribute('class').includes('delSingleOrder-Btn')) {
      api.deleteOrderItem(e.target.dataset.id);
    } else if (e.target.getAttribute('class').includes('discardAllBtn')) {
      api.deleteAllOrder();
    } else if (e.target.getAttribute('class').includes('orderStatus-not') || e.target.getAttribute('class').includes('orderStatus-done')) {
      changeOrderStatus(order, order.getOrderStatus(e.target.dataset.index));
    }
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
      <a href="javascript:void(0);" data-index=${Number(index)} class="${paid ? 'orderStatus-done' : 'orderStatus-not'}">${paid ? "已處理" : "未處理"}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${id}>
    </td>
  </tr>
  `
}

function renderOrders(order, data) {
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
  let dataSort = order.getOrderSort('desc', data);
  dataSort.forEach( (item, index) => {
    const time = new Date(item.createdAt * 1000);
    order.setChartColumns(item);
    tempOrderStr += generateOrder(item.id, index, item.user.name, item.user.tel, item.user.address, item.user.email, item.products[0].title, time.toLocaleDateString(), time.toLocaleTimeString(), item.paid);
  });
  delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
  orderTable.innerHTML = tempOrderStr;
}

async function init() {
  let order = new Order();
  let data = await getOrderListData();
  renderOrders(order, data);
  addEventToOrderEdit(order);
  c3.reload(order.chartColumns);
}

init();