//===== Module ===== //
import { getCustomerRequest } from './api/dataService.js';
import Cart from './modules/cart.js';

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
    console.log(resData);
    renderCart(resData.data);
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

function renderCategorySelect(categories) {
  let productSelectStr = `<option value="全部" selected>全部</option>`;
  categories.forEach((item) => {
    productSelectStr += `
      <option value="${item}">${item}</option>
    `;
  });
  productSelect.innerHTML = productSelectStr;
}

function generateProduct(id, imgUrl, title, originPrice, price) {
  return `
    <li class="productCard">
      <h4 class="productType">新品</h4>
      <img src="${imgUrl}" alt="">
      <a href="javascript:void(0);" class="addCartBtn" data-id=${id}>加入購物車</a>
      <h3>${title}</h3>
      <del class="originPrice">NT$${originPrice.toLocaleString()}</del>
      <p class="nowPrice">NT$${price.toLocaleString()}</p>
    </li>
  `;
}

function renderProduct(data) {
  let productStr = "";
  data.forEach( item => {
    cart.setCategories(item.category);
    productStr += generateProduct(item.id, item.images, item.title, item.origin_price, item.price);
  });
  searchNum.textContent = `${data.length}`;
  productList.innerHTML = productStr;
}

// TODO: cart edit
function generateCart(id, index, category, imgUrl, title, price, quantity, totalPrice) {
  return `
    <tr>
        <td>
            <div class="cardItem-title">
                <img src="${imgUrl}" alt="${category} image">
                <p>${title}</p>
            </div>
        </td>
        <td>NT$${price.toLocaleString()}</td>
        <td data-index=${index} style="font-size: 0;">
          <button class="material-icons quantity-sub">remove</button>
          <input type="text" class="cart-quantity" placeholder="00" aria-label="01" value="${quantity}">
          <button class="material-icons quantity-add">add</button>
        </td>
        <td>NT$${totalPrice.toLocaleString()}</td>
        <td style="text-align: right;"><a href="javascript:void(0);" class="material-icons discardBtn" data-id=${id}>clear</a></td>
    </tr>
  `;
}

function renderCart(data) {
  let cartStr = "";
  let totalPrice = 0;
  cart.setCartsData(data);
  if (data.carts.length) {
    data.carts.forEach( (item, index) => {
      let amountPrice = item.quantity * item.product.price;
      totalPrice += amountPrice;
      cartStr += generateCart(item.id, index, item.category, item.product.images, item.product.title, item.product.price, item.quantity, amountPrice);
    });
    cartList.innerHTML = `
      <thead>
        <tr>
          <th width="40%">品項</th>
          <th width="15%">單價</th>
          <th width="15%">數量</th>
          <th width="15%">金額</th>
          <th width="15%"></th>
        </tr>
      </thead>
      ${cartStr}
      <tfoot>
        <tr>
            <td>
                <a href="javascript:void(0);" class="discardAllBtn">刪除所有品項</a>
            </td>
            <td></td>
            <td></td>
            <td>
                <p>總金額</p>
            </td>
            <td class="total-price">NT$${totalPrice.toLocaleString()}</td>
        </tr>
      </tfoot>
    ` ;
  } else {
    cartList.innerHTML = `
      <div class="empty-cart">
        <p> 親(≧▽≦) 新品剛上市有折扣，快加入購物車吧 ٩(๑❛ᴗ❛๑)۶</p>
      </div>
    ` ;
  }
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
  // 防止跳到頁面最上方
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