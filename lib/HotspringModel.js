const pluralize = require('pluralize');
const DataTypes = require('sequelize').DataTypes;
const sequelizeWhere = require('sequelize-where'); // Import sequelize-where

class HotspringModel {    
    static stack = 'test'; // This is autofilled when the object is imported.
    static name = 'HotspringModel';
    static preferredDatabase = 'sql';
    static sqlSchemaName = null;
    static sqlTableName = null;
    static sqlCustomTimestamps = false;

    static seedData = null; //This should be an array of items

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
    static defaultBrowsePageSize = 10; // 0 means no limit

    static ejsViewBrowse = null;
    static ejsViewRead = null;
    static ejsViewEdit = null;
    static ejsViewAdd = null;
    static ejsViewDelete = null;

    static sequelizeDefinition = {};
    static sequelizeConnections = {};
    static sequelizeObject = null;
    static primaryKey = null;

    constructor() {
        for (const fieldName in this.constructor.sequelizeDefinition) {
            console.log(fieldName);
        }
    }

    static sequelizeDefine(sequelize, DataTypes) {
        let tableOptions = {};
        tableOptions.schema = this.sqlSchemaName || this.stack;
        tableOptions.tableName = this.name || pluralize(this.name);
        if (this.sqlCustomTimestamps) tableOptions.timestamps = false;

        this.sequelizeObject = sequelize.define(this.name, this.sequelizeDefinition, tableOptions);
        if (this.sequelizeObject)
        this.primaryKey = Object.keys(this.sequelizeObject.rawAttributes).find((key) => this.sequelizeObject.rawAttributes[key].primaryKey);
        return this.sequelizeObject;
    }

    static async browseObjects(filter, sortOrder, page, pageSize) {
        if (!page) page = 1;
        if (!pageSize) pageSize = this.defaultBrowsePageSize;

        const data = await global.hotspring.fetchData(this.sequelizeObject, filter, sortOrder, page, pageSize);
        return {
            page,
            pageSize,
            total: data.total,
            items: data.items
        };
    }

    static async readObject(id) {
        if (id == 0) {
            return this.sequelizeObject.build();
        }
        return await this.sequelizeObject.findByPk(id);
    }

    static async addOrEditObject(data) {
        const id = data[this.primaryKey];
        if (!id)
            return this.addObject(data);
        else
            return this.editObject(data);
    }

    static async editObject(data) {
        await this.sequelizeObject.update(data, { where: { [this.primaryKey]: data[this.primaryKey] } });
        return await this.sequelizeObject.findByPk(data[this.primaryKey]);
    }

    static async addObject(data) {
        return await this.sequelizeObject.create(data);
    }

    static async deleteObject(id) {
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
            { path: (this.name + '/'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
            { path: (this.name + '/:id'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
            { path: (this.name + '/:id'), method: "PUT", function: this.defaultPutRoute.bind(this), isAPI: true },
            { path: (this.name + '/'), method: "POST", function: this.defaultPostRoute.bind(this), isAPI: true },
            { path: (this.name + '/:id'), method: "DELETE", function: this.defaultDeleteRoute.bind(this), isAPI: true }
        ]
    }

    static async defaultGetRoute(req, res) {
        try {
            const acceptHeader = res.req.headers["accept"].toLowerCase() || "text/html";
            const page = req.query.page;
            const pageSize = req.query.pageSize;
            const filter = req.query.filter;
            const sortOrder = req.query.sortOrder;
            const id = req.params.id;

            if (id) {
                const data = await this.readObject(id);
                res.json(data);
            } else {
                const data = await this.browseObjects(filter, sortOrder, page, pageSize);
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