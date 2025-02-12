const Sequelize = require('sequelize');
const path = require('path');

class HotspringGlobal {
    stacks = {};
    models = {};
    jobs = {};
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
    

    async manageStacks() {
        // Loop through all the stacks to add ObjectTypes to sequelize if the stack is enabled.
        for (const stackName in global.hotspring.stacks) {
            const stack = global.hotspring.stacks[stackName];
            if (stack.enabled) {
                stack.activate();
            } else {
                stack.deactivate();
            }
        }

        //Seed the Data
        for (const stackName in global.hotspring.stacks) {
            const stack = global.hotspring.stacks[stackName];            
            if (stack.enabled) {
                // If the sequelize supports proper schemas, create the schema.
                if (stack.objectTypes.count > 0) {
                    await global.hotspring.ensureSchemaExists(global.hotspring.sequelize, stack.stackName);
                }
                for (const objectTypeName in stack.objectTypes) {
                    const objectType = stack.objectTypes[objectTypeName];
                    await objectType.sequelizeObject.sync({ alter: true }); //Sync the table.
                    if (objectType.seedData) {
                        const itemCount = await objectType.sequelizeObject.count();
                        if (itemCount > 0) {
                            console.log(objectTypeName + ' already exist, skipping seeding.');
                            continue;
                        }
                        for (const item of objectType.seedData) {
                            await objectType.sequelizeObject.create(item);
                        }
                    }
                }
            }
        }
    }

    async fetchData(sequelizeObject, filter, sortOrder, page, pageSize) {
        const offset = (page - 1) * pageSize;
        const limit = pageSize;

        // Construct the where clause
        const where = filter ? parseSqlLikeWhere(filter) : {};

        // Construct the order clause
        let order = [];
        if (sortOrder) {
            order = sortOrder.split(',').map(order => {
                const [field, direction] = order.trim().split(/\s+/);
                return [field, direction.toUpperCase() || 'ASC'];
            });
        }

        // Construct the options object dynamically
        const options = {
            where,
            order, // Adjust the sort field as needed
        };

        if (limit !== 0) {
            options.offset = offset;
            options.limit = limit;
        }

        const { count, rows } = await sequelizeObject.findAndCountAll(options);

        return { total: count, items: rows };
    }
};
module.exports = { HotspringGlobal };

// stackPaths: [path.resolve(__dirname, '../../stacks'), //Application Root
//     path.resolve(__dirname, 'stacks_builtin')], //Builtin Files
// publicPaths: [path.resolve(__dirname, '../../public'), //Application Root
//     path.resolve(__dirname, 'public_builtin')] //Builtin Files