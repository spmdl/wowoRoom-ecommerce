import * as c3 from './modules/c3.js';

// token data
const api_path = "kent";
const token = "tuOllAmACSQgpHpqMpD8LCKgzIH3";
const orderTable = document.querySelector(".orderPage-table");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const orderList = document.querySelector(".orderPage-list");
let cartsData = [];
let chartColumns = {};

function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      renderOrder(response.data.orders);
      c3.reload(chartColumns);
    })
    .catch((err) => { console.error(err) });
}

function deleteAllOrder() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      renderOrder(response.data.orders);
      c3.reload(chartColumns);
    })
    .catch((err) => { console.error(err) });
}

function deleteOrderItem(orderId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${orderId}`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      renderOrder(response.data.orders);
      c3.reload(chartColumns);
    })
    .catch((err) => { console.error(err) });
}

function editOrderList(orderId, orderStatus) {
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": orderStatus
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      renderOrder(response.data.orders);
    })
}

function addEventToOrderEdit() {
  orderList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    if (e.target.getAttribute('class').includes('delSingleOrder-Btn')) {
      deleteOrderItem(e.target.dataset.id);
    } else if (e.target.getAttribute('class').includes('discardAllBtn')) {
      deleteAllOrder();
    } else if (e.target.getAttribute('class').includes('orderStatus-not') || e.target.getAttribute('class').includes('orderStatus-done')) {
      changeOrderPaid(e.target.dataset.index);
    }
  });
}

function processOrderSort(type, data) {
  const sortType = {
    'desc': data.sort((a, b) => { return b.createdAt - a.createdAt })
  }
  return sortType[type];
}

function changeOrderPaid(index) {
  editOrderList(cartsData[index].id, !cartsData[index].paid, index);
  if (cartsData[index].paid) {

  }
}

function setChartColumns(chartColumns, item) {
  if (chartColumns[item.products[0].title]) {
    chartColumns[item.products[0].title] = chartColumns[item.products[0].title] + item.products[0].quantity * item.products[0].price
  } else {
    chartColumns[item.products[0].title] = item.products[0].quantity * item.products[0].price
  }
}

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

function renderOrder(data) {
  if (!data.length) {
    orderList.innerHTML = `
      <div class="empty-cart">
        <p> 加油別氣餒，再加把勁就有訂單了 ༼•̃͡ ɷ•̃͡༽ </p>
      </div>
    ` ;
    c3.destroy();
    return;
  }
  cartsData = data;
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
  let dataSort = processOrderSort('desc', cartsData);
  dataSort.forEach( (item, index) => {
    const time = new Date(item.createdAt * 1000);
    setChartColumns(chartColumns, item);
    tempOrderStr += generateOrder(item.id, index, item.user.name, item.user.tel, item.user.address, item.user.email, item.products[0].title, time.toLocaleDateString(), time.toLocaleTimeString(), item.paid);
  });
  delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
  orderTable.innerHTML = tempOrderStr;
}

function init() {
  getOrderList();
  addEventToOrderEdit();
}

init();