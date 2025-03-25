const { HotspringStack } = require('./lib/hotspringStack');
const { HotspringClientPackage } = require('./lib/hotspringClientPackage');
const { HotspringModel, DataTypes } = require('./lib/HotspringModel');
const { HotspringRoute } = require('./lib/hotspringRoute');
const { HotspringWebServer } = require('./lib/hotspringWebServer');
const { HotspringGlobal } = require('./lib/hotspringGlobal');
const { HotspringJob } = require('./lib/hotspringJob');
const { Op, Sequelize } = require('sequelize');

async function hotspring_Initalization(configuration, startWebServer){
   global.hotspring = new HotspringGlobal(configuration);
   
    //Initialize database (Should load it from the config File)

      // Initialize the database connection.
  // await global.hotspring.initializeDatabase({
  //   username: 'meadserver',    // PostgreSQL user
  //   password: 'YoMomma',       // PostgreSQL password
  //   database: 'mead',          // Database name
  //   host: '10.17.1.21',        // Database host
  //   dialect: 'postgres',       // Specify PostgreSQL dialect
  //   port: 5432,                // PostgreSQL port (default is 5432)
  //   logging: false              // Optional: Disable logging SQL queries
  // });

  await global.hotspring.initializeDatabase(global.hotspring.configuration.dbconfig);



    //Load Stacks
    await HotspringStack.loadAll();
  
    // Force the system stack to be enabled.
    await global.hotspring.stacks['system'].activate();
    await global.hotspring.manageStacks(); //Ensures that the system stack gets installed to the database.
    
    // Loop through all stacks and run the loadDatabaseObject function for each stack.
    // If the stackId is not in the database, run updateDatabaseObject.
    for (let stackName in global.hotspring.stacks) {  
      const stack = global.hotspring.stacks[stackName];
      await stack.loadDatabaseObject_partial();
      if (stack.stackId == 0) await stack.updateDatabaseObject();
    }
  
    // Sync the database now that we've determined what other stacks are enabled.
    await global.hotspring.manageStacks();
    
    if (startWebServer) {
      this.webServer = new HotspringWebServer();
      this.webServer.initializeWebApp(global.hotspring.configuration.webPort);
    }
}



module.exports = { HotspringStack, HotspringClientPackage, HotspringModel, DataTypes, HotspringRoute, hotspring_Initalization, HotspringJob, Op, Sequelize };

