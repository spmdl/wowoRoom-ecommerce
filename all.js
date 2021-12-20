// token data
const api_path = "kent";
const token = "tuOllAmACSQgpHpqMpD8LCKgzIH3";
const productSelect = document.querySelector(".productSelect");
let searchNum = document.querySelector(".searchNum");
const cartList = document.querySelector(".shoppingCart-table");
const productList = document.querySelector(".productWrap");
const creatOrderBtn = document.querySelector(".orderInfo-btn");
const emptyCart = document.getElementById("empty-cart");
let productsData = [];
let cartsData = [];

// 取得產品列表
function getProductList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/products`).
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
function getCartList() {
  axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      renderCart(response.data);
    })
}

// 加入購物車
function addCartItem(productId) {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, {
    "data": {
      "productId": productId,
      "quantity": getProductQuantity(productId)
    }
  }).
    then(function (response) {
      renderCart(response.data);
    })
}

// 刪除購物車內特定產品
function deleteCartItem(cartId) {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts/${cartId}`).
    then(function (response) {
      renderCart(response.data);
    })
}

// 清除購物車內全部產品
function deleteAllCartList() {
  axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`).
    then(function (response) {
      renderCart(response.data);
    })
}

// 編輯購物車
function editCartItem(cartId, quantity) {
  axios.patch(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/carts`, 
    {
      "data": {
        "id": cartId,
        "quantity": quantity
      }
    },
    {
      headers: {
        'Authorization': token
      }
    })
    .then(function (response) {
      console.log(response.data);
      // renderCart(response.data);
    })
}

// 送出購買訂單
function createOrder(name="五角", tel="07-5313506", email="hexschool@hexschool.com", address="高雄市六角學院路", payment="Apple Pay") {
  axios.post(`https://livejs-api.hexschool.io/api/livejs/v1/customer/${api_path}/orders`,
    {
      "data": {
        "user": {
          "name": name,
          "tel": tel,
          "email": email,
          "address": address,
          "payment": payment
        }
      }
    }
  ).
    then(function (response) {
      console.log(response.data);
      getCartList();
      clearForm(orderForm);
    })
    .catch(function(error){
      console.log(error);
    })
}

// addEventListener
function addEventToCartBtn() {
  productList.addEventListener("click", e => {
    if(e.target.getAttribute('class').includes("addCartBtn")) {
      addCartItem(e.target.dataset.id);
    }
  });
}

function addEventToCartEdit() { 
  cartList.addEventListener("click", e => {
    console.log(e.target);
    // delete cart item
    if (e.target.textContent === 'clear' && e.target.dataset.id) {
      deleteCartItem(e.target.dataset.id);
    } else if(e.target.getAttribute('class').includes("discardAllBtn")) {
      deleteAllCartList();
    }
  });
}

function addEventToEditQuantity() {
  const delCardBtn = document.querySelectorAll(".discardBtn");
  const editQuantityBtn = document.querySelectorAll(".cart-quantity");
  const cartPriceAmount = document.querySelectorAll(".cart-price-amount");

  for(let i=0; i<editQuantityBtn.length; i++) {
    editQuantityBtn[i].addEventListener("change", function() {
      if(!editQuantityBtn[i].getAttribute('class').includes("cart-quantity")) return;
      let value = Number(editQuantityBtn[i].value);
      // remove focus
      editQuantityBtn[i].blur();
      console.log(value);
      if (!value) {
        deleteCartItem(delCardBtn[i].firstChild.dataset.id);
      } else {
        editCartItem(delCardBtn[i].firstChild.dataset.id, value);
        changeCartPriceAmount(delCardBtn[i].firstChild.dataset.id, cartPriceAmount[i], cartPriceAmount[i].dataset.price, value);
      }
    });
  }
}

function addEventToSubQuantity() {
  const delCardBtn = document.querySelectorAll(".discardBtn");
  const editQuantityBtn = document.querySelectorAll(".cart-quantity");
  const subQuantityBtn = document.querySelectorAll(".quantity-sub");
  const cartPriceAmount = document.querySelectorAll(".cart-price-amount");

  for(let i=0; i<subQuantityBtn.length; i++) {
    subQuantityBtn[i].addEventListener("click", function() {
      if(!subQuantityBtn[i].getAttribute('class').includes("quantity-sub")) return;
      let value = Number(editQuantityBtn[i].value) - 1;
      if (editQuantityBtn[i].value == 1) {
        deleteCartItem(delCardBtn[i].firstChild.dataset.id);
      } else {
        editCartItem(delCardBtn[i].firstChild.dataset.id, value);
        editQuantityBtn[i].value = value;
        changeCartPriceAmount(delCardBtn[i].firstChild.dataset.id, cartPriceAmount[i], cartPriceAmount[i].dataset.price, value);
      }
    });
  }
}
function addEventToAddQuantity() {
  const delCardBtn = document.querySelectorAll(".discardBtn");
  const editQuantityBtn = document.querySelectorAll(".cart-quantity");
  const addQuantityBtn = document.querySelectorAll(".quantity-add");
  const cartPriceAmount = document.querySelectorAll(".cart-price-amount");

  for(let i=0; i<addQuantityBtn.length; i++) {
    addQuantityBtn[i].addEventListener("click", function() {
      if(!addQuantityBtn[i].getAttribute('class').includes("quantity-add")) return;
      let value = Number(editQuantityBtn[i].value) + 1;
      editCartItem(delCardBtn[i].firstChild.dataset.id, value);
      editQuantityBtn[i].value = value;
      changeCartPriceAmount(delCardBtn[i].firstChild.dataset.id, cartPriceAmount[i], cartPriceAmount[i].dataset.price, value);
    });
  }
}

// 取得數量
function getProductQuantity(cartId) {
  let retQuantity = 1;
    try {
      cartsData.carts.forEach(item => {
        if(item.product.id === cartId){
          console.log(retQuantity);
          retQuantity = item.quantity + 1;
          console.log(retQuantity);
          throw {};
        }
      });
    } catch (e) {
      console.log(e);
    }
  return retQuantity;
}

function changeCategorySelect(e) {
  let value = e.target.value;
  let filterData = [];
  if (value === "全部") {
    filterData = productsData;
  } else {
    filterData = productsData.filter((item) => item.category === value);
  }
  searchNum.textContent = `${filterData.length}`;
  productSelect.value = value;
  renderProduct(filterData);
}

// FIXME: addCart

function changeTotalPrice(oldNum, newNum, price) {
  const totalPrice = document.querySelector(".total-price");
  cartsData.finalTotal += (newNum - oldNum) * price;
  totalPrice.textContent = cartsData.finalTotal.toLocaleString();
}

function changeCartPriceAmount(cartId, item, price, num) {
  var indexCartsData = cartsData.carts.findIndex( element => element.id === cartId);
  changeTotalPrice(cartsData.carts[indexCartsData].quantity, num, price);
  cartsData.carts[indexCartsData].quantity = num;
  item.textContent = (price * num).toLocaleString();
}

function renderCategorySelect(categories) {
  let productSelectStr = `<option value="全部" selected>全部</option>`;
  categories.forEach((item) => {
    productSelectStr += `
      <option value="${item}">${item}</option>
    `;
  });
  productSelect.innerHTML = productSelectStr;
  // select change
  productSelect.addEventListener("change", changeCategorySelect);
}

function generateProduct(id, imgUrl, title, originPrice, price) {
  return `
    <li class="productCard">
      <h4 class="productType">新品</h4>
      <img src="${imgUrl}" alt="">
      <a href="javascript:void(0);" class="addCartBtn" data-id=${id}>加入購物車</a>
      <h3>${title}</h3>
      <del class="originPrice">${originPrice.toLocaleString()}</del>
      <p class="nowPrice">${price.toLocaleString()}</p>
    </li>
  `;
}

function renderProduct(data) {
  let productStr = "";
  let categories = [];
  data.forEach( item => {
    if (!categories.includes(item.category)) {
      categories.push(item.category);
    }
    productStr += generateProduct(item.id, item.images, item.title, item.origin_price, item.price);
  });
  searchNum.textContent = `${data.length}`;
  productList.innerHTML = productStr;
  addEventToCartBtn();
  
  return categories;
}

// TODO: cart edit
function generateCart(id, category, imgUrl, title, price, quantity, totalPrice) {
  return `
    <tr>
        <td>
            <div class="cardItem-title">
                <img src="${imgUrl}" alt="${category} image">
                <p>${title}</p>
            </div>
        </td>
        <td>${price.toLocaleString()}</td>
        <td class="">
          <div class="cart-quantity-edit">
            <button class="material-icons quantity-sub">remove</button>
            <input type="text" class="cart-quantity" placeholder="00" aria-label="01" value="${quantity}">
            <button class="material-icons quantity-add">add</button>
          </div>
        </td>
        <td class="cart-price-amount" data-price=${price}>${totalPrice.toLocaleString()}</td>
        <td class="discardBtn"><a href="javascript:void(0);" class="material-icons" data-id=${id}>clear</a></td>
    </tr>
  `;
}

function renderCart(data) {
  let cartStr = "";
  let totalPrice = 0;
  cartsData = data;
  if (data.carts.length) {
    data.carts.forEach( item => {
      let amountPrice = item.quantity * item.product.price;
      totalPrice += amountPrice;
      cartStr += generateCart(item.id, item.category, item.product.images, item.product.title, item.product.price, item.quantity, amountPrice);
    });
    cartList.innerHTML = `
      <tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
      </tr>
      ${cartStr}
      <tr>
          <td>
              <a href="javascript:void(0);" class="discardAllBtn">刪除所有品項</a>
          </td>
          <td></td>
          <td></td>
          <td>
              <p>總金額</p>
          </td>
          <td class="total-price">${totalPrice.toLocaleString()}</td>
      </tr>
    ` ;
    addEventToCartEdit();
    addEventToSubQuantity();
    addEventToEditQuantity();
    addEventToAddQuantity();
  } else {
    cartList.innerHTML = `
      <div class="empty-cart" id="empty-cart">
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
  getCartList();
}

init();