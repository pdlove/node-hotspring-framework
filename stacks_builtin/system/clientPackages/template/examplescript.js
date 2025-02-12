class ExampleClass {
	#domObject = null;
	
    exampleData = [ { name: "Test Template", description: "This is just an example of default data. Normally you will get your data from setParameters" } ];

    constructor() {
        //Parameters are handled by setParameters so that it can be awaited.
    }

    async setParameters(parameters) {
        if (!parameters) return;
        this.exampleData=parameters
    }

    async renderDOM(destDOM) {
        this.#domObject = destDOM;
        
        //If we only want to process one object, do this. Please note our handlebars template uses "each "
        
        //let myObject = null;
        //if (this.exampleData.length>0) myObject = this.exampleData[0];
        //this.#domObject = this.clientPackage.templates['exampleTemplate'](myObject);

        
        //Passing all items:
        this.#domObject.innerHTML = this.clientPackage.templates['exampleTemplate'](this.exampleData);
        
    }
}