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

export async function getAdminRequest(method, args={}) {
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

// ----- customer API ----- //
// 取得全部產品
export const GET_products = () => apiRequest.get(`/customer/${config.api_path}/products`)
// 取得購物車資訊
export const GET_carts = () => apiRequest.get(`/customer/${config.api_path}/carts`)
// 新增產品至購物車
export const POST_carts = data => apiRequest.post(`/customer/${config.api_path}/carts`, data)
// 修改購物車產品數量
export const PATCH_carts = data => apiRequest.patch(`/customer/${config.api_path}/carts`, data)
// 刪除購物車產品
export const DELETE_cartsProd = id => apiRequest.delete(`/customer/${config.api_path}/carts/${id}`)
// 清除購物車
export const DELETE_cartsAllProd = () => apiRequest.delete(`/customer/${config.api_path}/carts`)
// 送出訂單
export const POST_order = data => apiRequest.post(`/customer/${config.api_path}/orders`, data)

export async function getCustomerRequest(method, args={}) {
  switch (method) {
    case "getProductList":
      return await GET_products();
    case "getCartList":
      return await GET_carts();
    case "deleteAllCartList":
      return await DELETE_cartsAllProd();
    case "addCartItem":
      return await POST_carts({
        "data": {
          "productId": args.productId,
          "quantity": args.quantity
        }
      });
    case "editCartItem":
      return await PATCH_carts({
        "data": {
          "id": args.id,
          "quantity": args.quantity
        }
      });
    case "deleteCartItem":
      return await DELETE_cartsProd(args.id);
    case "createOrder":
      return await POST_order({
        "data": {
          "user": {
            "name": args.name,
            "tel": args.tel,
            "email": args.email,
            "address": args.address,
            "payment": args.payment
          }
        }
      });
    
  }
}