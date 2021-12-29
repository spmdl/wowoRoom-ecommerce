export function generateOrderProductsTitle(title, quantity) {
  return `<li>${title}x${quantity}</li>`;
}

export function orderEmpty() {
  return `
    <div class="empty-cart">
      <p> 加油別氣餒，再加把勁就有訂單了 ༼•̃͡ ɷ•̃͡༽ </p>
    </div>
  `;
}

export function orderThead() {
  return `
    <thead>
      <tr>
          <th>訂單編號</th>
          <th>聯絡人</th>
          <th>聯絡電話</th>
          <th>聯絡地址</th>
          <th>電子郵件</th>
          <th>訂單品項</th>
          <th>訂單日期</th>
          <th>訂單狀態</th>
          <th>操作</th>
      </tr>
    </thead>
  `;
}

export function orderItem(id, index, userName, userTel, userAddress, userEmail, productDate, productTime, paid, productsTitle) {
  return `
    <tr>
      <td>${id}</td>
      <td>${userName}</td>
      <td>${userTel}</td>
      <td>${userAddress}</td>
      <td>${userEmail}</td>
      <td>
        <ul>${productsTitle}</ul>
      </td>
      <td>
        <p>${productDate}</p>
        <p>${productTime}</p>
      </td>
      <td class="orderStatus">
        <a href="javascript:void(0);" data-index=${index} class="${paid ? 'orderStatus-done' : 'orderStatus-not'}">${paid ? "已處理" : "未處理"}</a>
      </td>
      <td>
        <div class="group">
          <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${id}>
          <!--<input type="button" class="delSingleOrder-Btn" value="編">-->
        </div>
      </td>
    </tr>
  `;
}