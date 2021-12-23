let colors = ["#DACBFF", "#9D7FEA", "#5434A7", "#301E5F"];
export let chart = c3.generate({
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
    pattern: colors
  },
});

export function unload() {
  chart.unload();
}

export function destroy() {
  chart.destroy();
}

export function reload(columns) {
  chart.load({
    columns: processColumnData(columns),
  });
}

function setColumnOtherData(columns) {
  let retArr = columns.slice(2, -1);
  let retPrice = retArr.reduce((retPrice, item) => retPrice + item[1], 0);
  return [["其他", retPrice]];
}

function processColumnData(columns) {
  // set descending
  let columnArr = Object.entries(columns);
  let columnsDesc = columnArr.sort((a, b) => { return b[1] - a[1] });
  // set other
  let retArr = columnsDesc.length > 3 ? columnsDesc.slice(0, 3).concat(setColumnOtherData(columnsDesc)) : columnsDesc.slice(0, 3)
  return retArr;
}
