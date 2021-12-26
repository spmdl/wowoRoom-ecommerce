function generateOrderProductsTitle(items) {
  let retTempStr = ``;
  items.forEach( item => retTempStr += `<li>${item.title}x${item.quantity}</li>`);
  return retTempStr;
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

export function orderItem(id, index, userName, userTel, userAddress, userEmail, products, productDate, productTime, paid) {
  return `
    <tr>
      <td>${id}</td>
      <td>${userName}</td>
      <td>${userTel}</td>
      <td>${userAddress}</td>
      <td>${userEmail}</td>
      <td>
        <ul>${generateOrderProductsTitle(products)}</ul>
      </td>
      <td>
        <p>${productDate}</p>
        <p>${productTime}</p>
      </td>
      <td class="orderStatus">
        <a href="javascript:void(0);" data-index=${index} class="${paid ? 'orderStatus-done' : 'orderStatus-not'}">${paid ? "已處理" : "未處理"}</a>
      </td>
      <td>
        <input type="button" class="delSingleOrder-Btn" value="刪除" data-id=${id}>
      </td>
    </tr>
  `;
}