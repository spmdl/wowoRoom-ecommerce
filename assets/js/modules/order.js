// data storage and process.

export default class Order {
  constructor() {
    this.orderData = [];
    this.chartColumns = {};
    this.sortType = 'desc';
  }
  getOrderSort(data) {
    const orderSort = {
      'desc': data.sort((a, b) => { return b.createdAt - a.createdAt })
    }
    return orderSort[this.sortType];
  }
  
  getOrderData() {
    return this.orderData;
  }

  getOrderStatus(index) {
    const id = this.orderData[index].id;
    const status = !this.orderData[index].paid
    return { id, status};
  }

  getChartColumns() {
    return this.chartColumns;
  }
  
  setOrderData(data) {
    this.orderData = data;
  }

  _setChartColumns(items) {
    items.forEach( item => {
      if (this.chartColumns[item.title]) {
        this.chartColumns[item.title] = this.chartColumns[item.title] + item.quantity * item.price;
      } else {
        this.chartColumns[item.title] = item.quantity * item.price;
      }
    });
  }

  processOrderData(item, index) {
    const time = new Date(item.createdAt * 1000);
    this._setChartColumns(item.products);
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