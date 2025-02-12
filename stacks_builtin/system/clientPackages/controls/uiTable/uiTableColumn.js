class uiTableColumn {
    isIndex;
    isVisible;
    
    canHide;
    canView;
    canGroup;

    name;
    order;
    
    type;
    caption;
    displayFormat;
    domCol = null;
    #formatOptions={};
    subObjectProperty;
    
    constructor(options) {
        if (typeof options === 'string' || options instanceof String) {
            this.name = options;
            this.isIndex = false;            
            this.isVisible = true;
            this.order = 0;
            this.type = "s";
            this.displayFormat = "";
            this.caption = this.name;
        } else {
            this.name = options.name; //Required fieldName
            this.isIndex = options.isIndex || false;
            this.isVisible = options.isVisible || true;
            this.order = options.order || 0;
            this.type = options.type || "s";
            this.displayFormat = options.displayFormat || "";
            this.caption = options.caption || this.name;
        }
        //Process if this is a subobject Property (Does not support arrays)
        this.subObjectProperty = this.name.split('.');
        
        //Need to process displayFormat to create the formatOptions object. This will vary base on datatype.
    }

    getData(obj) {
        var value = obj; 
        // Iterate over the properties to get the nested value
        for (var i = 0; i < this.subObjectProperty.length; i++) {
            if (value[this.subObjectProperty[i]] !== undefined) {
                value = value[this.subObjectProperty[i]];
            } else {
				value=null;
                break; //Propery not found
            }
        }
        return value;
    }
    renderHTML(obj) {
        var value = obj; 
        // Iterate over the properties to get the nested value
        for (var i = 0; i < this.subObjectProperty.length; i++) {
            if (value[this.subObjectProperty[i]] !== undefined) {
                value = value[this.subObjectProperty[i]];
            } else {
				value=null;
                break; //Propery not found
            }
        }

        
        if (this.type==="bool") {
            if (value)
                return '<input type="checkbox" checked>';
            else
                return '<input type="checkbox">';
        } else {
            //new Intl.NumberFormat("en-US", this.#formatOptions).format(1234567891.234567891);
            if (value) return value.toString();
			return "";
        }
    }
}
