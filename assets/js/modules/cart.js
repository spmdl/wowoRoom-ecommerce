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

  getCategories() {
    return this._categories;
  }

  getProductId(productIndex) {
    return this._cartsData.carts[productIndex].id;
  }

  getCartQuantity(productIndex) {
    return this._cartsData.carts[productIndex].quantity;
  }

  getProductCategories(data) {
    let productStr = "";
    let categories = [];
    data.forEach( item => {
      if (!categories.includes(item.category)) {
        categories.push(item.category);
      }
      productStr += generateProduct(item.id, item.images, item.title, item.origin_price, item.price);
    });
  }

  getProductQuantity(productId, diffNum) {
    let productIndex = this._searchProductIndexInCarts(productId);
    if (productIndex === -1) {
      return 1;
    } else {
      return this._cartsData.carts[productIndex].quantity + diffNum;
    }
  }

  processCategoriesData(category) {
    let ret = this._productsData.filter((item) => item.category === category || category === "全部");
    return ret;
  }
  _searchProductIndexInCarts(productId) {
    return this._cartsData.carts.findIndex( item => item.product.id == productId);
  }
}