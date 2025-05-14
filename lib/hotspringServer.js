const { HotspringStack } = require('./hotspringStack');
const { HotspringWebServer } = require('./hotspringWebServer');
const Sequelize = require('sequelize');
const path = require('path');
const fs = require('fs').promises;
const { checkFolderExists, checkFileExists } = require('./util');

//This is the main entry point for the Hotspring framework. It is used to initialize the framework and load the stacks.
class HotspringServer {
    stacks = {};
    models = {};
    jobClasses = {};
    routes = {};
    clientPackages = {};
    stackLoadErrors = {};

    sequelize = null; //Sequelize object for the database connection. Seriously considering not using sequelize.

    //This is the default configuration. This is replaced by the configuration file passed to the constructor.
    configuration = {
        appRoot: path.resolve(__dirname, '../../../'), //This assumes this module is loaded in node_module folder of your application.
        coreModulePath: path.resolve(__dirname, '../'), //This is overridable for special use cases. Not Recommended to override this unless you know what you are doing.
        stackPaths: [],
        publicPaths: [],
        dbconfig: {
            storage: 'database.sqlite',  // PostgreSQL user
            dialect: 'sqlite',          // Specify PostgreSQL dialect
            logging: false              // Optional: Disable logging SQL queries
        },
        autoEnableStacks: true, //Automatically enable all discovered stacks.
        isConfigured: false, //This tracks if a configuration has been created. Mainly to confirm the database path/type and distributed processing settings.
        webServer: 'full', //Options are "full", "api", "none". This is the default setting. The web server will be started if this is set to "full" or "api".
        webServerPort: 3002, //The port for the web server. This is separate from the API server port.
    };


    constructor(configuration) {
        if (!configuration) configuration = {}; //If no config is passed, set it to an empty object.        
        this.configuration = { ...this.configuration, ...configuration }; // Merge the default configuration with the provided configuration
        //This modifies the default configuration object. Ideally the configuration is passed to the initialize function instead of the constructor.
    }

    /*
     * Initializes the HotspringServer instance with the provided configuration and database connection. Handles the loading of all stacks, initialization of the models and starts the web server and/or job server if specified in the config.
     * @param {string} appRoot The root directory of the application.
     * @param {object} config The configuration object. If not provided, it will be loaded from config.json in the appRoot.
     * @returns {hotspringServer} A hotspringServer object that is fully running.
     * @throws {Error} If there is an error loading the configuration or initializing the database connection.
     */
    static async initialize(config) {
        const thisInstance = new HotspringServer();
        // #region Load the configuration from default, disk, database (If database is valid)
        let appRoot = thisInstance.configuration.appRoot; //This is the default appRoot. It is set to the location of this module.

        if (!config) config = {}; //If no config is passed, set it to an empty object.
        if (config.appRoot) appRoot = config.appRoot; //If the appRoot is passed in the configuration, use it instead of the default if supplied.

        try {
            // Load config.json from appRoot if it exists
            const configPath = path.join(appRoot, 'config.json');
            let fileConfig = {};
            if (await checkFileExists(configPath)) {
                try {
                    fileConfig = JSON.parse(await fs.readFile(configPath, 'utf-8'));
                } catch (error) {
                    console.error('Error reading config.json. Using default configuration:', error);
                    //This is a valid scenario so we aren't throwing an error. Just making sure the user knows that the config.json file is invalid or missing.
                }
            } else {
                console.error('config.json missing. Using default configuration.');
                //This is a valid scenario so we aren't throwing an error. Just making sure the user knows that the config.json file is invalid or missing.
            }

            // Merge configurations in the correct order of precedence
            thisInstance.configuration = {
                ...thisInstance.configuration, // Default configuration
                ...fileConfig,         // Configuration from config.json
                ...config              // Configuration passed to initialize
            };

            // Ensure the database configuration is set
            if (!thisInstance.configuration.dbconfig) {
                console.error('Database configuration is missing!');
                throw new Error('Database configuration is required.');
            }

            //Initialize and test the database Connection.
            try {
                // Implementation for initializing the database
                thisInstance.sequelize = new Sequelize(thisInstance.configuration.dbconfig);

                // Test the connection
                await (async () => {
                    try {
                        await thisInstance.sequelize.authenticate();
                        console.log('Database connection has been established successfully.');
                    } catch (error) {
                        console.error('Unable to connect to the database:', error);
                        throw error;
                    }
                })();
            } catch (error) {
                console.error('Error initializing database connection:', error);
                throw error;
            }

            // Now check if the database contains the system.hotspringConfiguration model and pull the data if so.
            // We will use SQL for this instead of the actual model since the stacks aren't initialized yet.
            // TODO: Check if system_hotspringConfiguration table exists.
            // TODO: Pull all the data from the system_hotspringConfiguration table.

            // Check if the default stack root is set. If not, set it to the default location.
            if (!thisInstance.configuration.defaultStackRoot) 
                thisInstance.configuration.defaultStackRoot = path.join(thisInstance.configuration.appRoot, 'stacks');
        } catch (error) {
            console.error('Error loading configuration:', error);
            throw error;
        }

        console.log('Configuration initialized:', thisInstance.configuration);
        // #endregion

        // #region Load and enable the builtin stacks. This part is critical.

        // Load stacks from the builtin path.
        try {

            const builtinStackPath = path.join(thisInstance.configuration.coreModulePath, 'stacks_builtin');
            await thisInstance.loadStacksFromPathAll(builtinStackPath);
        } catch (error) {
            console.error('Error loading builtin stacks:', error);
            throw error;
        }

        // Load stacks from the appRoot path if it exists.
        try {
            const appStackPath = thisInstance.configuration.defaultStackRoot;
            if (await checkFolderExists(appStackPath))
                await thisInstance.loadStacksFromPathAll(appStackPath);
        } catch (error) {
            console.error('Error loading application stacks from default folder:', error);
            throw error;
        }

        //Load any stacks from the configured StackPaths.
        try {
            for (stackPath of thisInstance.configuration.stackPaths) {
                if (await checkFolderExists(stackPath))
                    await thisInstance.loadStacksFromPathAll(stackPath);
            }
        } catch (error) {
            console.error('Error loading application stacks from configuration file:', error);
            throw error;
        }
        // #endregion

        //I'm changing the philosophy of how stacks are loaded. All stacks will be enabled and activated.
        
        // #region Activate stacks
        await thisInstance.stacks['system'].activate(); //Activate the system stack. It is required for the system stack to be loaded for database access to work..
        thisInstance.stacks['system'].isEnabled = true; //Enable the system stack. This is required for the system stack to be loaded.
        //The Stacks model is required for the next step.
        thisInstance.stacks['system'].models['stack'].sequelizeObject.sync({  }); //Sync the stacks model. This is required for the system stack to be loaded.
        
        //Loop through the stacks and load database model for each.
        for (const stackName in thisInstance.stacks) {
            const stack = thisInstance.stacks[stackName];
            await stack.loadDatabaseObject_partial();
            if (stack.stackID == 0 && thisInstance.configuration.autoEnableStacks) 
                stack.isEnabled=true; //If this stack isn't in the database and autoEnable is true, enable it.
            await stack.updateDatabaseObject(); //Update the stack in the database. Mainly applies when the stack is new or at first launch.

            if (stack.isEnabled) {
                await stack.activate(true); //Activate the stack but wait to sync the database until all stacks are loaded.
            }
        }

        await thisInstance.manageStacks(); // manageStacks handles the relationships and data seeding.

        // #endregion

        // #region Initialize the web server if specified in the configuration.

        //Start the webserver if the configuration says this should be a webserver.
        thisInstance.configuration.webServer = thisInstance.configuration.webServer || 'full'; //Default to full if not set.
        if (thisInstance.configuration.webServer !== 'none') {
            thisInstance.webServer = new HotspringWebServer(thisInstance);
            await thisInstance.webServer.initializeWebApp(thisInstance.configuration.webServer, thisInstance.configuration.webServerPort);
        }

        // #endregion

        console.log('Initialized stacks from configuration file.');

        return thisInstance;
    }

    /*
     * Scans the specified directory for subfolders containing stack definitions and loads them into supplied hotspring object.
     * @param {string} absolutePath The absolute path to the directory containing stack subfolders.
     * @param {HotspringGlobal} hotspring The HotspringGlobal object to load stacks into.
     * @returns {Promise<void>} A promise that resolves when all stacks have been loaded. No data is returned because information is written to the hotspring object.
     * @throws {Error} If there is an error reading the directory or loading a stack definition.
     */
    async loadStacksFromPathAll(absolutePath) {
        if (!absolutePath) {
            console.error('No path provided to load stacks from.');
            return;
        }
        try {
            const subfolders = await fs.readdir(absolutePath, { withFileTypes: true });
            for (const subfolder of subfolders) {
                if (subfolder.isDirectory()) {
                    const stackDefinitionPath = path.join(absolutePath, subfolder.name, 'stackDefinition.json');
                    try {

                        let thisStack = await HotspringStack.loadStackFromPath(path.join(subfolder.parentPath, subfolder.name), this);
                        if (!thisStack) continue;
                        thisStack.hotspring = this; // Set the hotspring object for the stack.
                        thisStack.isEnabled = true;
                        this.stacks[thisStack.stackName] = thisStack;
                    } catch (err) {
                        this.stackLoadErrors[subfolder.name] = err;
                        // If the file doesn't exist or there's an error reading it, we can skip this subfolder
                        console.error(`Error loading stack from ${stackDefinitionPath}:`, err);
                    }
                }
            }
        } catch (err) {
            console.error(`Error reading directory ${absolutePath}:`, err);
        }
        //await this.manageStacks();
    }

    async manageStacks() {
        // Loop through all the stacks to add Models to sequelize if the stack is enabled.
        for (const stackName in this.stacks) {
            const stack = this.stacks[stackName];
            if (stack.isEnabled) {
                await stack.activate(true); //Activate the stack and add the models to sequelize. But don't sync the database yet.
            } else {
                await stack.deactivate(); //Deactivate the stack and remove the models from sequelize.
            }
        }

        //Loop through the stacks to define the relationships.
        for (const stackName in this.stacks) {
            const stack = this.stacks[stackName];
            if (stack.isEnabled) {
                for (const modelName in stack.models) {
                    const model = stack.models[modelName];
                    console.log('Syncing ' + model.stackName + '.' + modelName);
                    for (const connection of model.sequelizeConnections) {
                        let parentModel = this.models[connection.parentmodel]; //This is the same as model.
                        let childModel = this.models[connection.childmodel]; //This is the child.                        
                        let peerModel = null
                        if (connection.peerModel)
                            peerModel = this.models[connection.peerModel]; //This is the peer which is only used in MM relationships.                        

                        if (connection.connectionType === '11') {
                            console.log('Forming One-to-One connection of ' + connection.parentmodel + ' <-> ' + connection.childmodel);
                            //Check that all models were found.
                            if (!parentModel) {
                                console.error('Parent model ' + connection.parentmodel + ' not found!!!');
                                continue;
                            }
                            if (!childModel) {
                                console.error('Child model ' + connection.childmodel + ' not found!!!');
                                continue;
                            }

                            //Make the connection
                            childModel.sequelizeObject.belongsTo(parentModel.sequelizeObject, { foreignKey: connection.childParentKey });
                            parentModel.sequelizeObject.hasOne(childModel.sequelizeObject, { foreignKey: connection.childParentKey });
                        } else if (connection.connectionType === '1M') {
                            console.log('Forming One-to-Many connection of ' + connection.parentmodel + ' <-> ' + connection.childmodel);
                            //Check that all models were found.
                            if (!parentModel) {
                                console.error('Parent model ' + connection.parentmodel + ' not found!!!');
                                continue;
                            }
                            if (!childModel) {
                                console.error('Child model ' + connection.childmodel + ' not found!!!');
                                continue;
                            }

                            //Make the connection
                            childModel.sequelizeObject.belongsTo(parentModel.sequelizeObject, { foreignKey: connection.childParentKey });
                            parentModel.sequelizeObject.hasMany(childModel.sequelizeObject, { foreignKey: connection.childParentKey });
                        } else if (connection.connectionType === 'MM') {
                            //Check that all models were found.
                            console.log('Forming Many-to-Many connection of ' + connection.parentmodel + ' <-> ' + connection.childmodel + ' <-> ' + connection.peerModel);
                            if (!parentModel) {
                                console.error('Parent model ' + connection.parentmodel + ' not found!!!');
                                continue;
                            }
                            if (!childModel) {
                                console.error('Child model ' + connection.childmodel + ' not found!!!');
                                continue;
                            }
                            if (!peerModel) {
                                console.error('Peer model ' + connection.peerModel + ' not found!!!');
                                continue;
                            }

                            //Make the connection
                            parentModel.sequelizeObject.belongsToMany(peerModel.sequelizeObject, { through: childModel.sequelizeObject, foreignKey: connection.childParentKey, otherKey: connection.childPeerKey });
                            peerModel.sequelizeObject.belongsToMany(parentModel.sequelizeObject, { through: childModel.sequelizeObject, foreignKey: connection.childPeerKey, otherKey: connection.childParentKey });
                        }
                    }
                }
            }
        }

        //Sync the entire model
        await this.sequelize.sync({ });

        //Seed the Data
        for (const stackName in this.stacks) {
            const stack = this.stacks[stackName];
            if (stack.isEnabled) {
                // If the sequelize supports proper schemas, create the schema.
                for (const modelName of stack.modelsToSeed) {
                    const model = stack.models[modelName];                    
                    if (model.seedData) {
                        const itemCount = await model.sequelizeObject.count();
                        if (itemCount > 0) {
                            console.log(modelName + ' already exists, skipping seeding.');
                            continue;
                        }
                        console.log('Seeding ' + model.stackName + '.' + modelName);
                        for (const item of model.seedData) {
                            await model.sequelizeObject.create(item);
                        }
                    }
                }
            }
        }
        for (const stackName in this.stacks) {
            const stack = this.stacks[stackName];
            if (stack.isEnabled) {
                await stack.addMenuItems();
            } else {
                await stack.disableMenuItems();
            }
        }

  


    }
};
module.exports = { HotspringServer };

// stackPaths: [path.resolve(__dirname, '../../stacks'), //Application Root
//     path.resolve(__dirname, 'stacks_builtin')], //Builtin Files
// publicPaths: [path.resolve(__dirname, '../../public'), //Application Root
//     path.resolve(__dirname, 'public_builtin')] //Builtin Files