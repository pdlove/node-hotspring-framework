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


        // Add event listeners to the refresh-button and filter-button
        const refreshButton = this.parentDOM.querySelector('#refresh-button');
        const filterButton = this.parentDOM.querySelector('#filter-button');

        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.updateDOM());
        }

        if (filterButton) {
            filterButton.addEventListener('click', () => this.updateDOM());
        }

        this.tableDOM = this.parentDOM.querySelector('#thisTable');

        this.tableObject = await loadClientPackage("system.uiTable", this.tableDOM);
        await this.updateDOM();

    }
    
    async updateDOM() {
        // Get the filter value from the text field with ID 'filter-json'
        const filterField = this.parentDOM.querySelector('#filter-json');
        const filterValue = filterField ? filterField.value : '';

        // Pass the filter value as a parameter to the system/model API call
        let apiUrl = `system/model/${this.stack}/${this.model}`;
        if (filterValue!='') apiUrl+=`?filter=${filterValue}`;

        this.data = (await API.getAPIData(apiUrl)).items;

        this.tableObject.setData(this.data);
        this.tableObject.renderDOM(this.tableDOM);
    }
}