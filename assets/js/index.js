//===== Module ===== //
import { getCustomerRequest } from './api/dataService.js';
import Cart from './modules/cart.js';
import * as generateTemp from './template/cartTemplate.js';

const productSelect = document.querySelector(".productSelect");
let searchNum = document.querySelector(".searchNum");
const cartList = document.querySelector(".shoppingCart-table");
const productList = document.querySelector(".productWrap");
const creatOrderBtn = document.querySelector(".orderInfo-btn");
let cart = new Cart();

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
    renderCategorySelect(cart.getCategories());
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
    clearForm(orderForm);
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
      console.log(e.target.dataset.id, cart.getProductQuantity(e.target.dataset.id, 1));
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

// 監聽 form 每個欄位
let validationFalseNum = 4;
const orderForm = document.forms['orderForm'];
const submitBtn = document.getElementById("submitBtn");
const customerName = document.getElementById("customerName");
const customerPhone = document.getElementById("customerPhone");
const customerEmail = document.getElementById("customerEmail");
const customerAddress = document.getElementById("customerAddress");

customerName.addEventListener("change", invisibleError);
customerPhone.addEventListener("change", invisibleError);
customerEmail.addEventListener("change", invisibleError);
customerAddress.addEventListener("change", invisibleError);

// 驗證判斷式
function customerDataValidation(customerName, customerData) {
  const phoneReg = /^(\d{2,3}-?|\(\d{2,3}\))\d{3,4}-?\d{4}|09\d{2}(\d{6}|-\d{3}-\d{3})$/;
  // const emailReg = /^([^.][a-z].?[a-z.]+)@(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,})$/;
  const emailReg = /^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z]+$/;
  const validation = {
      'customerName': customerData === "" ? false : true ,
      'customerPhone': !phoneReg.test(customerData) ? false : true ,
      'customerEmail': !emailReg.test(customerData) ? false : true,
      'customerAddress': customerData === "" ? false : true ,
  }
  return validation[customerName];
}

// 切換錯誤提示
function invisibleError(e) {
  const customerDom = document.getElementById(`${e.target.id}-message`);
  const retValidation = customerDataValidation(e.target.id, e.target.value);
  const retInvisible = customerDom.getAttribute("class").includes('invisible');
  if (retValidation && !retInvisible) {
    // 驗證有過、現在有錯誤提示
    customerDom.classList.add('invisible');
    validationFalseNum -= 1;
  } else if (!retValidation && retInvisible) {
    // 驗證沒過、現在沒有錯誤提示
    customerDom.classList.remove('invisible');
    validationFalseNum += 1;
  }
  if (validationFalseNum === 0) {
    submitBtn.removeAttribute('disabled');
  }
}

creatOrderBtn.addEventListener("click", function(e) {
  e.preventDefault();
  let orderData = new processFormData(orderForm);
  if (validationFalseNum === 0) {
    createOrder(orderData.name, orderData.tel, orderData.email, orderData.address, orderData.payment);
  }
});

class processFormData {
  constructor(form) {
    this.name = form.elements.姓名.value;
    this.tel = form.elements.電話.value;
    this.email = form.elements.Email.value;
    this.address = form.elements.寄送地址.value;
    this.payment = form.elements.交易方式.value;
  }
}

function clearForm(formData) {
  formData.reset();
  validationFalseNum = 4;
  //  把驗證提示訊息重新顯示
  document.getElementById("customerName-message").classList.remove('invisible');
  document.getElementById("customerPhone-message").classList.remove('invisible');
  document.getElementById("customerEmail-message").classList.remove('invisible');
  document.getElementById("customerAddress-message").classList.remove('invisible');
  submitBtn.setAttribute("disabled", "");
}

function init() {
  getProductList();
  addEventToCartBtn();
  addEventToProductSelect();
  productEditListener("getCartList");
  addEventToCartEdit();
}

init();