// token data
const api_path = "kent";
const token = "tuOllAmACSQgpHpqMpD8LCKgzIH3";
const orderList = document.querySelector(".orderPage-table");
const orderListWrap = document.querySelector(".orderTableWrap");
const delAllOrderBtn =document.querySelector(".discardAllBtn");
const chartDom = document.getElementById("chart")
let chartView = null;
let cartsData = [];

function getOrderList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data.orders);
      renderOrder(response.data.orders);
      addEventToDeleteAllBtn();
    })
    // .catch(function(error){
    //   console.log(error.response)
    // })
}

function deleteAllOrder() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log("deleteAllOrder");
      renderOrder(response.data.orders);
    })
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

// TODO: order 排序
function renderOrder(data) {
  let columns = [];
  let colors = {};
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
  let chartColumn = {};
  let datoSort = data.sort((a, b) => { return b.createdAt - a.createdAt });
  cartsData = data;
  console.log(data, cartsData);
  if (data.length) {
    datoSort.forEach( item => {
      const time = new Date(item.createdAt * 1000);
      let tempOrderHtml = generateOrder(item.id, item.user.name, item.user.tel, item.user.address, item.user.email, item.products[0].title, time.toLocaleDateString(), time.toLocaleTimeString(), item.paid);
      // count price
      chartColumn[item.products[0].title] = chartColumn[item.products[0].title] ? (chartColumn[item.products[0].title] + item.products[0].quantity * item.products[0].price) : (item.products[0].quantity * item.products[0].price);
      orderStr += tempOrderHtml;
    });
    orderList.innerHTML = orderStr;
    delAllOrderBtn.textContent = `清除全部 ${data.length} 筆訂單`;
    addEventToDeleteBtn();
  
    // c3.js render
    columns = processColumnsData(chartColumn);
    colors = processColorsData(columns, ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"]);
    renderChart(columns, colors);
  } else {
    orderList.innerHTML = "";
    delAllOrderBtn.textContent = `加油別氣餒，再加把勁就有訂單了 ༼•̃͡ ɷ•̃͡༽`;
    renderChart();
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

function renderChart(columns=[], colors={}) {
  if (cartsData.length) {
    chartView = c3.generate({
      bindto: '#chart', // HTML 元素綁定
      data: {
          type: "pie",
          columns: columns,
          colors: colors
      },
    });
  }
  if (chartDom.getAttribute("class") && !cartsData.length) {
    chartView.unload();
    chartDom.firstChild.style.height = "0";
  }
}

function processColorsData(columns, colors) {
  let ret = columns.reduce(function(target, key, index) {
    target[key[0]] = colors[index];
    return target;
  }, {}) //initial empty object
  return ret;
}

function processColumnsData(column) {
  // descending order
  let columnArr = Object.entries(column);
  let columnsDescendingOrder = columnArr.sort((a, b) => { return b[1] - a[1] });
  let retArr = columnsDescendingOrder.slice(0, 3);
  // set another data
  if (columnsDescendingOrder.length > 3) {
    let anotherArr = columnsDescendingOrder.slice(2, -1);
    let anotherPrice = anotherArr.reduce((anotherPrice, item) => anotherPrice + item[1], 0);
    retArr.push(["其他", anotherPrice]);
  }
  return retArr;
}

function init() {
  getOrderList();
}

init();

// ........................

function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
    then(function (response) {
      console.log(response.data);
    })
    .catch(function(error){
      console.log(error.response.data)
    })
}

// 加入購物車
function addCartItem() {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    data: {
      "productId": "FaShP00eCGy5cuNQfxX0",
      "quantity": 8
    }
  }).
    then(function (response) {
      console.log(response.data);
    })
}


// 取得購物車列表
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      console.log(response.data);
    })
}

// 清除購物車內全部產品
function deleteAllCartList() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      console.log(response.data);
    })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
      console.log(response.data);
    })
}

// 送出購買訂單
function createOrder() {

  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": "六角學院",
          "tel": "07-5313506",
          "email": "hexschool@hexschool.com",
          "address": "高雄市六角學院路",
          "payment": "Apple Pay"
        }
      }
    }
  ).
    then(function (response) {
      console.log(response.data);
    })
    .catch(function(error){
      console.log(error.response.data);
    })
}

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

// 編輯購物車
function editCartItem() {
  axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, 
    {
      "data": {
        "id": "6Z7E2KK5QqI86xiyULzD",
        "quantity": 87
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