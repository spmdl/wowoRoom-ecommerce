// Just do two tasks
// 1. data storage.
// 2. data processing.
export default class Cart {
  constructor() {
    this._cartsData = [];
    this._productsData = [];
    this._categories = [];
  }

  setProductsData(data) {
    this._productsData = data;
  }

  setCartsData(data) {
    this._cartsData = data;
  }

  setCategories(category) {
    if (!this._categories.includes(category)) {
      this._categories.push(category);
    }
  }

  getProductsData() {
    return this._productsData;
  }

  getCategories() {
    return this._categories;
  }

  getProductId(productIndex) {
    return this._cartsData.carts[productIndex].id;
  }

  processEditCartQuantity(e, diffNum=0) {
    let itemIndex = e.target.parentNode.dataset.index;
    let id = this.getProductId(itemIndex);
    let quantity = this.getProductQuantity(diffNum, id, itemIndex);
    return { id, quantity };
  }

  getCartIndex(productId) {
    return this._searchProductIndexInCarts(productId);
  }

  getProductQuantity(diffNum, productId, productIndex) {
    let retIndex = productIndex || this._searchProductIndexInCarts(productId);
    if (retIndex === -1) {
      return 1;
    } else {
      return this._cartsData.carts[retIndex].quantity + diffNum;
    }
  }

  processCategoriesFilter(category) {
    let ret = this._productsData.filter((item) => item.category === category || category === "全部");
    return ret;
  }
  _searchProductIndexInCarts(productId) {
    return this._cartsData.carts.findIndex( item => item.product.id == productId);
  }
}