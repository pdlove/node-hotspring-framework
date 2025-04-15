const { HotspringRoute } = require('../../../lib/hotspringRoute');
const path = require('path');
const mime = require('mime-types');

class uiRoutes extends HotspringRoute {
    routeName = 'ui';
    hotspring = null; // This is set when HotspringStack initializes the class.

    
    defaultAccess = 'admin'; // admin, user, public
    apiRoutes() {
        return [
            { path:'/api/ui/:fullPackageName/:filename', method: "GET", function: this.fetchPackage.bind(this), isAPI: false },
        ];
    }

    async fetchPackage(req, res) {
        try {
            const reqFullPackageName = req.params.fullPackageName;
            const [reqStack, reqPackage] = reqFullPackageName.split('.', 2);
            const reqFilename = req.params.filename;

            if (!this.hotspring.stacks[reqStack]) {
                //res.status(404).send("Stack Not Found");
                return false;
            }
            if (!this.hotspring.stacks[reqStack].clientPackages[reqPackage]) {
                //res.status(404).send("Package Not Found");
                return false;
            }
            let pkg = this.hotspring.stacks[reqStack].clientPackages[reqPackage];

            if (!reqFilename) {
                // Return the JSON representing the combined package.
                const data = { startupClass: pkg.startupClass, 
                    startupFunction: pkg.startupFunction, 
                    htmlCombined: pkg.htmlCombined, 
                    jsCombined: pkg.jsCombined, 
                    cssCombined: pkg.cssCombined, 
                    templateFiles: pkg.templateFiles, 
                    requiredPackages: pkg.requiredPackages }
                res.json(data);    
                return true;
            }

            let mimeType;
            let content;

            //This might be a request to get the combined file of a specific type. We do this with css and js to make it easier to debug issues.
                       

            //This is a specific file requested so we need to determine the type.
            const ext = path.extname(reqFilename).toLowerCase();
            
            switch (ext) {
                case '': //This is likely a request for the css or js as a combined file.
                    if (reqFilename=='css') {
                        mimeType = 'text/css';
                        content = pkg.cssCombined;                            
                    }
                    if (reqFilename=='js') {
                        mimeType = 'application/javascript';
                        content = pkg.jsCombined;                                                
                    }
                    if (reqFilename=='html') {
                        mimeType = 'text/html';
                        content = pkg.htmlCombined;                                                
                    }
                    break;
                case '.html':
                    mimeType = 'text/html';
                    content = pkg.htmlFiles[reqFilename]?.rawContent;
                    break;
                case '.css':
                    mimeType = 'text/css';
                    content = pkg.cssFiles[reqFilename]?.rawContent;
                    break;
                case '.js':
                    mimeType = 'application/javascript';
                    content = pkg.jsFiles[reqFilename]?.rawContent;
                    break;
                case '.ejs':
                    mimeType = 'text/plain'; // EJS files are typically templates, so plain text might be appropriate
                    content = pkg.ejsFiles[reqFilename];
                    break;
                default:
                    content = pkg.otherFiles[reqFilename];
                    mimeType = mime.lookup(reqFilename) || 'application/octet-stream';
                    break;
            }

            if (content) {
                res.setHeader('Content-Type', mimeType);
                res.send(content);
                return true;
            } else {
                //res.status(404).send("File Not Found");
                return false;
            }

        }
        catch (err) {
            res.status(500).send(err.message);
            return true;
        }
    }    
}
module.exports = uiRoutes