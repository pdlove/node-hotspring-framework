const pluralize = require('pluralize');
const DataTypes = require('sequelize').DataTypes;
const sequelizeWhere = require('sequelize-where'); // Import sequelize-where

class HotspringObjectType {
    stack = 'test'; // This is autofilled when the object is imported.
    name = 'test';    
    preferredDatabase = 'sql';
    sqlSchemaName = null;
    sqlTableName = null;
    sqlCustomTimestamps = false;

    seedData = null; //This should be an array of items

    autoRoutes = true; 
    /* Routes are also created for the views with GET verbs:
         /{stack}/{object}/ - Browse view
         /{stack}/{object}/0 - New View
         /{stack}/{object}/{id} - Read View
         /{stack}/{object}/Edit/{id} - Edit View
         /{stack}/{object}/Delete/{id} - Delete View         
    */

    defaultWriteAccess = 'admin'; // admin, user, public
    defaultReadAccess = 'admin'; // admin, user, public
    defaultBrowsePageSize = 10; // 0 means no limit

    ejsViewBrowse = null;
    ejsViewRead = null;
    ejsViewEdit = null;
    ejsViewAdd = null;
    ejsViewDelete = null;

    sequelizeDefinition = {};
    sequelizeConnections = {};
    sequelizeObject = null;
    primaryKey = null;

    sequelizeDefine(sequelize, DataTypes) {
        let tableOptions = {};
        tableOptions.schema = this.sqlSchemaName || this.stack;
        tableOptions.tableName = this.name || pluralize(this.name);
        if (this.sqlCustomTimestamps) tableOptions.timestamps = false;

        this.sequelizeObject = sequelize.define(this.name, this.sequelizeDefinition, tableOptions);
        this.primaryKey = Object.keys(this.sequelizeObject.rawAttributes).find((key) => this.sequelizeObject.rawAttributes[key].primaryKey);
        return this.sequelizeObject;
    }

    async browseObjects(filter, sortOrder, page, pageSize) {
        // Implementation here
    }
    async readObject(id) {
        // Implementation here
    }
    async editObject(data) {
        // Implementation here
    }
    async addObject(data) {
        // Implementation here
    }
    async deleteObject(data) {
        // Implementation here
    }

    /* Creates BREAD Routes
         GET /api/{stack}/{object}/ - Browse
         GET /api/{stack}/{object}?filter={filter} - Browse with filter
         GET /api/{stack}/{object}/{id} - Read
         PUT /api/{stack}/{object}/{id} - Edit
         POST /api/{stack}/{object}/ - Add
         DELETE /api/{stack}/{object}/{id} - Delete
    */
    apiRoutes() {
        return [
            { path: (this.name+'/'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
            { path: (this.name+'/:id'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
            { path: (this.name+'/:id'), method: "PUT", function: this.defaultPutRoute.bind(this), isAPI: true },
            { path: (this.name+'/'), method: "POST", function: this.defaultPostRoute.bind(this), isAPI: true },
            { path: (this.name+'/:id'), method: "DELETE", function: this.defaultDeleteRoute.bind(this), isAPI: true }            
        ]
    }

    async defaultGetRoute(req, res) {
        try {
            const acceptHeader = res.req.headers["accept"].toLowerCase() || "text/html";
            //Determine requested page number
            const page = req.query.page || 1;            
            //Determine requested page size
            const pageSize = req.query.pageSize || this.defaultBrowsePageSize;
            //Determine requested filter
            let filter = req.query.filter || null;
            //Determine requested sort order
            const sortOrder = req.query.sortOrder || null;

            //Determine if there is an ID. If there is an ID then it changes the WHERE statement
            const id = req.params.id || null;
            if (id) {
                if (id == 0) {
                    // This is a request for a blank object.
                    res.json(this.sequelizeObject.build());
                    return;
                }
                //This is a data view request.
                const data = await this.sequelizeObject.findByPk(id);
                res.json(data);
            } else {
                
                const data = await global.hotspring.fetchData(this.sequelizeObject, filter, sortOrder, page, pageSize);
                res.json({
                    page,
                    pageSize,
                    total: data.total,
                    items: data.items
                });
           }
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
    async defaultPostRoute(req, res) {
        try {
            const data = await this.sequelizeObject.create(req.body);
            res.json(data);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
    async defaultPutRoute(req, res) {
        try {
            const data = await this.sequelizeObject.update(req.body, { where: { [this.primaryKey]: req.params.id } });
            res.json(data);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
    async defaultDeleteRoute(req, res) {
        try {
            //Add code to handle soft deletes
            const data = await this.sequelizeObject.destroy({ where: { [this.primaryKey]: req.params.id } });
            res.json(data);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }    
}
module.exports = { HotspringObjectType, DataTypes };