const { HotspringRoute } = require('../../../lib/hotspringRoute');

class modelRoutes extends HotspringRoute {
    routeName = 'ui';

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

            let filter = req.query.filter;
            //if (filter) filter = JSON.parse(filter);

            let pageSize = req.query.pageSize;
            if (!pageSize) pageSize = 100000;

            let pageNum = req.query.pageNum;
            if (!pageNum) pageNum = 1;

            //TODO: Add ability to pass sort order.
            if (!reqModel) {
                //Need to send out a list of models.
                if (!this.hotspring.stacks[reqStack]) {
                    res.status(404).send("Invalid Stack");
                    return true;        
                }
                let modelList = {};
                for (const modelName in this.hotspring.stacks[reqStack].models) {
                    const model = this.hotspring.stacks[reqStack].models[modelName];
                    const keys = model.sequelizeObject.primaryKeyAttributes
                    modelList[modelName]=keys;
                }
                res.json(modelList);    
                return true;
            } else {
                const model = this.hotspring.stacks[reqStack].models[reqModel];
                res.json(await model.browseObjects({ filter, pageSize, pageNum },null,pageSize, pageNum));
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