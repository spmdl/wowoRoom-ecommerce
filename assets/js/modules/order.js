export default class Order {
  constructor() {
    this.cartsData = [];
    this.chartColumns = {};
  }
  getOrderSort(sortType, data) {
    const orderSort = {
      'desc': data.sort((a, b) => { return b.createdAt - a.createdAt })
    }
    return orderSort[sortType];
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
}