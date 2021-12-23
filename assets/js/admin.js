import * as c3 from './modules/c3.js';

// token data
const api_path = "kent";
const token = "tuOllAmACSQgpHpqMpD8LCKgzIH3";
const orderList = document.querySelector(".orderPage-table");
const orderListWrap = document.querySelector(".orderTableWrap");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const chartDom = document.getElementById("chart")
let cartsData = [];

function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      renderOrder(response.data.orders);
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
    })
    .catch((err) => { console.error(err) });
}

// addEventListener
function addEventToDeleteBtn() {
  const delOrderBtn = document.querySelectorAll(".delSingleOrder-Btn");
  delOrderBtn.forEach(item => {
    item.addEventListener("click", e => {
      e.preventDefault();
      if(e.target.getAttribute('class') !== "delSingleOrder-Btn"){
        return
      }
      deleteOrderItem(e.target.dataset.id);
    });
  });
}

function addEventToDeleteAllBtn() {
  delAllOrderBtn.addEventListener("click", function() {
    if (cartsData.length) {
      deleteAllOrder();
    }
  });
}

function renderOrder(data) {
  let chartColumns = {};
  let orderStr = `
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
  let datoSort = data.sort((a, b) => { return b.createdAt - a.createdAt });
  cartsData = data;
  if (data.length) {
    datoSort.forEach( item => {
      const time = new Date(item.createdAt * 1000);
      let tempOrderHtml = generateOrder(item.id, item.user.name, item.user.tel, item.user.address, item.user.email, item.products[0].title, time.toLocaleDateString(), time.toLocaleTimeString(), item.paid);
      // count price for chart
      chartColumns[item.products[0].title] = chartColumns[item.products[0].title] ? (chartColumns[item.products[0].title] + item.products[0].quantity * item.products[0].price) : (item.products[0].quantity * item.products[0].price);
      orderStr += tempOrderHtml;
    });
    orderList.innerHTML = orderStr;
    delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
    addEventToDeleteBtn();  
    renderChart(chartColumns);
  } else {
    orderList.innerHTML = "";
    delAllOrderBtn.textContent = `加油別氣餒，再加把勁就有訂單了 ༼•̃͡ ɷ•̃͡༽`;
    renderChart(chartColumns);
  }
}

function generateOrder(id, userName, userTel, userAddress, userEmail, productTitle, productDate, productTime, paid) {
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
      <a href="javascript:void(0);">${paid ? "以處理" : "未處理"}</a>
    </td>
    <td>
      <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${id}>
    </td>
  </tr>
  `
}

function renderChart(columns) {
  if (chartDom.getAttribute("class") && !cartsData.length) {
    c3.destroy();
  } else {
    c3.reload(columns);
  }
}

function init() {
  getOrderList();
  addEventToDeleteAllBtn();
}

init();

// ........................
// 修改訂單狀態
function editOrderList(orderId) {
  axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      "data": {
        "id": orderId,
        "paid": true
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
    })
}
