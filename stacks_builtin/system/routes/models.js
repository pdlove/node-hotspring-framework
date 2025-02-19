const { HotspringRoute } = require('../../../lib/hotspringRoute');

class modelRoutes extends HotspringRoute {
    name = 'ui';

    defaultAccess = 'admin'; // admin, user, public
    apiRoutes() {
        return [
            { path:'/model/:stack/:model', method: "GET", function: this.fetchPackage.bind(this), isAPI: true },
        ];
    }

    async fetchPackage(req, res) {
        try {
            const reqStack = req.params.stack;
            const reqModel = req.params.model;
            if (!reqModel) {
                //Need to send out a list of models.
                if (!global.hotspring.stacks[reqStack]) {
                    res.status(404).send("Invalid Stack");
                    return true;        
                }
                let modelList = {};
                for (const modelName in global.hotspring.stacks[reqStack].models) {
                    const model = global.hotspring.stacks[reqStack].models[modelName];
                    const keys = model.sequelizeObject.primaryKeyAttributes
                    modelList[modelName]=keys;
                }
                res.json(modelList);    
                return true;
            } else {
                const model = global.hotspring.stacks[reqStack].models[reqModel];
                res.json(await model.browseObjects(null,null,null,1000));
                return true;
            }
        }
        catch (err) {
            res.status(500).send(err.message);
            return true;
        }
    }
}
module.exports =  modelRoutes