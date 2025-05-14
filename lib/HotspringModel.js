const pluralize = require('pluralize');
const { Op, DataTypes} = require('sequelize');

class HotspringModel {
    static stackName = 'test'; // This is autofilled when the object is imported.
    static modelName = 'HotspringModel';
    static preferredDatabase = 'sql';
    static sqlSchemaName = null;
    static sqlTableName = null;
    static sqlCustomTimestamps = false;

    static seedData = null; //This should be an array of items

    static filterRequired = false;
    static autoRoutes = true;
    /* Routes are also created for the views with GET verbs:
         /{stack}/{object}/ - Browse view
         /{stack}/{object}/0 - New View
         /{stack}/{object}/{id} - Read View
         /{stack}/{object}/Edit/{id} - Edit View
         /{stack}/{object}/Delete/{id} - Delete View         
    */

    static defaultWriteAccess = 'admin'; // admin, user, public
    static defaultReadAccess = 'admin'; // admin, user, public
    static defaultBrowsePageSize = 0; // 0 means no limit

    static ejsViewBrowse = null;
    static ejsViewRead = null;
    static ejsViewEdit = null;
    static ejsViewAdd = null;
    static ejsViewDelete = null;

    static sequelizeDefinition = {};
    static sequelizeConnections = [];
    static sequelizeOptions = {};
    static sequelizeObject = null;
    static primaryKey = null;

    static hotspring = null;

    constructor() {
        for (const fieldName in this.constructor.sequelizeDefinition) {
            console.log(fieldName);
        }
    }

    static sequelizeDefine(sequelize, DataTypes) {
        let tableOptions = {};
        if (this.sqlSchemaName) tableOptions.schema = this.sqlSchemaName;
        tableOptions.tableName = (this.stackName+"_"+(this.tableName || pluralize(this.modelName))).toLowerCase();
        if (this.sqlCustomTimestamps) tableOptions.timestamps = false;
        const myKey = Object.values(this.sequelizeDefinition).find((field) => field.primaryKey);
        if (myKey) {
            if (!myKey.defaultValue && myKey.type == DataTypes.UUIDV4) {
                myKey.defaultValue = DataTypes.UUIDV4;
            }
        }

        this.sequelizeObject = sequelize.define(this.stackName+"_"+this.modelName, this.sequelizeDefinition, tableOptions);
        if (this.sequelizeObject)
            this.primaryKey = Object.keys(this.sequelizeObject.rawAttributes).find((key) => this.sequelizeObject.rawAttributes[key].primaryKey);
        return this.sequelizeObject;
    }

    static async browseObjects({ filter, sortOrder, pageSize, pageNum, subobjects, attributes, nest }) {
        if (this.filterRequired && !filter) throw new Error("Filter is required");

        //If filter is a string, determine if it contains a JSON object and parse if so.
        if (typeof filter === 'string') {
            try {
                filter = JSON.parse(filter);
            } catch (err) {
                filter = parseWhereClause(filter);
            }
        }

        if (!pageSize) pageSize=0;
        if (!pageNum) pageNum=1;
        const offset = (pageNum - 1) * pageSize;
        const limit = pageSize;

        // Construct the order clause
        let order = [];
        if (sortOrder) {
            order = sortOrder.split(',').map(order => {
                const [field, direction] = order.trim().split(/\s+/);
                return [field, direction.toUpperCase() || 'ASC'];
            });
        }

        // Construct the options object dynamically
        const options = {
            where: filter,
            order, // Adjust the sort field as needed
            raw: true,
            nest: false
        };

        if (nest !== undefined) options.nest = nest;

        const subObjectList = {};
        if (subobjects) {
            if (subobjects.length > 0) {
                //loop through the subobects to find them in this.hotspring.models
                for (const subobject of subobjects) {
                    const submodel = this.hotspring.models[subobject];
                    if (submodel) {
                        subObjectList[subobject] = { model: submodel.sequelizeObject };
                    }
                }
            }
        }

        if (attributes) {
            options.attributes=[];
            //Attributes will be an array of field names. They might be fully qualified, example: "stack.model.field" or just "field".
            //If the attribute is not fully qualified then we need to find the model that has the field, first the current model then loop through the subobjects.
            for (const attribute of attributes) {
                let model = '';
                let field = attribute;
                let isValid = false;

                //If the attribute is qualified then break it up.
                if (attribute.includes('.')) {
                    const parts = attribute.split('.');
                    if (parts.length === 3) {
                        // Fully qualified: stack.model.field
                        model = parts[0] + '.' + parts[1]; //Qualified Model Name
                        field = parts[2];
                    } else if (parts.length === 2) {
                        // Partially qualified: model.field - Stack is automatically the current one
                        model = this.stackName + '.' + parts[1]; //Qualified Model Name
                        field = parts[2];
                    }
                } else {
                    // Unqualified: field. Searching this model and then submodels.
                    if (this.sequelizeDefinition[attribute]) {
                        //This is on the current model.
                        model = this.stackName+'.'+this.modelName;
                        isValid = true;
                    } else {
                        for (const subobject in subObjectList) {

                            if (subObjectList[subobject].model.rawAttributes[attribute]) {
                                //This is on a submodel.
                                model = subobject;
                                isValid = true;                                
                            }
                            break;
                        }
                    }
                }
                if (!isValid) {
                    console.error("Attribute not found. "+attributes);
                }
                if (model == this.stackName+'.'+this.modelName) {
                    //This field was found in the current model.
                    options.attributes.push(field);
                } else {
                    if (!subObjectList[model].attributes)
                        subObjectList[model].attributes = [];
                    subObjectList[model].attributes.push(field);
                }
            }
        }

        options.include=Object.values(subObjectList);

        if (limit !== 0) {
            options.offset = offset;
            options.limit = limit;
        }

        const { count, rows } = await this.sequelizeObject.findAndCountAll(options);

        // Create an array of column names with custom getters.
        //Loop through sequelizeDefinition and record the name of entries which have a get function.
        const customGetters = {};
        for (const fieldName in this.sequelizeDefinition) {
            if (this.sequelizeDefinition[fieldName].get) {
                customGetters[fieldName] = this.sequelizeDefinition[fieldName].get;
            }
        }
        //Get Custom Getters from any included tables
        for (const subobject in subObjectList) {
            let objectModel = this.defaultHotspring.models[subobject];
            for (const fieldName in objectModel.sequelizeDefinition) {
                if (objectModel.sequelizeDefinition[fieldName].get) {
                    customGetters[objectModel.modelName+'.'+fieldName] = objectModel.sequelizeDefinition[fieldName].get;
                }
            }
        }

        //Now if there is anything in custom getters, we need to loop through the rows and apply the custom getters.
        if (Object.keys(customGetters).length > 0) {
            for (const row of rows) {
                for (const fieldName in customGetters) {
                    if (fieldName)
                        row[fieldName] = customGetters[fieldName](row[fieldName]);
                }
            }
        }
        if (pageSize == 0) return rows;
        return {
            pageNum,
            pageSize,
            total: count,
            items: rows
        };
    }

    static async readObject(id) {
        if (id == 0) {
            return this.sequelizeObject.build();
        }
        //TODO: Tweaks for Composite Keys Needed
        return await this.sequelizeObject.findByPk(id);
    }

    static async addOrEditObject(data) {
        //TODO: Tweaks for Composite Keys Needed
        const id = data[this.primaryKey];
        if (!id)
            return this.addObject(data);
        else
            return this.editObject(data);
    }

    static async editObject(data) {
        //TODO: Tweaks for Composite Keys Needed
        await this.sequelizeObject.update(data, { where: { [this.primaryKey]: data[this.primaryKey] } });
        return await this.sequelizeObject.findByPk(data[this.primaryKey]);
    }

    static async addObject(data) {
        return await this.sequelizeObject.create(data);
    }

    static async deleteObject(id) {
        //TODO: Tweaks for Composite Keys Needed
        return await this.sequelizeObject.destroy({ where: { [this.primaryKey]: id } });
    }

    /* Creates BREAD Routes
         GET /api/{stack}/{object}/ - Browse
         GET /api/{stack}/{object}?filter={filter} - Browse with filter
         GET /api/{stack}/{object}/{id} - Read
         PUT /api/{stack}/{object}/{id} - Edit
         POST /api/{stack}/{object}/ - Add
         DELETE /api/{stack}/{object}/{id} - Delete
    */
    static apiRoutes() {
        return [
            { path: (this.modelName + '/'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
            { path: (this.modelName + '/:id'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
            { path: (this.modelName + '/:id'), method: "PUT", function: this.defaultPutRoute.bind(this), isAPI: true },
            { path: (this.modelName + '/'), method: "POST", function: this.defaultPostRoute.bind(this), isAPI: true },
            { path: (this.modelName + '/:id'), method: "DELETE", function: this.defaultDeleteRoute.bind(this), isAPI: true }
        ]
    }

    static async defaultGetRoute(req, res) {
        try {
            const acceptHeader = res.req.headers["accept"].toLowerCase() || "text/html";
            let pageNum = req.query.page
            if (pageNum === undefined) pageNum = 1;
            let pageSize = req.query.pageSize;
            if (pageSize === undefined) pageSize = this.defaultBrowsePageSize;
            const filter = req.query.filter;
            if (filter) filter = JSON.parse(filter);
            const sortOrder = req.query.sortOrder;
            const id = req.params.id;

            if (id) {
                const data = await this.readObject(id);
                res.json(data);
            } else {
                const data = await this.browseObjects({ filter, sortOrder, pageSize, pageNum });
                res.json(data);
            }
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async defaultPostRoute(req, res) {
        try {
            const data = await this.addObject(req.body);
            res.json(data);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async defaultPutRoute(req, res) {
        try {
            const data = await this.editObject(req.body);
            res.json(data);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }

    static async defaultDeleteRoute(req, res) {
        try {
            const data = await this.deleteObject(req.params.id);
            res.json(data);
        } catch (err) {
            res.status(500).send(err.message);
        }
    }
}
module.exports = { HotspringModel, DataTypes };

function parseWhereClause(whereString) {
    const operatorsMap = {
        "=": Op.eq,
        "!=": Op.ne,
        ">": Op.gt,
        "<": Op.lt,
        ">=": Op.gte,
        "<=": Op.lte,
        "LIKE": Op.like,
        "NOT LIKE": Op.notLike,
        "IN": Op.in,
        "NOT IN": Op.notIn,
        "BETWEEN": Op.between
    };

    const whereObj = {};
    
    // Match BETWEEN separately since it has a different structure
    const betweenMatches = whereString.match(/(\w+)\s+BETWEEN\s+(\d+|'[^']*')\s+AND\s+(\d+|'[^']*')/gi);
    if (betweenMatches) {
        betweenMatches.forEach(condition => {
            const match = condition.match(/(\w+)\s+BETWEEN\s+(\d+|'[^']*')\s+AND\s+(\d+|'[^']*')/i);
            if (!match) return;
            
            let [, column, lower, upper] = match;
            
            // Remove quotes from string values
            if (lower.startsWith("'") && lower.endsWith("'")) {
                lower = lower.slice(1, -1);
            } else if (!isNaN(lower)) {
                lower = Number(lower);
            }

            if (upper.startsWith("'") && upper.endsWith("'")) {
                upper = upper.slice(1, -1);
            } else if (!isNaN(upper)) {
                upper = Number(upper);
            }

            whereObj[column] = { [Op.between]: [lower, upper] };
        });

        // Remove processed BETWEEN clauses from the original string
        whereString = whereString.replace(/(\w+)\s+BETWEEN\s+(\d+|'[^']*')\s+AND\s+(\d+|'[^']*')/gi, '');
    }

    // Match other conditions
    const conditions = whereString.match(/(\w+)\s*(=|!=|>|<|>=|<=|LIKE|NOT LIKE|IN|NOT IN)\s*('[^']*'|\d+|\([^)]*\))/gi);
    if (!conditions) return whereObj;

    conditions.forEach(condition => {
        const match = condition.match(/(\w+)\s*(=|!=|>|<|>=|<=|LIKE|NOT LIKE|IN|NOT IN)\s*('[^']*'|\d+|\([^)]*\))/i);
        if (!match) return;

        let [, column, operator, value] = match;
        value = value.trim();

        if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1); // Remove quotes
        } else if (value.startsWith("(") && value.endsWith(")")) {
            value = value.slice(1, -1).split(",").map(v => v.trim().replace(/^'|'$/g, "")); // Handle IN clause
        } else if (!isNaN(value)) {
            value = Number(value); // Convert numeric values
        }

        whereObj[column] = { [operatorsMap[operator]]: value };
    });

    return whereObj;
}
