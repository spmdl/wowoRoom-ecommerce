// encapsulation: data process for the column Data
// encapsulation: c3 property function
export default function Chart() {
  this._colors = ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"];
  this._chartColumns = {};
  this.chart =  c3.generate({
    bindto: '#chart',
    data: {
      type: "pie",
      columns: [],
      empty: {
        label: {
          text: "loading..."
        }
      },
    },
    color: {
      pattern: this._colors
    },
  });
};

Chart.prototype.unload = function () {
  this.chart.unload();
};

Chart.prototype.destroy = function () {
  this.chart.destroy();
};

Chart.prototype.reload = function () {
  console.log(this._chartColumns);
  this.chart.load({
    unload: true,
    columns: this._processColumnData(this._chartColumns),
  });
};

Chart.prototype.setColumnsInit = function () {
  this._chartColumns = {};
}
Chart.prototype.setColumns = function (item) {
  if (this._chartColumns[item.title]) {
    this._chartColumns[item.title] = this._chartColumns[item.title] + item.quantity * item.price;
  } else {
    this._chartColumns[item.title] = item.quantity * item.price;
  }
};

Chart.prototype._setColumnOtherData = function (columns) {
  // step1: segment array from three to last data
  let retArr = columns.slice(2, -1);
  // step2: amount of other price
  let retPrice = retArr.reduce((retPrice, item) => retPrice + item[1], 0);
  return [["其他", retPrice]];
};

Chart.prototype._processColumnData = function (columns) {
  // other data consists of except top three data
  let columnArr = Object.entries(columns);
  // step1: descending data
  let columnsDesc = columnArr.sort((a, b) => { return b[1] - a[1] });
  // step2: segment data
  let retArr = columnsDesc.length > 3 ? columnsDesc.slice(0, 3).concat(this._setColumnOtherData(columnsDesc)) : columnsDesc.slice(0, 3)
  return retArr;
};