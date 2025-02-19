class RawDataTable {
    parentDOM = null; //This is the DOM where the HTML file was loaded.
    tableDOM = null;
    tableObject = null;

    stack = null;
    model = null;

    async setParameters(parameters) {
        if (!parameters) return;
        this.stack = parameters.stack;
        this.model = parameters.model;
        //this.panel = parameters.panel;
    }

    async renderDOM(destDOM) {
        if (destDOM) this.parentDOM=destDOM;
        this.tableDOM = this.parentDOM.querySelector('#thisTable');
        this.data = (await API.getAPIData("system/model/"+this.stack+"/"+this.model)).items;
        this.tableObject = await loadClientPackage("system.uiTable", this.tableDOM, {tableRows: this.data});
        this.tableObject.setData(this.data);
        this.tableObject.renderDOM(this.tableDOM);



        // var myTable = new uiTable();
        // myTable.addColumn({ name:"host_name", caption: "Host"});
        // myTable.addColumn({ name:"vm_name", caption: "VM"});
        // myTable.addColumn({ name:"cpu.core_count", caption: "vCPUs"});
        // myTable.addColumn({ name:"memory.mem_starting_gb", caption: "Mem GB"});
        // myTable.addColumn({ name:"memory.mem_dynamic", caption: "Dynamic Mem", type:"bool"});
        // myTable.addColumn({ name:"bootSettings.firmware_type", caption: "Firmware"});
        // let HyperVData = await loadData('vms');
        // myTable.setData(HyperVData);
        // myTable.setSort([["host_name",1],["vm_name",-1]]);
        // myTable.renderHTML(document.getElementById("sortableTable"));
    }
}