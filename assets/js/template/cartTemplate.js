export function selectProductsCategories(title) {
  return `<option value="${title}">${title}</option>`;
}

export function tableCartEmpty() {
  return `
    <div class="empty-cart">
      <p> 親(≧▽≦) 新品剛上市有折扣，快加入購物車吧 ٩(๑❛ᴗ❛๑)۶</p>
    </div>
  `;
}

export function ulProducts(id, imgUrl, title, originPrice, price) {
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

export function theadCarts() {
  return `
    <thead>
      <tr>
        <th width="40%">品項</th>
        <th width="15%">單價</th>
        <th width="15%">數量</th>
        <th width="15%">金額</th>
        <th width="15%"></th>
      </tr>
    </thead>
  `;
}

export function tbodyCarts(totalPrice, id, index, category, imgUrl, title, price, quantity) {
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
          <input type="number" class="cart-quantity" placeholder="${quantity}" aria-label="01" value="${quantity}">
          <button class="material-icons quantity-add">add</button>
        </td>
        <td>NT$${totalPrice.toLocaleString()}</td>
        <td style="text-align: right;"><a href="javascript:void(0);" class="material-icons discardBtn" data-id=${id}>clear</a></td>
    </tr>
  `;
}

export function tfootCarts(totalPrice) {
  return `
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
}