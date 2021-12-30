//===== Module ===== //
import { getCustomerRequest } from './api/dataService.js';
import Cart from './modules/cart.js';
import Validator from './modules/formValidator.js';
import * as generateTemp from './template/cartTemplate.js';

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
function checkEditCartQuantityRequest(e, data) {
  renderLoader(e);
  if (data.quantity) {
    productEditListener("editCartItem", {
      "id": data.id,
      "quantity": data.quantity
    });
  } else {
    productEditListener(e,"deleteCartItem", {
      "id": data.id
    });
  }
}
function checkEditCartQuantity(e, oldValue, newValue) {
  e.target.blur();
  let diffNum = parseInt(newValue) - parseInt(oldValue);
  if (!diffNum) { 
    e.target.value = oldValue;
    return ;
  }
  checkEditCartQuantityRequest(e, cart.processEditCartQuantity(e, diffNum))
}

function checkCartsEmpty(data) {
  if (!data.carts.length) {
    cartList.innerHTML = generateTemp.tableCartEmpty();
    return;
  }
  renderCart(data);
}

function checkFormValidation(e) {
  e.preventDefault();
  if (validator.getValidationFalseNum() !== 0) { return }
  let orderData = validator.processFormDataToObj(orderForm);
  createOrder(orderData.name, orderData.tel, orderData.email, orderData.address, orderData.payment);
}

//===== listener ===== //
async function getProductList() {
  try {
    let resData = await getCustomerRequest("getProductList");
    cart.setProductsData(resData.data.products);
  } catch (error) {
    throw error;
  }
}

async function productEditListener(method, args={}) {
  try {
    let resData = await getCustomerRequest(method, args);
    console.log(resData);
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
  let filterData = cart.processCategoriesFilter(e.target.value);;
  searchNum.textContent = `${filterData.length}`;
  renderProduct(filterData);
}

function changeInvisibleError(e) {
  const customerDom = document.getElementById(`${e.target.id}-message`);
  const retValidation = validator.checkDataValidation(e.target.id, e.target.value);
  const retInvisible = customerDom.getAttribute("class").includes('invisible');

  retValidation && !retInvisible && renderHideValidationError(customerDom);
  !retValidation && retInvisible && renderShowValidationError(customerDom);
  validator.getValidationFalseNum() === 0 && renderShowSubmitBtn();
}

//===== event type ===== //
function addEventToCartBtn() {
  productList.addEventListener("click", e => {
    if(e.target.getAttribute('class') && e.target.getAttribute('class').includes("addCartBtn")) {
      productEditListener("addCartItem", {
        "productId": e.target.dataset.id,
        "quantity": cart.getCartQuantity(1, e.target.dataset.id)
      });
    }
  });
}

// continuous filter input value
function addEventToInputContinuous(e, oldValue, inputFilter) {
  ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function(event) {
    e.target.addEventListener(event, function(inputEvent) {
      if (inputFilter(this.value)) {
        this.oldValue = this.value;
        this.oldSelectionStart = this.selectionStart;
        this.oldSelectionEnd = this.selectionEnd;
      } else if (this.hasOwnProperty("oldValue")) {
        this.value = this.oldValue;
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
      } else {
        this.value = "";
      }
      if (inputEvent.keyCode == 13) {
        checkEditCartQuantity(inputEvent, oldValue, inputEvent.target.value)
      }
    });
  });
}


function addEventToInput(event) { 
  let oldValue = event.target.value;
  event.target.addEventListener('change', 
    addEventToInputContinuous(event, oldValue, function(value) {
      let validation = /^\d*$/.test(value) && (/^[1-9]\d*$/.test(value)) && (value === "" || parseInt(value) > 0);
      return validation;
    })
  );
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
      'quantity-sub': e.target.getAttribute('class').includes('quantity-sub') && checkEditCartQuantityRequest(e, cart.processEditCartQuantity(e, -1)),
      'cart-quantity': e.target.getAttribute('class').includes('cart-quantity') && addEventToInput(e),
      'quantity-add': e.target.getAttribute('class').includes('quantity-add') && checkEditCartQuantityRequest(e, cart.processEditCartQuantity(e, 1)),
    };
    cartEditListener[e.target.getAttribute('class')];
  });
}

function addEventToForm() { 
  customerName.addEventListener("change", function(e){ changeInvisibleError(e) });
  customerPhone.addEventListener("change", function(e){ changeInvisibleError(e) });
  customerEmail.addEventListener("change", function(e){ changeInvisibleError(e) });
  customerAddress.addEventListener("change", function(e){ changeInvisibleError(e) });
  creatOrderBtn.addEventListener("click", function(e) { checkFormValidation(e) });
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

function renderShowSubmitBtn() {
  submitBtn.removeAttribute('disabled');
}

function renderShowValidationError(customerDom) {
  customerDom.classList.remove('invisible');
  validator.setValidationFalseNum(1);
}

function renderHideValidationError(customerDom) {
  customerDom.classList.add('invisible');
  validator.setValidationFalseNum(-1);
}

function renderLoader(e) {
  e.target.parentNode.classList.add('loader');
}

//===== main ===== //
async function main() {
  // product
  await getProductList();
  renderProduct(cart.getProductsData());
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

main();
