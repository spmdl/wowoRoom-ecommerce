// data storage and process.

export default class Order {
  constructor() {
    this._originOrderData = [];
    this._renderOrderData = [];
  }

  getOriginData() {
    return this._originOrderData;
  }

  getOrderStatus(index) {
    const id = this._renderOrderData[index].id;
    const status = !this._renderOrderData[index].paid
    return { id, status};
  }
  
  _setRenderData(data) {
    this._renderOrderData = data;
  }

  setOriginData(data) {
    this._originOrderData = data;
  }

  setProductData(item, index) {
    const time = this._unixToMillisecond(item.createdAt);
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

  _processOrderSort(data, sortType) {
    switch (sortType) {
      case "desc":
        return data.sort((a, b) => { return b.createdAt - a.createdAt });
      case "asc":
        return data.sort((a, b) => { return a.createdAt - b.createdAt });
      case "descTotal":
        return data.sort((a, b) => { return b.total - a.total });
      case "ascTotal":
        return data.sort((a, b) => { return a.total - b.total });
    };
  }

  _processOrderFilter(data, filterType) {
    const nowTime = new Date()
    const orderFilter = {
      "all": data,
      "false": data.filter(item => item.paid === false),
      "true": data.filter(item => item.paid === true),
      "lastMonth": data.filter(item => {
        const oldTime = this._unixToMillisecond(item.createdAt);
        return this._diffDays(nowTime, oldTime, 30);
      }),
    };
    return orderFilter[filterType.toString()];
  }
  
  processOrderData(data, filterType, sortType) {
    let retData = [...data];
    let filterData = this._processOrderFilter(retData, filterType);
    retData = this._processOrderSort(filterData, sortType);
    this._setRenderData(retData);
    return retData;
  }

  _unixToMillisecond(itemTime) {
    return new Date(itemTime * 1000);
  }

  _diffDays(nowTime, oldTime, difference) {
    return parseInt(Math.abs((nowTime - oldTime) / (1000 * 60 * 60 * 24))) <= difference;
  }
}