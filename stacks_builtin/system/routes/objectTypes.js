const { HotspringRoute } = require('../../../lib/hotspringRoute');

class objectTypeRoutes extends HotspringRoute {
    name = 'ui';

    defaultAccess = 'admin'; // admin, user, public
    apiRoutes() {
        return [
            { path:'/objectType/:stack/:objectType', method: "GET", function: this.fetchPackage.bind(this), isAPI: true },
        ];
    }

    async fetchPackage(req, res) {
        try {
            const reqStack = req.params.stack;
            const reqobjectType = req.params.objectType;
            if (!reqobjectType) {
                //Need to send out a list of models.
                if (!global.hotspring.stacks[reqStack]) {
                    res.status(404).send("Invalid Stack");
                    return true;        
                }
                let objectTypeList = {};
                for (const objectTypeName in global.hotspring.stacks[reqStack].objectTypes) {
                    const objectType = global.hotspring.stacks[reqStack].objectTypes[objectTypeName];
                    const keys = objectType.sequelizeObject.primaryKeyAttributes
                    objectTypeList[objectTypeName]=keys;
                }
                res.json(objectTypeList);    
                return true;
            }
        }
        catch (err) {
            res.status(500).send(err.message);
            return true;
        }
    }
}
module.exports =  objectTypeRoutes