const { HotspringStack } = require('./lib/hotspringStack');
const { HotspringClientPackage } = require('./lib/hotspringClientPackage');
const { HotspringObjectType, DataTypes } = require('./lib/HotspringObjectType');
const { HotspringRoute } = require('./lib/hotspringRoute');
const { HotspringWebServer } = require('./lib/hotspringWebServer');
const { HotspringGlobal } = require('./lib/hotspringGlobal');

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



module.exports = { HotspringStack, HotspringClientPackage, HotspringObjectType, DataTypes, HotspringRoute, hotspring_Initalization };

// // Mapping SQL operators to Sequelize operators
// const operatorsMap = {
//   '>': Op.gt,
//   '>=': Op.gte,
//   '<': Op.lt,
//   '<=': Op.lte,
//   '=': Op.eq,
//   '!=': Op.ne,
//   'LIKE': Op.like,
//   'IN': Op.in,
//   'NOT IN': Op.notIn,
// };

// // Regex for individual conditions (handles no spaces around operators)
// const conditionRegex = /(\w+)\s*(>=|<=|!=|>|<|=|LIKE|IN|NOT IN)\s*(\(.+?\)|'.+?'|\S+)/gi;

// // Function to parse SQL-like WHERE conditions
// const parseSqlLikeWhere = (sqlWhere) => {
//   // TODO: Revisit this. It's ChatGPT code and isn't working as expected. with (deviceID>1 AND SNMPVersion<2) OR (DeviceName='Router')

//   // Helper function to process individual conditions
//   const processCondition = (condition) => {
//     const match = condition.match(conditionRegex);
//     if (!match) throw new Error(`Invalid condition: "${condition}"`);
//     const [, key, operator, valueRaw] = conditionRegex.exec(condition);

//     let value = valueRaw.trim();
//     if (value.startsWith("'") && value.endsWith("'")) {
//       value = value.slice(1, -1); // Remove quotes for strings
//     } else if (value.startsWith('(') && value.endsWith(')')) {
//       value = value
//         .slice(1, -1)
//         .split(',')
//         .map((v) => v.trim().replace(/^'|'$/g, '')); // Parse IN list
//     } else if (!isNaN(value)) {
//       value = Number(value); // Parse numbers
//     }

//     return { [key]: { [operatorsMap[operator]]: value } };
//   };

//   // Recursive function to handle parentheses
//   const parseExpression = (expression) => {
//     expression = expression.trim();

//     // Handle parentheses
//     while (expression.includes('(')) {
//       expression = expression.replace(/\(([^()]+)\)/g, (_, inner) => {
//         const parsed = parseExpression(inner);
//         return JSON.stringify(parsed); // Temporarily replace the inner condition with JSON
//       });
//     }

//     // Split by logical operators (AND, OR)
//     const orParts = expression.split(/\s+OR\s+/i).map((part) => part.trim());
//     if (orParts.length > 1) {
//       return { [Op.or]: orParts.map((part) => parseExpression(part)) };
//     }

//     const andParts = expression.split(/\s+AND\s+/i).map((part) => part.trim());
//     if (andParts.length > 1) {
//       return { [Op.and]: andParts.map((part) => parseExpression(part)) };
//     }

//     // Process individual condition
//     return processCondition(expression);
//   };

//   return parseExpression(sqlWhere);
// };
