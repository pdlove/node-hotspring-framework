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
    #formatOptions={
        //These options are default settings. Only appropriate options are passed to the formatter based on the datatype.
        minimumFractionDigits: 2, // Displays 0s for missing decimals
        maximumFractionDigits: 2, // Truncates past this decimals
        useGrouping: true, //Use Commas
        dateStyle: "short", //Shows date only as numbers
        timeStyle: "medium" //Shows seconds.
    }
;
    subObjectProperty;
    
    constructor(options) {
        if (typeof options === 'string' || options instanceof String) {
            this.name = options;
            this.dataValue = this.name;
            this.isIndex = false;            
            this.isVisible = true;
            this.order = 0;
            this.type = "s";
            this.displayFormat = "";
            this.caption = this.name;
        } else {
            this.name = options.name; //Required fieldName
            this.dataValue = options.dataValue || this.name;
            this.isIndex = options.isIndex || false;
            this.isVisible = options.isVisible || true;
            this.order = options.order || 0;
            this.type = options.type || "s";
            this.displayFormat = options.displayFormat || "";
            this.caption = options.caption || this.name;
            if (options.renderer) 
                this.renderer = options.renderer;            
        }
        //Process if this is a subobject Property (Does not support arrays)
        this.subObjectProperty = this.dataValue.split('.');
        
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

        switch (this.type) {
            case "integer":
            case "int":
                return parseInt(value);
            case "decimal":
            case "float":
            case "number":
                return parseFloat(value);
            case "bool":
                if (value)
                    return true;
                else
                    return false;
            default:
                return value;
        }
    }
    renderHTML(obj) {
        var value = this.getData(obj);
        return this.renderer(obj, this.subObjectProperty, this.type, value);
    }

    //Override this for custom rendering.
    renderer(row, column, dataType, rawValue) { 
        return this.defaultRenderer(row, column, dataType, rawValue) 
    };

    defaultRenderer(row, column, dataType, rawValue) {
        let displayData = '';
        switch (dataType) {
            case "string":                
                displayData = rawValue.toString();
                break;
            case "integer":
            case "int":
            case "number":
                displayData = this.renderInteger(rawValue);
                break;
            case "decimal":
            case "float":
                displayData = this.renderDecimal(rawValue);
                break;
            case "date":
                displayData = this.renderDate(rawValue);
                break;
            case "time":
                displayData = this.renderTime(rawValue);
                break;
            case "datetime":
                displayData = this.renderDateTime(rawValue);
                break;
            case "bool":
                if (rawValue)
                    displayData = '<input type="checkbox" checked>';
                else
                    displayData = '<input type="checkbox">';
                    break;
            default:
                displayData = rawValue.toString();
                break;
        }
        return displayData;
    }
    renderInteger(value) {
        if (value===null || value==undefined) return ""; // Handle null or undefined values
        
        // For Integers, we don't want any decimal places        
        const formatOptions = {
            ...this.#formatOptions,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        };
        // Use Intl.NumberFormat to format the number with commas and specified decimal places
        const formatter = new Intl.NumberFormat('en-US', formatOptions);
        return formatter.format(value);        
    }
    renderDecimal(value) {
        if (value===null || value==undefined) return ""; // Handle null or undefined values
        
        // Use Intl.NumberFormat to format the number with commas and specified decimal places
        const formatter = new Intl.NumberFormat('en-US', this.#formatOptions);
        return formatter.format(value);        
    }
    renderDate(value) {
        if (!value) return ""; // Handle null or undefined values

        // Parse the value into a Date object
        const date = new Date(value);
        if (isNaN(date)) return value.toString(); // Return the original value if it's not a valid date
    
        // Use Intl.DateTimeFormat to format the date
        const formatOptions = {
            ...this.#formatOptions,
            timeStyle: undefined, // Clear timeStyle
            hour: undefined,      // Clear hour
            minute: undefined,    // Clear minute
            second: undefined,     // Clear second
        };        
        const formatter = new Intl.DateTimeFormat("en-US", formatOptions);
    
        return formatter.format(date);
    }
    renderTime(value) {
        if (!value) return ""; // Handle null or undefined values

        // Parse the value into a Date object
        const date = new Date(value);
        if (isNaN(date)) return value.toString(); // Return the original value if it's not a valid date
    
        // Use Intl.DateTimeFormat to format the date
        const formatOptions = {
            ...this.#formatOptions,
            dateStyle: undefined, // Clear timeStyle
            year: undefined,      // Clear year
            month: undefined,    // Clear month
            day: undefined     // Clear day
        };        
        const formatter = new Intl.DateTimeFormat("en-US", formatOptions);
    
        return formatter.format(date);
    }   
    renderDateTime(value) {
        if (!value) return ""; // Handle null or undefined values

        // Parse the value into a Date object
        const date = new Date(value);
        if (isNaN(date)) return value.toString(); // Return the original value if it's not a valid date
    
        return this.renderDate(value) + " " + this.renderTime(value);
    }   

}
