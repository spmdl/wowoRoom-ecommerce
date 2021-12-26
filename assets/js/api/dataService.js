import config from '../config.js';

// ----- create Instance ----- //
const apiRequest = axios.create({
  baseURL: config.api_url
})
const apiRequestWithToken = axios.create({
  baseURL: config.api_url,
  headers: {
    'authorization': config.token
  }
})

// ----- Admin API ----- //
export const ADMIN_apiRequest = () => {
  // 取得訂單資料
  const GET_orders = () => apiRequestWithToken.get(`/admin/${config.api_path}/orders`);
  // 訂單狀態切換
  const PUT_orderStatusChange = data => apiRequestWithToken.put(`/admin/${config.api_path}/orders`, data);
  // 清空訂單
  const DELETE_allOrders = () => apiRequestWithToken.delete(`/admin/${config.api_path}/orders`);
  // 刪除一筆訂單
  const DELETE_order = id => apiRequestWithToken.delete(`/admin/${config.api_path}/orders/${id}`);

  return {
    GET_orders,
    PUT_orderStatusChange,
    DELETE_allOrders,
    DELETE_order
  };
}

export async function getRequest(method, args={}) {
  switch (method) {
    case "getOrderListData":
      const { GET_orders } = ADMIN_apiRequest()
      return await GET_orders();
    case "deleteOrderAll":
      const { DELETE_allOrders } = ADMIN_apiRequest()
      return await DELETE_allOrders();
    case "deleteOrderItem":
      const { DELETE_order } = ADMIN_apiRequest();
      return await DELETE_order(args.id);
    case "changeOrderStatus":
      const { PUT_orderStatusChange } = ADMIN_apiRequest()
      return await PUT_orderStatusChange({
        "data": {
          "id": args.id,
          "paid": args.status
        }
      });
  }
}

// customer api
export function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${config.api_path}/products`).
    then(function (response) {
      let categories = renderProduct(response.data.products);
      productsData = response.data.products;
      renderCategorySelect(categories);
    })
    .catch(function(error) {
      console.log(error.response.data)
    })
}

// 取得購物車列表
export function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${config.api_path}/carts`).
    then(function (response) {
      renderCart(response.data);
    })
}

// 加入購物車
export function addCartItem(itemData) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${config.api_path}/carts`, {
    "data": itemData
  }).
    then(function (response) {
      renderCart(response.data);
    })
}

// 刪除購物車內特定產品
export const deleteCartItem = function(cartId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${config.api_path}/carts/${cartId}`).
    then(function (response) {
      renderCart(response.data);
    })
}

// 清除購物車內全部產品
export function deleteAllCartList() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${config.api_path}/carts`).
    then(function (response) {
      renderCart(response.data);
    })
}

// 編輯購物車
export function editCartItem(cartId, quantity) {
  axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${config.api_path}/carts`, 
    {
      "data": {
        "id": cartId,
        "quantity": quantity
      }
    },
    {
      headers: {
        'Authorization': config.token
      }
    })
    .then(function (response) {
      renderCart(response.data);
    })
}