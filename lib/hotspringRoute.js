class HotspringRoute {
    stack = 'test'; // This is autofilled when the object is imported.
    name = 'test';

    defaultAccess = 'admin'; // admin, user, public
    apiRoutes() {
        return [
            { path: (this.name + '/'), method: "GET", function: this.defaultGetRoute.bind(this), isAPI: true },
        ]
    }
    async defaultRoute(req, res) {
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