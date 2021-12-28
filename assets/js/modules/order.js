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
      time.toLocaleDateString(), 
      time.toLocaleTimeString(), 
      item.paid
    ];
  }

  _dateDescSort(data) {
    return data.sort((a, b) => { return b.createdAt - a.createdAt });
  }
  _dateAscSort(data) {
    return data.sort((a, b) => { return a.createdAt - b.createdAt });
  }
  _totalDescSort(data) {
    return data.sort((a, b) => { return b.total - a.total });
  }
  _totalAscSort(data) {
    return data.sort((a, b) => { return a.total - b.total });
  }

  _processOrderSort(data, sortType) {
    switch (sortType) {
      case "descDate":
        return this._dateDescSort(data);
      case "ascDate":
        return this._dateAscSort(data);
      case "descTotal":
        return this._totalDescSort(data);
      case "ascTotal":
        return this._totalAscSort(data);
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
    return orderFilter[filterType];
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