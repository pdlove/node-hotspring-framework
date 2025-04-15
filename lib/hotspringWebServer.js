const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');


class HotspringWebServer {
    hotspring = null;
    
    
    constructor(hotspring) {
        this.hotspring = hotspring;
    }

    async initializeWebApp(mode, port) {
        if (!mode) mode = 'full'; //Default to full mode.

        const app = express();
        this.expressApp = app;

        // Middleware to log the request
        // app.use((req, res, next) => {
        //     console.log(`Request URL: ${req.url}`);
        //     next();
        // });

        //Get Static Files
        if (mode!='api') {
            for (publicPath of this.hotspring.configuration.publicPaths) {
            app.use(express.static(publicPath));
            }
            app.use(express.static(path.join(this.hotspring.configuration.appRoot, 'public')));
            app.use(express.static(path.join(this.hotspring.configuration.coreModulePath, 'public_builtin')));
        }


        // Everything else is a system call, probably.
        // Normally I'd use express.Router, but I'm having trouble with it.
        // Honestly this might be better because I can handle the security at the same time.
        app.use(async (req, res, next) => {
            //console.log(`Processing URL: ${req.url}`);

            let currentRoute = this.hotspring.routes[req.method];
            let lastRoute = null;
            let paramNum = 0;

            //Break up the route into the parts so we can create the iterative objects    
            const routeParts = req.url.split('?')[0].split('/'); //We split based on ? to get rid of any parameters after the last part of the URL.


            for (let i = 0; i < routeParts.length; i++) {
                const part = routeParts[i];
                if (!part) continue;
                if (paramNum < currentRoute.params.length) {
                    //This is a parameter
                    req.params[currentRoute.params[paramNum]] = part;
                    paramNum += 1
                    //Since we processed a parameter, skip this for route selection.
                    continue;
                }
                if (currentRoute[part]) {
                    //If the next part exists as a route, we'll move to it.
                    currentRoute = currentRoute[part];
                    if (currentRoute.route) lastRoute = currentRoute.route; //if there is a route associated with this path, update lastRoute.
                    //Fill in the parameters with null.
                    for (let j = 0; j < currentRoute.params.length; j++) {
                        req.params[currentRoute.params[i]] = null;
                    }
                    paramNum = 0; //Reset the parameter Number
                }
            }
            if (!lastRoute) {
                //If the route wasn't found, move to the next middleware.
                await next();
                return;
            }

            let result = await lastRoute.function(req, res);
            if (!result) await next(); //If something failed, pass the buck.


        });

        //this.hotspring.webappRouter=express.Router();
        //app.use(this.hotspring.webappRouter);

        app.use(bodyParser.json());

        app.listen(port, async () => {
            console.log(`Server is running on port ${port}`);
        });

        // if (relationship.connection == '1M') {
        //   Child.belongsTo(Parent, { foreignKey: 'parentId', targetKey: 'id' });
        //   Parent.hasMany(Child, { foreignKey: 'parentId', sourceKey: 'id' });
        // }
        // if (relationship.connection == 'MM') {
        //   type1.belongsToMany(models.Menu, { through: models.GroupMenu, foreignKey: 'groupId', otherKey: 'menuId', as: 'menus' });
        //   type2.belongsToMany(models.Menu, { through: models.GroupMenu, foreignKey: 'groupId', otherKey: 'menuId', as: 'menus' });
        // }
    }
}
module.exports = { HotspringWebServer };