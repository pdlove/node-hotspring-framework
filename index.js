const { HotspringStack } = require('./lib/hotspringStack');
const { HotspringClientPackage } = require('./lib/hotspringClientPackage');
const { HotspringModel, DataTypes } = require('./lib/HotspringModel');
const { HotspringRoute } = require('./lib/hotspringRoute');
const { HotspringWebServer } = require('./lib/hotspringWebServer');
const { HotspringServer } = require('./lib/hotspringServer');
const { HotspringJob } = require('./lib/hotspringJob');
const { Op, Sequelize } = require('sequelize');

async function hotspring_Initalization(configuration, startWebServer){
  let myHotspring = await HotspringServer.initialize({ appRoot: __dirname});
myHotspring=null;



  // //Load Stacks
  // await HotspringStack.loadAll();
  
  // // Force the system stack to be enabled.
  // await global.hotspring.stacks['system'].activate();
  // await global.hotspring.manageStacks(); //Ensures that the system stack gets installed to the database.
    
  // // Loop through all stacks and run the loadDatabaseObject function for each stack.
  // // If the stackId is not in the database, run updateDatabaseObject.
  // for (let stackName in global.hotspring.stacks) {  
  //   const stack = global.hotspring.stacks[stackName];
  //   await stack.loadDatabaseObject_partial();
  //   if (stack.stackId == 0) await stack.updateDatabaseObject();
  // }
  
  // // Sync the database now that we've determined what other stacks are enabled.
  // await global.hotspring.manageStacks();
    
  // if (startWebServer) {
  //   this.webServer = new HotspringWebServer();
  //   this.webServer.initializeWebApp(global.hotspring.configuration.webPort);
  // }
}



module.exports = { HotspringStack, HotspringClientPackage, HotspringModel, HotspringServer, DataTypes, HotspringRoute, hotspring_Initalization, HotspringJob, Op, Sequelize };

