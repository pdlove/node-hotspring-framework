async function loadData(type) {
    currentType = type;
    const response = await fetch(`http://10.17.1.32:3002/${type}`);
    const data = await response.json();
    return data;
}
async function loadScreen() {
    var myTable = new uiTable();
    myTable.addColumn({ name:"host_name", caption: "Host"});
    myTable.addColumn({ name:"vm_name", caption: "VM"});
    myTable.addColumn({ name:"cpu.core_count", caption: "vCPUs"});
    myTable.addColumn({ name:"memory.mem_starting_gb", caption: "Mem GB"});
    myTable.addColumn({ name:"memory.mem_dynamic", caption: "Dynamic Mem", type:"bool"});
    myTable.addColumn({ name:"bootSettings.firmware_type", caption: "Firmware"});
    let HyperVData = await loadData('vms');
    myTable.setData(HyperVData);
    myTable.setSort([["host_name",1],["vm_name",-1]]);
    myTable.renderHTML(document.getElementById("sortableTable"));
}