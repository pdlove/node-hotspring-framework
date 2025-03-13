class HotspringRoute {
    stack = 'test'; // This is autofilled when the object is imported.
    routeName = 'test';

    defaultAccess = 'admin'; // admin, user, public
    apiRoutes() {
        return [
            { path: (this.routeName + '/'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
        ]
    }
    async defaultGetRoute(req, res) {
        try {
            // Add code to handle soft deletes
            const data = { status: "Route Not Implemented" }
            res.json(data);
        }
        catch (err) {
            res.status(500).send(err.message);
        }
    }
}
module.exports = { HotspringRoute };