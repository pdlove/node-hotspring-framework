class RawDataTable {
    parentDOM = null; //This is the DOM where the HTML file was loaded.
    tableDOM = null;
    tableObject = null;

    stack = null;
    model = null;
    filter = '';

    async setParameters(parameters) {
        if (!parameters) return;
        this.stack = parameters.stack;
        this.model = parameters.model;
        if (parameters.filter) this.filter = parameters.filter;
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

        const filterField = this.parentDOM.querySelector('#filter-json');
        filterField.value = JSON.stringify(this.filter) || '';

        this.tableDOM = this.parentDOM.querySelector('#thisTable');

        this.tableObject = await loadClientPackage("system.uiTable", this.tableDOM);


        await this.updateDOM();

    }
    
    async updateDOM() {
        // Get the filter value from the text field with ID 'filter-json'
        const filterField = this.parentDOM.querySelector('#filter-json');
        const filterValue = filterField ? filterField.value : '';

        // Get the page size value from the dropdown with ID 'page-size'
        const pageSizeField = this.parentDOM.querySelector('#page-size');
        const pageSizeValue = pageSizeField ? pageSizeField.value : '1000'; // Default to 1000 if not set
        if (pageSizeValue === 'all') pageSizeValue = -1;

        // Pass the filter value as a parameter to the system/model API call
        let apiUrl = `system/model/${this.stack}/${this.model}`;
        const queryParams = [];
        if (filterValue) queryParams.push(`filter=${encodeURIComponent(filterValue)}`);
        if (pageSizeValue) {
            queryParams.push(`pageSize=${pageSizeValue}`);
            queryParams.push(`pageNum=1`);
        }
        if (queryParams.length > 0) apiUrl += `?${queryParams.join('&')}`;
    
        this.data = (await API.getAPIData(apiUrl)).items;

        this.tableObject.setData(this.data);
        this.tableObject.renderDOM(this.tableDOM);
    }
}