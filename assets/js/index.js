//===== Module ===== //
import { getCustomerRequest } from './api/dataService.js';
import * as generateTemp from './template/cartTemplate.js';
import Cart from './modules/cart.js';
import Validator from './modules/formValidator.js';

// product DOM
const productSelect = document.querySelector(".productSelect");
const searchNum = document.querySelector(".searchNum");
// cart DOM
const cartList = document.querySelector(".shoppingCart-table");
const productList = document.querySelector(".productWrap");

// form DOM
const orderForm = document.forms['orderForm'];
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const customerEmail = document.getElementById("customerEmail");
const customerAddress = document.getElementById("customerAddress");
const creatOrderBtn = document.querySelector(".orderInfo-btn");

//===== Module instance ===== //
let cart = new Cart();
let validator = new Validator();

//===== Decorator ===== //
function checkEditCartQuantity(oldValue) {
  return function(e) {
    let diffNum = parseInt(e.target.value) - parseInt(oldValue);
    if (!diffNum) { return }
    editCartQuantity(e, diffNum);
  }
}

function checkCartsEmpty(data) {
  if (!data.carts.length) {
    cartList.innerHTML = generateTemp.tableCartEmpty();
    return;
  }
  renderCart(data);
}

//===== listener ===== //
async function getProductList() {
  try {
    let resData = await getCustomerRequest("getProductList");
    cart.setProductsData(resData.data.products);
    renderProduct(resData.data.products);
  } catch (error) {
    throw error;
  }
}

function editCartQuantity(e, diffNum=0) {
  let itemIndex = e.target.parentNode.dataset.index;
  let itemId = cart.getProductId(itemIndex);
  let retQuantity = cart.getCartQuantity(itemIndex) + diffNum;
  if (retQuantity) {
    productEditListener("editCartItem", {
      "id": itemId,
      "quantity": retQuantity
    });
  } else {
    productEditListener("deleteCartItem", {
      "id": itemId
    });
  }
}

async function productEditListener(method, args={}) {
  try {
    let resData = await getCustomerRequest(method, args);
    cart.setCartsData(resData.data);
    checkCartsEmpty(resData.data);
  } catch (error) {
    throw error;
  }
}

async function createOrder(name="五角", tel="07-5313506", email="hexschool@hexschool.com", address="高雄市六角學院路", payment="Apple Pay") {
  try {
    await getCustomerRequest("createOrder", {
      "name": name,
      "tel": tel,
      "email": email,
      "address": address,
      "payment": payment
    });
    productEditListener("getCartList");
    validator.clearForm(orderForm);
  } catch (error) {
    throw error;
  }
}

function changeCategorySelect(e) {
  let filterData = cart.processCategoriesData(e.target.value);;
  searchNum.textContent = `${filterData.length}`;
  renderProduct(filterData);
}

//===== event type ===== //
function addEventToCartBtn() {
  productList.addEventListener("click", e => {
    if(e.target.getAttribute('class') && e.target.getAttribute('class').includes("addCartBtn")) {
      productEditListener("addCartItem", {
        "productId": e.target.dataset.id,
        "quantity": cart.getProductQuantity(e.target.dataset.id, 1)
      });
    }
  });
}

function addEventToInput(e) { 
  e.target.addEventListener('change', checkEditCartQuantity(e.target.value), {
    once: true
  });
}

function addEventToProductSelect() { 
  productSelect.addEventListener("change", changeCategorySelect);
}

function addEventToCartEdit() { 
  cartList.addEventListener("click", e => {
    if (!e.target.getAttribute('class')) { return; }
    const cartEditListener = {
      'discardAllBtn': e.target.getAttribute('class').includes('discardAllBtn') && productEditListener("deleteAllCartList"),
      'discardBtn': e.target.getAttribute('class').includes('discardBtn') && productEditListener("deleteCartItem", {"id": e.target.dataset.id}),
      'quantity-sub': e.target.getAttribute('class').includes('quantity-sub') && editCartQuantity(e, -1),
      'cart-quantity': e.target.getAttribute('class').includes('cart-quantity') && addEventToInput(e),
      'quantity-add': e.target.getAttribute('class').includes('quantity-add') && editCartQuantity(e, 1),
    };
    cartEditListener[e.target.getAttribute('class')];
  });
}

function addEventToForm() { 
  customerName.addEventListener("change", function(e){ validator.invisibleError(e) });
  customerPhone.addEventListener("change", function(e){ validator.invisibleError(e) });
  customerEmail.addEventListener("change", function(e){ validator.invisibleError(e) });
  customerAddress.addEventListener("change", function(e){ validator.invisibleError(e) });
  creatOrderBtn.addEventListener("click", function(e) {
    e.preventDefault();
    if (validator.getValidationFalseNum() === 0) {
      let orderData = validator.processFormData(orderForm);
      createOrder(orderData.name, orderData.tel, orderData.email, orderData.address, orderData.payment);
    }
  });
}

//===== render view ===== //
function renderCategorySelect(categories) {
  let productSelectStr = "";
  let retCategories = ["全部", ...categories];
  retCategories.forEach( item => productSelectStr += generateTemp.selectProductsCategories(item) );
  productSelect.innerHTML = productSelectStr;
}

function renderProduct(data) {
  let productStr = "";
  data.forEach( item => {
    cart.setCategories(item.category);
    productStr += generateTemp.ulProducts(item.id, item.images, item.title, item.origin_price, item.price);
  });
  searchNum.textContent = `${data.length}`;
  productList.innerHTML = productStr;
}

function renderCart(data) {
  let cartStr = "";
  data.carts.forEach( (item, index) => cartStr += generateTemp.tbodyCarts(
    item.quantity * item.product.price, 
    item.id, index, item.category, item.product.images, item.product.title, item.product.price, item.quantity
  ));
  cartList.innerHTML = `
    ${generateTemp.theadCarts()}
    ${cartStr}
    ${generateTemp.tfootCarts(data.finalTotal)}
  `;
}

async function init() {
  // product
  await getProductList();
  addEventToCartBtn();
  // category select
  renderCategorySelect(cart.getCategories());
  addEventToProductSelect();
  // cart
  productEditListener("getCartList");
  addEventToCartEdit();
  // form
  addEventToForm();
}

init();