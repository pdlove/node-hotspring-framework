class uiTable {
    //Functionality
    allowFilter = false; //Not Yet available
    addUndefinedColumns = true;
    maxSelectedRows = 1; //The number of rows a user can select. -1 is unlimited.
    maxSortCols = 1; //The Number of columns a user can sort by. -1 is unlimited.
    
    //Events
    async onSelect(sender, rowData, column) {
        return true;
    }

    //Data
    tableRows={};
    allColumns={};
    displayColumns=[];
    indexField="";
    sortColumns=[];
    sortDirections=[];
    #domTable = null;
	#domTHead = null;
	#domTBody = null;
	
    constructor(options) {
    
    }

    async setParameters(parameters) {
/*Parameters should look like:
columns:
*/
        if (!parameters) return;
        
        if (parameters.tableRows)
            this.setData(parameters.tableRows);
    }
    async renderDOM(destDOM) {
        destDOM.innerHTML='';
        this.renderHTML(destDOM);
    }

    addColumn(options, position) {
        if (options instanceof String || typeof options === "string") {
            //Only the name is passed
            options = {name: options};
        }   
        this.allColumns[options.name] = new uiTableColumn(options);     
    }
    setData(options) {
        //options = {dataArray: [], idxField: ''} //idxField is optional. A self-increasing numerical index will be used
        //options = {rowDictionary: {}, idxField: ''} //idxField is optional
        if (Array.isArray(options)) {
            options={ dataArray: options }
            this.tableRows=options.dataArray;
        }
    }
    
    addUpdateData(newData) {
        //This will add or update data
    }
    removeData(idx) {
        //value of the indexField to remove.
    }
    syncData(inArray) {
        //This will accept an array of rows.
        //New data will be added or updated

    }

    renderHTML(div) {
        //If there aren't any columns defined, get them from the datasource.
        if (Object.keys(this.allColumns).length==0) {
            for (let test in this.tableRows[0])
                this.addColumn(test);
        }

        //If There aren't any display columns dump all of them into the display.
        if (this.displayColumns.length===0)
            for (var fieldname in this.allColumns)
                this.displayColumns.push(fieldname);

		this.#domTable = document.createElement("table");
        this.#domTable.classList.add("uiTable");
		
		this.#domTHead = document.createElement("thead");
		this.#domTable.appendChild(this.#domTHead);
		var domRow = document.createElement("tr");
		this.#domTHead.appendChild(domRow);
		for (var idx in this.displayColumns) {
            var col = this.allColumns[this.displayColumns[idx]]
            var domCol = document.createElement("th");
			domCol.innerHTML=col.caption;
			domCol.dataset.fieldName=col.name;
			domCol.dataset.sort=0;
            let fname = domCol.dataset.fieldName;
			domCol.addEventListener("click", this.headerClick.bind(this));
			domRow.appendChild(domCol);
            col.domCol=domCol;
        }

        this.#domTBody = document.createElement("tbody");
		this.#domTable.appendChild(this.#domTBody);
        for (var rowIdx=0;rowIdx<this.tableRows.length;rowIdx+=1) {
			domRow = document.createElement("tr");
            domRow.addEventListener("click", this.rowClick.bind(this));
			this.#domTBody.appendChild(domRow);			
            for (var colIdx in this.displayColumns) {
                var col = this.allColumns[this.displayColumns[colIdx]]
				var domData = document.createElement("td");
				domData.innerHTML = col.renderHTML(this.tableRows[rowIdx])
			    domRow.appendChild(domData);
            }            
            this.tableRows[rowIdx].domRow = domRow;
        }
		div.appendChild(this.#domTable);
        this.doSort();
        return true;
    }

    headerClick(e) {
        this.sortByColumn(e.target.dataset.fieldName, !e.ctrlKey);
        return true;
    }
    rowClick(e) {
        //const index = Array.from(this.parentNode.children).indexOf(this); // Get column index of clicked td
        //const thisColumn = document.querySelector(`table.uiTable thead th:nth-child(${index + 1})`); // Select corresponding th
        if (!this.maxSelectedRows) return false;
        const thisRow = e.target.closest("tr");

        thisRow.classList.toggle("selected");
        console.log("Processing Row Click");
        //Need to make sure the index gets defined.
        return true;
    }
    sortByColumn(colName, singleCol) {        
        let sortColIdx = this.sortColumns.indexOf(colName);
        
        if ((sortColIdx<0 || this.sortColumns.length>1) && singleCol) {
            //For singleCol mode, clear the array if it is longer than 1 or if this column isn't in it.
            this.sortColumns=[];
            this.sortDirections=[];
            sortColIdx=-1;
        }

        if (sortColIdx<0)  {
            //If the column doesn't exist then add it with ascending order
            this.sortColumns.push(colName);
            this.sortDirections.push(1);
        } else {
            //The entry exists and we aren't in singleCol mode. Flip the flag
            this.sortDirections[sortColIdx]*=-1;
        }
        this.doSort();
	} 

    setSort(inValues) {
        this.sortColumns=[];
        this.sortDirections=[];
        if (typeof inValues == "string") {
            //A string is assumed to be a column name
            this.sortColumns.push(inValues);
            this.sortDirections.push(1);            
        } else {
            //Loop through the array
            for (let i=0;i<inValues.length;i++) {
                if (typeof inValues[i] == "string") {
                    //if the array is strings then it is column names.
                    this.sortColumns.push(inValues[i]);
                    this.sortDirections.push(1);                    
                } else {
                    //the elements should be arrays of [columnName,sortDirection]
                    this.sortColumns.push(inValues[i][0]);
                    this.sortDirections.push(inValues[i][1]);
                }
            }
        }        
    }

    doSort() {
        //Update all visible column Headers with the sorting order.
        for (let thisColName in this.allColumns) {
            let thisCol = this.allColumns[thisColName];
            if (thisCol.domCol != null) {
                let thisColOrder = this.sortColumns.indexOf(thisCol.name);
                if (thisColOrder<0) {
                    thisCol.domCol.classList.remove("asc");
                    thisCol.domCol.classList.remove("desc");            
                } else if (this.sortDirections[thisColOrder]>0) {
                    thisCol.domCol.classList.add("asc");
                    thisCol.domCol.classList.remove("desc");            
                } else {
                    thisCol.domCol.classList.remove("asc");
                    thisCol.domCol.classList.add("desc");            
                }
            }
        }

        //Sort the rows
        this.tableRows = this.tableRows.sort((a, b) => {
            for (let i=0; i<this.sortColumns.length; i++) {
                let sortedcol = this.allColumns[this.sortColumns[i]];
                let sortDirection = this.sortDirections[i];

                var value1 = sortedcol.getData(a); 
                var value2 = sortedcol.getData(b);

                if (value1<value2)
                    return -1*sortDirection;
                if (value1>value2)
                    return 1*sortDirection;            
            }
            return 0;
        });
        this.tableRows.forEach(row => this.#domTBody.appendChild(row.domRow));
    }
}
