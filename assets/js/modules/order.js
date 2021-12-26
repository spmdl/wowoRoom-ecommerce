export default class Order {
  constructor() {
    this.cartsData = [];
    this.chartColumns = {};
    this.sortType = 'desc';
  }
  getOrderSort(data) {
    const orderSort = {
      'desc': data.sort((a, b) => { return b.createdAt - a.createdAt })
    }
    return orderSort[this.sortType];
  }
  
  getOrderStatus(index) {
    return [this.cartsData[index].id, !this.cartsData[index].paid];
  }
  
  setCartsData(data) {
    this.cartsData = data;
  }

  setChartColumns(item) {
    if (this.chartColumns[item.products[0].title]) {
      this.chartColumns[item.products[0].title] = this.chartColumns[item.products[0].title] + item.products[0].quantity * item.products[0].price
    } else {
      this.chartColumns[item.products[0].title] = item.products[0].quantity * item.products[0].price
    }
  }

  processOrderData(item, index) {
    const time = new Date(item.createdAt * 1000);
    this.setChartColumns(item);
    return [
      item.id, 
      index, 
      item.user.name, 
      item.user.tel, 
      item.user.address, 
      item.user.email, 
      item.products[0].title, 
      time.toLocaleDateString(), 
      time.toLocaleTimeString(), 
      item.paid
    ];
  }
}