const Sequelize = require('sequelize');
const path = require('path');

class HotspringGlobal {
    stacks = {};
    models = {};
    jobClasses = {};
    routes = {};
    clientPackages = {};

    stackLoadErrors = {};
    sequelize = null;
    configuration = {
        appRoot: path.resolve(__dirname, '../../../'),
        coreModulePath: path.resolve(__dirname, '../'),
        stackPaths: [],
        publicPaths: [],
        webPort: 3002,
        dbconfig: {
            storage: 'database.sqlite',  // PostgreSQL user
            dialect: 'sqlite',          // Specify PostgreSQL dialect
            logging: false              // Optional: Disable logging SQL queries
        }
    };

    constructor(configuration) {
        this.configuration = { ...this.configuration, ...configuration };
    }

    async initializeDatabase(config) {
        // Implementation for initializing the database
        this.sequelize = new Sequelize(config);

        // Test the connection
        await (async () => {
            try {
                await this.sequelize.authenticate();
                console.log('Connection has been established successfully.');
            } catch (error) {
                console.error('Unable to connect to the database:', error);
            }
        })();
    }

    async ensureSchemaExists(sequelize, schemaName) {
        const dialect = sequelize.getDialect();
        const queryInterface = sequelize.getQueryInterface();

        let createSchemaSQL = '';

        switch (dialect) {
            case 'postgres':
            case 'cockroachdb':
                createSchemaSQL = `CREATE SCHEMA IF NOT EXISTS "${schemaName}"`;
                break;

            case 'mssql':
                createSchemaSQL = `
                    IF NOT EXISTS (SELECT * FROM sys.schemas WHERE name = '${schemaName}')
                    EXEC('CREATE SCHEMA ${schemaName}')
                `;
                break;

            case 'ibmi': // IBM DB2
                createSchemaSQL = `
                    BEGIN
                        DECLARE CONTINUE HANDLER FOR SQLSTATE '42710' BEGIN END;
                        EXECUTE IMMEDIATE 'CREATE SCHEMA ${schemaName}';
                    END;
                `;
                break;

            default:
                console.log(`Schema creation not supported for dialect: ${dialect}`);
                return;
        }

        try {
            await sequelize.query(createSchemaSQL);
            console.log(`Schema "${schemaName}" ensured for dialect: ${dialect}`);
        } catch (error) {
            console.error(`Error creating schema "${schemaName}" for dialect ${dialect}:`, error);
        }
    }

    //Do I ever put the model in global.hostpring.models

    async manageStacks() {
        // Loop through all the stacks to add Models to sequelize if the stack is enabled.
        for (const stackName in global.hotspring.stacks) {
            const stack = global.hotspring.stacks[stackName];
            if (stack.enabled) {
                await stack.activate();
            } else {
                await stack.deactivate();
            }
        }

        //Loop through the stacks to define the relationships.
        for (const stackName in global.hotspring.stacks) {
            const stack = global.hotspring.stacks[stackName];
            if (stack.enabled) {
                for (const modelName in stack.models) {
                    const model = stack.models[modelName];
                    console.log('Syncing ' + model.stackName + '.' + modelName);
                    for (const connection of model.sequelizeConnections) {
                        let parentModel = global.hotspring.models[connection.parentmodel]; //This is the same as model.
                        let childModel = global.hotspring.models[connection.childmodel]; //This is the child.                        
                        let peerModel = null
                        if (connection.peerModel)
                            peerModel = global.hotspring.models[connection.peerModel]; //This is the peer which is only used in MM relationships.                        

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

        // Make sure the schemas exist
        for (const stackName in global.hotspring.stacks) {
            const stack = global.hotspring.stacks[stackName];
            if (stack.enabled) {
                // If the sequelize supports proper schemas, create the schema.
                if (Object.keys(stack.models).length > 0) {
                    await global.hotspring.ensureSchemaExists(global.hotspring.sequelize, stack.stackName);
                }
            }
        }

        //Sync the entire model
        await global.hotspring.sequelize.sync({ alter: true });

        //Seed the Data
        for (const stackName in global.hotspring.stacks) {
            const stack = global.hotspring.stacks[stackName];
            if (stack.enabled) {
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
    }


};
module.exports = { HotspringGlobal };

// stackPaths: [path.resolve(__dirname, '../../stacks'), //Application Root
//     path.resolve(__dirname, 'stacks_builtin')], //Builtin Files
// publicPaths: [path.resolve(__dirname, '../../public'), //Application Root
//     path.resolve(__dirname, 'public_builtin')] //Builtin Files