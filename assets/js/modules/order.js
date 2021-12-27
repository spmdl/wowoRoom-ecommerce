// data storage and process.

export default class Order {
  constructor() {
    this._orderData = [];
    this._sortType = 'desc';
  }
  getOrderSort(data) {
    const orderSort = {
      'desc': data.sort((a, b) => { return b.createdAt - a.createdAt })
    };
    return orderSort[this._sortType];
  }

  getOrderFilter(filterType, nowTime=new Date()) {
    const orderFilter = {
      "all": this._orderData,
      "false": this._orderData.filter(item => item.paid === false),
      "true": this._orderData.filter(item => item.paid === true),
      "lastMonth": this._orderData.filter(item => {
        const oldTime = new Date(item.createdAt * 1000);
        return parseInt(Math.abs((nowTime - oldTime) / (1000 * 60 * 60 * 24))) <= 30;
      }),
    };
    return orderFilter[filterType.toString()];
  }
  
  getOrderData() {
    return this._orderData;
  }

  getOrderStatus(index) {
    const id = this._orderData[index].id;
    const status = !this._orderData[index].paid
    return { id, status};
  }
  
  setOrderData(data) {
    this._orderData = data;
  }

  _processTime() {
    const time = new Date(item.createdAt * 1000);
  }

  processOrderData(item, index) {
    const time = new Date(item.createdAt * 1000);
    return [
      item.id, 
      index, 
      item.user.name, 
      item.user.tel, 
      item.user.address, 
      item.user.email, 
      item.products,
      time.toLocaleDateString(), 
      time.toLocaleTimeString(), 
      item.paid
    ];
  }
}