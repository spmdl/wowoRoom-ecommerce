// Just do two tasks
// 1. data storage.
// 2. data processing.

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

  _processFilterAndSearch(item, orderSearch) {
    if (orderSearch) {
      return item.user.name.toLowerCase() === orderSearch.toLowerCase() || item.user.tel === orderSearch;
    } else {
      return true;
    }
  }

  _processOrderFilter(data, filterType, orderSearch) {
    const nowTime = new Date()
    const orderFilter = {
      "all": filterType == "all" && data.filter(item => this._processFilterAndSearch(item, orderSearch)),
      "false": filterType == "false" && data.filter(item => item.paid === false && this._processFilterAndSearch(item, orderSearch)),
      "true": filterType == "true" && data.filter(item => item.paid === true && this._processFilterAndSearch(item, orderSearch)),
      "lastOneDay": filterType == "lastOneDay" && data.filter(item => {
        const oldTime = this._unixToMillisecond(item.createdAt);
        let ret = this._diffDays(nowTime, oldTime, 1.5) && this._processFilterAndSearch(item, orderSearch);
        return ret;
      }),
      "lastTwoDay": filterType == "lastTwoDay" && data.filter(item => {
        const oldTime = this._unixToMillisecond(item.createdAt);
        return this._diffDays(nowTime, oldTime, 2.5) && this._processFilterAndSearch(item, orderSearch);
      }),
      "lastWeek": filterType == "lastWeek" && data.filter(item => {
        const oldTime = this._unixToMillisecond(item.createdAt);
        return this._diffDays(nowTime, oldTime, 7.5) && this._processFilterAndSearch(item, orderSearch);
      }),
      "lastMonth": filterType == "lastMonth" && data.filter(item => {
        const oldTime = this._unixToMillisecond(item.createdAt);
        return this._diffDays(nowTime, oldTime, 30.5) && this._processFilterAndSearch(item, orderSearch);
      }),
    };
    return orderFilter[filterType];
  }
  
  processOrderData(data, filterType, sortType, orderSearch) {
    let retData = [...data];
    let filterData = this._processOrderFilter(retData, filterType, orderSearch && orderSearch.replace(/\s+|\s+$/g, ''));
    retData = this._processOrderSort(filterData, sortType);
    this._setRenderData(retData);
    return retData;
  }

  processOrderSearch(value) {
    return this._renderOrderData.filter(item => (item.user.name.toLowerCase() === value.toLowerCase()) || item.user.tel === value );
  }

  _unixToMillisecond(itemTime) {
    return new Date(itemTime * 1000);
  }

  _diffDays(nowTime, oldTime, difference) {
    return Math.abs((nowTime - oldTime) / (1000 * 60 * 60 * 24)) <= difference;
  }
}