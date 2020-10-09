// DONE: https://www.ag-grid.com/javascript-grid-cell-editing/#losingFocusStopsEditing
// TODO: https://www.ag-grid.com/javascript-grid-header-rendering/#example-header-group-cells
// TODO: https://www.ag-grid.com/javascript-grid-width-and-height/#inside-css-grid-container
// TODO: https://stackoverflow.com/questions/42913529/ag-grid-row-checkbox-select-making-checkbox-selection-equivalent-to-row-selecti#42936496
// TODO: export to csv https://www.ag-grid.com/javascript-grid-api/

// specify the columns: deviceGroup;copierIP;copierName;Cs;Gp;Ir;Lo;Pa;Ss;nativeUser;nativePassword;nqUser;nqPassword;copierSerial
// specify the groupBy column: rowGroup
var columnDefs = [
  {headerName: "Make",            field: "make", flex: 1, rowGroup: true, suppressMenu: false },
  {headerName: "Price",           field: "price", flex: 1, suppressMenu: false   },
  // { headerName: "copierIP",       field: "copierIP", flex: 1,       rowGroup: true, suppressMenu: false  },
  // { headerName: "copierName",     field: "copierName", flex: 1, suppressMenu: false      },
  { headerName: "Cs",             field: "Cs",              width: 20,  headerClass: 'smallColumn', cellClass: 'smallColumn', cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
  { headerName: "Gp",             field: "Gp",              width: 20,  headerClass: 'smallColumn', cellClass: 'smallColumn', cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
  { headerName: "Ir",             field: "Ir",              width: 20,  headerClass: 'smallColumn', cellClass: 'smallColumn', cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
  { headerName: "Lo",             field: "Lo",              width: 20,  headerClass: 'smallColumn', cellClass: 'smallColumn', cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
  { headerName: "Pa",             field: "Pa",              width: 20,  headerClass: 'smallColumn', cellClass: 'smallColumn', cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
  { headerName: "Ss",             field: "Ss",              width: 20,  headerClass: 'smallColumn', cellClass: 'smallColumn', cellRenderer: 'checkboxRenderer', sortable: false, filter: false, },
  { headerName: "nativeUser",     field: "nativeUser",      flex: 1, hide: "true", },
  { headerName: "nativePassword", field: "nativePassword",  flex: 1, hide: "true", },
  { headerName: "nqUser",         field: "nqUser",          flex: 1, hide: "true", },
  { headerName: "nqPassword",     field: "nqPassword",      flex: 1, hide: "true", },
  { headerName: "copierSerial",   field: "copierSerial",    flex: 1, hide: "true", },
];

// https://www.ag-grid.com/javascript-grid-server-side-model-grouping/
// adding fake server-side Row Grouping: gridOptions.api.setServerSideDatasource(datasource); 
// specify the groupBy column + checkbox under that first column: deviceGroup - even tho we will show copierIP once expanded
var autoGroupColumnDef = {
  headerName: "Model",
  field: "model",
  // headerName: "deviceGroup",
  // field: "deviceGroup",
  cellRenderer:'agGroupCellRenderer',
  cellRendererParams: {
    checkbox: true                     // different way to have grouped rows main selector == checkboxSelection: isFirstColumn
  }
}

var defaultColDef = {
  // flex requires minWidth or maxWidth and disabled single column width
  // flex: 1,
  // minWidth: 100,
  editable: true,
  resizable: true,
  sortable: true,
  filter: true,
  suppressMenu: true,
  suppressSizeToFit: true,
  headerCheckboxSelection: isFirstColumn,
  // checkboxSelection: isFirstColumn,      // different way to have grouped rows main selector == agGroupCellRenderer
}

// let the grid know which columns and what data to use
var gridOptions = {
  columnDefs: columnDefs,
  defaultColDef: defaultColDef,
  autoGroupColumnDef: autoGroupColumnDef,
  groupSelectsChildren: true,
  rowSelection: 'multiple',
  rowData: null,
  enableRangeSelection: true,
  suppressMultiRangeSelection: true,
  stopEditingWhenGridLosesFocus: true,
  // cellStyle: params => params.value === 'YOUR_VALUE' ? {'pointer-events': 'none'} : '',
  components: {
    checkboxRenderer: CheckboxRenderer,
  },
  enableCellChangeFlash: true,
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
  const selectedDataStringPresentation = selectedData.map( function(node) { return node['make'] + ' ' + node['model']+' Cs: '+node['Cs']+' Gp: '+node['Gp']+' Ir: '+node['Ir'] }).join(', ')
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
// https://plnkr.co/edit/SGtSud3Swjlt1xK5?preview
// https://blog.ag-grid.com/binding-boolean-values-to-checkboxes-in-ag-grid/
// https://stackoverflow.com/questions/41706848/how-to-use-a-checkbox-for-a-boolean-data-with-ag-grid
// https://plnkr.co/edit/SGtSud3Swjlt1xK5?preview
function CheckboxRenderer() {}

CheckboxRenderer.prototype.init = function(params) {
  this.params = params;

  // original method, crappy checkboxes with no class:
  // this.eGui = document.createElement('input');
  // this.eGui.type = 'checkbox';
  // this.eGui.checked = params.value;
  // this.eGui = input;

  // better method, that mimics ag-Grid checkbox decoration:
  var input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = params.value;
  this.eGui = generateCheckBoxWrapper(input);

  this.checkedHandler = this.checkedHandler.bind(this);
  this.eGui.addEventListener('click', this.checkedHandler);

  // method that mimics ag-Grid checkbox decoration:
  if (input.checked) {
    input.parentElement.classList.add("ag-checked");
  } else {
    input.parentElement.classList.remove("ag-checked");
  }
}

CheckboxRenderer.prototype.checkedHandler = function(event) {
  // event == params.node
  let checked = event.target.checked;
  let colId = this.params.column.colId;
  this.params.node.setDataValue(colId, checked);

  // way to select all children then refresh them, if you have grouped cells sub-headers
  if (this.params.node.allLeafChildren) {
    // console.log(this);
    // console.log(this.params);
    this.params.node.allLeafChildren.map(function (item, index, array) {
      item.data[colId] = checked;
    });
    gridOptions.api.refreshCells({columns: [colId]});
  }
  // } else {
    // if (!this.params.node.parent.data) this.params.node.parent.data = {colId: false};
    // console.log(this.params.node.parent.data[colId]);             // does not exist until you click it
    // if (!this.params.node.parent.data || checked !== this.params.node.parent.data[colId]) {
      // this.params.node.parent.setDataValue(colId, checked);       // will check the parent 
      // console.log(this.params.node.parent.id);                    // ag-group-0/1/2...
      // console.log(this.params.node.parent);                       // 
      // console.log(this);                                          // eWrapper
      // console.log($('[col-id='+colId+']'))
      // console.log($('[col-id='+colId+']').children('[ref=eWrapper]'))
      // $('[col-id='+colId+']').children('[ref=eWrapper]').classList.add('ag-indeterminate')
  // }

  // console.log(event);                     // MouseEvent {}
  // console.log(event.target);              // <input type="checkbox" ...>
  // console.log(event.target.checked);      // true/false
  // console.log('colId= '+colId);           // "Cs"
  // console.log(this);                      // CheckboxRenderer {}
}
CheckboxRenderer.prototype.getGui = function(params) {
  return this.eGui;
}
CheckboxRenderer.prototype.destroy = function(params) {
  this.eGui.removeEventListener('click', this.checkedHandler);
}

function generateCheckBoxWrapper(input) {
  // input.setAttribute('id', 'ag-'+randomNumber(8000,10000)+'-input');
  input.setAttribute('ref', 'eInput');
  input.setAttribute('aria-label', 'Press Space to toggle row selection (unchecked)');
  input.setAttribute('tabindex', '-1');
  input.classList = 'ag-input-field-input ag-checkbox-input';

  var divWrapper = document.createElement('div');
  divWrapper.setAttribute('ref', 'eWrapper');
  divWrapper.setAttribute('role', 'presentation');
  divWrapper.classList = 'ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper';

  var divLabel = document.createElement('div');
  divLabel.setAttribute('ref', 'eLabel');
  divLabel.classList = 'ag-input-field-label ag-label ag-hidden ag-checkbox-label';

  var divCheckbox = document.createElement('div');
  divCheckbox.setAttribute('ref', 'eCheckbox');
  divCheckbox.setAttribute('role', 'presentation');
  divCheckbox.classList = 'ag-labeled ag-label-align-right ag-checkbox ag-input-field';

  var divSelect = document.createElement('div');
  divSelect.classList = 'ag-selection-checkbox';

  var spanCellValue = document.createElement('span');
  spanCellValue.setAttribute('ref', 'eCellValue');
  spanCellValue.setAttribute('role', 'presentation');
  spanCellValue.setAttribute('unselectable', 'on');
  spanCellValue.classList = 'ag-cell-value';

  var divCellWrapper = document.createElement('div');
  divCellWrapper.setAttribute('ref', 'eCellWrapper');
  divCellWrapper.setAttribute('role', 'presentation');
  divCellWrapper.classList = 'ag-cell-wrapper';

  divWrapper.appendChild(input);
  divCheckbox.appendChild(divLabel);
  divCheckbox.appendChild(divWrapper);
  divSelect.appendChild(divCheckbox);
  divCellWrapper.appendChild(divSelect);
  divCellWrapper.appendChild(spanCellValue);
  return divCellWrapper;
}
function randomNumber(min, max) {  
  return (Math.random() * (max - min) + min).toFixed(0); 
}  


// params.data == params.node.data = {Cs: true, make: xxx, model: yyy ... }

// sub-header for make = Porsche when checkbox clicked:
  // params.column.colId = "Cs"
  // params.data = {Cs: true}
  // params.node.field = "make"
  // params.node.id = "row-group-0"
  // params.node.key = "Porsche"
  // params.node.level = 0
  // params.node.leafGroup = false
  // params.node.__hasChildren = true
  // params.node.allChildrenCount = 1234
  // params.node.group = true
  // params.rowIndex = 0
    // first element params.rowIndex = 1 !

// sub-header for make = Ford when checkbox clicked:
  // params.column.colId = "Cs"
  // params.data = {Cs: true}
  // params.node.field = "make"
  // params.node.id = "row-group-1"
  // params.node.key = "Ford"
  // params.node.level = 0
  // params.node.leafGroup = false
  // params.node.__hasChildren = true
  // params.node.allChildrenCount = 1234
  // params.node.group = true
  // params.rowIndex = 1
    // first element params.rowIndex = 2 !

// sub-header for make = Ford when checkbox clicked:
  // params.column.colId = "Cs"
  // params.data = {Cs: true}
  // params.node.field = "make"
  // params.node.id = "row-group-2"
  // params.node.key = "Toyota"
  // params.node.level = 0
  // params.node.leafGroup = false
  // params.node.__hasChildren = true
  // params.node.allChildrenCount = 992
  // params.node.allLeafChildren = {0: {childIndex:0, data:{... Cs: true/false}}, ... 991:{}}
  // params.node.group = true
  // params.rowIndex = 2
    // first element params.rowIndex = 3 !

// ----------------------------------------------------------
// sub-header for make = Ford when any actual line is checked
  // params.data = {make: "Porsche", model: "Boxter", Price: 72000, Cs: true, ... }
  // params.node.field = "make"
  // params.node.allChildrenCount = null
  // params.node.childIndex = 1, 2 ... n of row within the group
  // params.node.id = 1, 2 ... n of row within the group
  // params.node.level = 1
  // params.rowIndex = starting 0, row index for EXPANDED, all visible rows - useless 


/*
// nice one:
<div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="9" comp-id="110" col-id="Ss"   class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height" aria-selected="false"  style="width: 36px; left: 821px;">
  <div ref="eCellWrapper" class="ag-cell-wrapper" role="presentation">
    <div class="ag-selection-checkbox">
      <div role="presentation" ref="eCheckbox" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
        <div ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label"></div>
        <div ref="eWrapper" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper ag-checked" role="presentation">
          <input ref="eInput" class="ag-input-field-input ag-checkbox-input" type="checkbox" id="ag-256-input"
            aria-label="Press Space to toggle row selection (checked)" tabindex="-1">
        </div>
      </div>
    </div><span ref="eCellValue" role="presentation" class="ag-cell-value" unselectable="on"></span>
  </div>
</div>

// custom, ugly one:
<div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="6" comp-id="1323" col-id="Ir" class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height ag-cell-value" style="width: 36px; left: 764px;">
  <input type="checkbox">
</div>

<div tabindex="-1" unselectable="on" role="gridcell" aria-colindex="5" comp-id="106" col-id="Gp"   class="ag-cell ag-cell-not-inline-editing ag-cell-auto-height ag-cell-value" aria-selected="false"  style="width: 36px; left: 677px;">
  <div ref="eCellWrapper" role="presentation" class="ag-cell-wrapper">
    <div class="ag-selection-checkbox">
      <div ref="eCheckbox" role="presentation" class="ag-labeled ag-label-align-right ag-checkbox ag-input-field">
        <div ref="eLabel" class="ag-input-field-label ag-label ag-hidden ag-checkbox-label"></div>
        <div ref="eWrapper" role="presentation" class="ag-wrapper ag-input-wrapper ag-checkbox-input-wrapper">
          <input type="checkbox" ref="eInput" class="ag-input-field-input ag-checkbox-input">
        </div>
      </div>
    </div><span ref="eCellValue" role="presentation" unselectable="on" class="ag-cell-value"></span>
  </div>
</div>
*/

