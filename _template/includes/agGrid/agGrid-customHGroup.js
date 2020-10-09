// DONE: https://www.ag-grid.com/javascript-grid-cell-editing/#losingFocusStopsEditing
// TODO: https://www.ag-grid.com/javascript-grid-header-rendering/#example-header-group-cells
// TODO: https://www.ag-grid.com/javascript-grid-width-and-height/#inside-css-grid-container


// TODO: customHeaderGroupComponent disables the marvelous agGroupCellRenderer + autoGroupColumnDef trick

// https://www.ag-grid.com/javascript-grid-server-side-model-grouping/
// adding fake server-side Row Grouping: gridOptions.api.setServerSideDatasource(datasource); 
// specify the groupBy column + checkbox under that first column: deviceGroup - even tho we will show copierIP once expanded
var autoGroupColumnDef = {
  // headerName: "deviceGroup",
  // field: "deviceGroup",
  headerName: "Model",
  field: "model",
  width: 200,
  cellRenderer:'agGroupCellRenderer',
  cellRendererParams: {
    checkbox: true                     // different way to have grouped rows main selector == checkboxSelection: isFirstColumn
  }
}

// specify the columns: deviceGroup;copierIP;copierName;Cs;Gp;Ir;Lo;Pa;Ss;nativeUser;nativePassword;nqUser;nqPassword;copierSerial
// specify the groupBy column: rowGroup
var columnDefs = [
  { headerName: "Group",
    headerGroupComponent: 'customHeaderGroupComponent',
    children: [
      autoGroupColumnDef,
      {headerName: "Make",            field: "make",  columnGroupShow: 'open', suppressMenu: false, },
      {headerName: "Price",           field: "price", columnGroupShow: 'open', suppressMenu: false,   },
      // { headerName: "copierIP",       field: "copierIP",       suppressMenu: false, rowGroup: true, },
      // { headerName: "copierName",     field: "copierName", columnGroupShow: 'open', suppressMenu: false,      },
    ],
  },
  { headerName: "MEAPS /user / password",
    headerGroupComponent: 'customHeaderGroupComponent',
    children: [
    { headerName: "Cs",             field: "Cs",              width: 20,  cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
    { headerName: "Gp",             field: "Gp",              width: 20,  cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
    { headerName: "Ir",             field: "Ir",              width: 20,  cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
    { headerName: "Lo",             field: "Lo",              width: 20,  cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
    { headerName: "Pa",             field: "Pa",              width: 20,  cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
    { headerName: "Ss",             field: "Ss",              width: 20,  cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
    { headerName: "nativeUser",     field: "nativeUser",      width: 100, columnGroupShow: 'open', },
    { headerName: "nativePassword", field: "nativePassword",  width: 100, columnGroupShow: 'open', },
    { headerName: "nqUser",         field: "nqUser",          width: 100, columnGroupShow: 'open', },
    { headerName: "nqPassword",     field: "nqPassword",      width: 100, columnGroupShow: 'open', },
    { headerName: "copierSerial",   field: "copierSerial",    width: 100, columnGroupShow: 'open', },
    ],
  },
];

var defaultColDef = {
  // flex requires minWidth or maxWidth and disabled single column width
  // flex: 1,
  // minWidth: 100,
  width: 200,
  editable: true,
  resizable: true,
  sortable: true,
  filter: true,
  suppressMenu: true,
  headerCheckboxSelection: isFirstColumn,
  // checkboxSelection: isFirstColumn,      // different way to have grouped rows main selector == agGroupCellRenderer
}

// let the grid know which columns and what data to use
var gridOptions = {
  components: {
    customHeaderGroupComponent: CustomHeaderGroup,
    checkboxRenderer: CheckboxRenderer,
  },
  columnDefs: columnDefs,
  rowData: null,
  defaultColDef: defaultColDef,
  autoGroupColumnDef: autoGroupColumnDef,
  groupSelectsChildren: true,
  rowSelection: 'multiple',
  enableRangeSelection: true,
  suppressMultiRangeSelection: true,
  stopEditingWhenGridLosesFocus: true,
};

// lookup the container we want the Grid to use
var eGridDiv = document.querySelector('#myGrid');

// create the grid passing in the div to use together with the columns & data we want to use
new agGrid.Grid(eGridDiv, gridOptions);

agGrid.simpleHttpRequest({url: 'https://raw.githubusercontent.com/ag-grid/ag-grid/master/grid-packages/ag-grid-docs/src/sample-data/rowData.json'}).then(function(data) {
    gridOptions.api.setRowData(data);
});

// https://www.ag-grid.com/javascript-grid-server-side-model-grouping/
function getSelectedRows() {
  const selectedNodes = gridOptions.api.getSelectedNodes()
  const selectedData = selectedNodes.map( function(node) { return node.data })
  const selectedDataStringPresentation = selectedData.map( function(node) { return node['make'] + ' ' + node['model']+' Cs: '+node['Cs'] }).join(', ')
  alert('Selected nodes: ' + selectedDataStringPresentation);
}

// https://www.ag-grid.com/javascript-grid-selection/#example-select-everything
function isFirstColumn(params) {
  var displayedColumns = params.columnApi.getAllDisplayedColumns();
  var thisIsFirstColumn = displayedColumns[0] === params.column;
  return thisIsFirstColumn;
}

// https://www.ag-grid.com/javascript-grid-selection/#example-select-everything
function onQuickFilterChanged() {
  gridOptions.api.setQuickFilter(document.getElementById('quickFilter').value);
}

// https://blog.ag-grid.com/binding-boolean-values-to-checkboxes-in-ag-grid/
// https://stackoverflow.com/questions/41706848/how-to-use-a-checkbox-for-a-boolean-data-with-ag-grid
// { headerName: "Cs",             field: "Cs",            cellRenderer: function(params) { 
//   var input = document.createElement('input');
//   input.type="checkbox";
//   input.classList="ag-input-field-input ag-checkbox-input checkbox-hack";
//   input.checked=params.value;
//   input.addEventListener('click', function (event) {
//       params.value=!params.value;
//       params.node.data.fieldName = params.value;
//   });
//   return input;
//   },
//   // https://www.ag-grid.com/javascript-grid-cell-styles/
//   // cellClass: 'ag-checkbox-input-wrapper'
// },
function CheckboxRenderer() {}

CheckboxRenderer.prototype.init = function(params) {
  this.params = params;

  this.eGui = document.createElement('input');
  this.eGui.type = 'checkbox';
  this.eGui.checked = params.value;

  this.checkedHandler = this.checkedHandler.bind(this);
  this.eGui.addEventListener('click', this.checkedHandler);
}

CheckboxRenderer.prototype.checkedHandler = function(e) {
  let checked = e.target.checked;
  let colId = this.params.column.colId;
  this.params.node.setDataValue(colId, checked);
}

CheckboxRenderer.prototype.getGui = function(params) {
  return this.eGui;
}

CheckboxRenderer.prototype.destroy = function(params) {
  this.eGui.removeEventListener('click', this.checkedHandler);
}
