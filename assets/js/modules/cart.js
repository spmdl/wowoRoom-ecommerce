export default class Cart {
  constructor() {
    this._productsData = [];
    this._cartsData = [];
  }

  setProductsData(data) {
    this._productsData = data;
  }

  setCartsData(data) {
    this._cartsData = data;
  }

  getProductId(productIndex) {
    return this._cartsData.carts[productIndex].id;
  }

  getCartQuantity(productIndex) {
    return this._cartsData.carts[productIndex].quantity;
  }

  getProductQuantity(productId, diffNum) {
    let productIndex = this._searchProductIndexInCarts(productId);
    if (productIndex === -1) {
      return 1;
    } else {
      return this._cartsData.carts[productIndex].quantity + diffNum;
    }
  }

  _searchProductIndexInCarts(productId) {
    return this._cartsData.carts.findIndex( item => item.product.id == productId);
  }
}