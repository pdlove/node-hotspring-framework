const fs = require('fs').promises;
const path = require('path');
const Sequelize = require('sequelize');
const { checkFileExists } = require('./util');
const { HotspringClientPackage } = require('./hotspringClientPackage');
const exp = require('constants');



class HotspringStack {
  stackId = 0;
  isEnabled = false;
  isActive = false;
  stackName = '';
  description = '';
  stackPath = '';
  configuration = {};
  dependsOnStacks = []; //Array of stack names that this stack depends on.

  clientPackages = {};
  models = {};
  objectViews = {};
  routes = {};
  jobClasses = {};
  otherFiles = {};
  menuItems = [];

  modelsToSeed = [];
  hotspring = null;

  constructor(hotspring) {
    if (hotspring) {
      this.hotspring = hotspring;
    }
  }
  // #region Load Stacks from Disk
  /*
     * Loads a single stack from the specified path and returns a HotspringStack object.
     * @param {string} stackPath - The path to the stack folder.
     * @param {HotspringGlobal} hotspring - The HotspringGlobal object to load the stack into.
     * @returns {Promise<HotspringStack>} - A promise that resolves to the loaded HotspringStack object.
     * @throws {Error} - Throws an error if the stack definition file is missing or if there are issues loading the stack.
     */
  static async loadStackFromPath(stackPath, hotspring) {
    // Path Cleanup
    if (!stackPath) {
      throw new Error("No stack path provided.");
    }
    if (!path.isAbsolute(stackPath)) { // Search a relative path from the default stack root)
      console.error("Stack path must be absolute: " + stackPath);
      throw new Error("Stack path must be absolute: " + stackPath);
    }

    const definitionPath = path.join(stackPath, 'stackDefinition.json');

    /*The gist of this....
    The full folder list is fetched relative to the root of the stack.
    All definitions.json files are processed as Client Packages. Client Packages will consume multiple files
    Client Packages have multiple files and everything is packaged up with a definitions.json file. This file determines what each of the files in the folder is used for.
    The object types that fall under this are: "client_blocks" and "client_panels".
    If a folder called "grid" has a "definition.json" file then it is assumed to be one of these datatypes.
    If a folder contains a subfolder then that subfolder is also searched for a definition.json.
    If you have a stack called "ui", folder "grid" will have an identifier of "ui.grid"
    If grid also has a subfolder called "tree" then the identifier will be "ui.grid.tree"
    
    jobs, models and routes work by enumerating all .js files and looking for a specific object type being exported.
    
    
    
    */
    let newStack = null;

    // Load the stackDefinition.json file into a new stack object.
    if (!(await checkFileExists(definitionPath))) {
      console.warn("Stack Definition file missing: " + definitionPath);
      return null;
    }

    try {
      // Read the JSON content
      const jsonData = JSON.parse(await fs.readFile(definitionPath, 'utf8'));

      newStack = new HotspringStack(hotspring);
      newStack.stackPath = stackPath;
      if (jsonData.stackName) newStack.stackName = jsonData.stackName.toLowerCase();
      if (jsonData.description) newStack.description = jsonData.description;
      if (jsonData.configuration) newStack.configuration = jsonData.configuration;
      if (jsonData.dependsOnStacks) newStack.dependsOnStacks = jsonData.dependsOnStacks;
      if (jsonData.menuItems) newStack.menuItems = jsonData.menuItems;
      if (jsonData.modelsToSeed) newStack.modelsToSeed = jsonData.modelsToSeed;
    } catch (error) {
      console.error("Error loading stackDefinition.json: " + error);
      throw new Error("Error loading stackDefinition.json: " + error);
    }

    // Get a list of all files contained in the stack. This is used to load client packages and other files as well as track files that aren't used.
    let clientPackagePaths = [];
    let javascriptFiles = [];

    try {
      const allFiles = await fs.readdir(path.join(stackPath), { recursive: true, withFileTypes: true });
      for (const file of allFiles) {
        if (file[Object.getOwnPropertySymbols(file)[0]] === 1) { // This is a file.
          if (!file.parentPath) file.parentPath = file.path; // Backwards Compatability for node 18.
          if (path.basename(file.name) == 'definition.json') clientPackagePaths.push(file.parentPath); // This is a client package definition file.
          // Check if the file is a JavaScript file and not under a client package path
          const isUnderClientPackage = clientPackagePaths.some(clientPath =>
            (file.parentPath).startsWith(clientPath)
          );
          if (path.extname(file.name) === '.js' && !isUnderClientPackage) {
            javascriptFiles.push(path.join(file.parentPath, file.name)); // This is a JavaScript file not under a client package path.
          }
        }
      }
    } catch (error) {
      console.error("Unable to get stack file list: " + error);
      throw new Error("Unable to get stack file list: " + error);
    }


    //Load Client Packages
    //for   
    try {
      // Look for definition.json files. These are currently only associated with client packages.
      for (const packagePath of clientPackagePaths) {
        let pkgDefinition = path.join(packagePath, 'definition.json');
        let thisPackage = null;
        try {
          thisPackage = await HotspringClientPackage.loadDefinition(pkgDefinition, newStack.stackName);
        } catch (error) {
          console.warn(`Failed to load client package ${file}: ${error.message}`);
          continue;
        }
        thisPackage.stackName = newStack.stackName;
        thisPackage.fullName = newStack.stackName + '.' + thisPackage.packageName;
        newStack.clientPackages[thisPackage.packageName] = thisPackage;
      }
    } catch (error) {
      console.error("Unable to load Client Packages from Stack: " + error);
      throw new Error("Unable to load Client Packages from Stack: " + error);
    }

    let classList = [];
    // Get list of other javascript files and parse class information of the export.
    for (const file of javascriptFiles) {
      try {
        const exported = require(file);

        if (typeof exported === 'function' && /^class\s/.test(exported.toString())) {
          // Handle the case where a class is directly assigned to module.exports
          const className = exported.name || 'AnonymousClass';
          const baseClass = Object.getPrototypeOf(exported.prototype)?.constructor?.name || null;
          classList.push({ file, className, baseClass, exported });
        } else if (typeof exported === 'object' && exported !== null) {
          // Handle the case where an object is exported with multiple classes
          for (const key in exported) {
            const potentialClass = exported[key];
            if (typeof potentialClass === 'function' && /^class\s/.test(potentialClass.toString())) {
              const className = potentialClass.name || 'AnonymousClass';
              const baseClass = Object.getPrototypeOf(potentialClass.prototype)?.constructor?.name || null;
              classList.push({ file, className, baseClass, exported: potentialClass });
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to process file ${file} in stack ${newStack.stackName}: ${error.message}`);
      }
    }
    try {
      // Now we need to loop through classList and do something different depending on baseClass.
      //TODO: We need to make sure Model, Route and Job are all passed the hotspring object. That said, it needs to happen when an instance is created..
      for (const cls of classList) {
        try {
          if (cls.baseClass == 'HotspringModel') {
            // This is an object type.
            let newmodel = cls.exported;
            newmodel.stackName = newStack.stackName;
            newmodel.stack = newStack;
            newStack.models[newmodel.modelName] = newmodel;
            newStack.hotspring = newStack.hotspring;
            const routeList = newmodel.apiRoutes();
            for (const route of routeList) {
              newStack.routes[route.method + '!' + route.path] = route;
            }
            console.log("Loaded Object Type: " + newStack.stackName + "." + newmodel.name);
          }
          if (cls.baseClass == 'HotspringRoute') {
            // This is a route.
            let newRoute = new cls.exported();
            newRoute.stackName = newStack.stackName;
            newRoute.stack = newStack;
            newRoute.hotspring = newStack.hotspring;
            const routeList = newRoute.apiRoutes();            
            for (const route of routeList) {
              newStack.routes[route.method + '!' + route.path] = route;
            }
          }
          if (cls.baseClass == 'HotspringJob') {
            // This is a route.
            newStack.jobClasses[cls.className] = cls.exported;
            newStack.jobClasses[cls.className].stackName = newStack.stackName;
            newStack.jobClasses[cls.className].stack = newStack;
            newStack.jobClasses[cls.className].hotspring = newStack.hotspring;
          }
        }
        catch (error) {
          console.warn(`Failed to process class ${cls.className} in stack ${newStack.stackName}: ${error.message}`,);
        }
      }
      console.log('Loaded Stack: ' + newStack.stackName);
      return newStack;
    } catch (error) {
      console.error('Unable to process classes: ' + error);
      throw new Error('Unable to process classes: ' + error);
    }
    return null;
  }
  // #endregion Load Stacks from Disk
  
  // #region Database Functions
  async loadDatabaseObject_partial() {
    
    //Use this.hotsprings.sequelize to use the system.stack model and update the database.
    const model = this.hotspring.models['system.stack']
    const dbObject = await model.browseObjects({ filter: { stackName: this.stackName } });
    if (dbObject.length > 0) {
      this.stackId = dbObject[0].stackId;
      this.isEnabled = dbObject[0].isEnabled;
    }
  }
  async updateDatabaseObject() {
    //Use this.hotsprings.sequelize to use the system.stack model and update the database.
    const dbInterface = this.hotspring.models['system.stack'].sequelizeObject
    let dbObject = await dbInterface.findOne({ where: { stackName: this.stackName } });
    if (!dbObject) {
      dbObject = await dbInterface.create({ stackName: this.stackName, description: this.description, isEnabled: this.isEnabled, localPath: this.stackPath });
    } else {
      await dbObject.update({ stackName: this.stackName, description: this.description, isEnabled: this.isEnabled, localPath: this.stackPath });
    }
    if (this.stackId == 0) this.stackId = dbObject.stackId;
  }

  // #endregion Database Functions


  // #region Stack Management Functions
  async activate() {
    //Code to enable a stack. This should be called when the stack is loaded and ready to be used.
    //databaseWait causes the sync to wait for all stacks to load. This ensures that all relationships form at the same time during the initial load.

    for (const model in this.models) {
      this.models[model].sequelizeDefine(this.hotspring.sequelize, Sequelize.DataTypes);
      this.hotspring.models[this.stackName + '.' + model] = this.models[model];
    }

    for (const job in this.jobClasses) {
      //If this is a service, make sure it is started
      this.hotspring.jobClasses[this.stackName + '.' + job] = this.jobClasses[job];
    }
    for (const clientPackage in this.clientPackages) {
      //Is there any initialization code that needs to be run?
      this.hotspring.clientPackages[this.stackName + '.' + clientPackage] = this.clientPackages[clientPackage];
    }
    for (const apiRoutes in this.routes) {
      let thisRoute = this.routes[apiRoutes];
      if (thisRoute.isAPI)
        thisRoute.resolvedRoute = '/api/' + this.stackName + '/' + thisRoute.path
      else
        thisRoute.resolvedRoute = thisRoute.path;
      thisRoute.stackName = this.stackName; //This should probably be when the routes are first fetched.
      thisRoute.loaded = false;

      //Start by creating the routes object for the Operation.
      if (!this.hotspring.routes[thisRoute.method]) this.hotspring.routes[thisRoute.method] = { route: null, params: [] };

      let curPosition = this.hotspring.routes[thisRoute.method]; // Set our current route to the operation object.

      //Break up the route into the parts so we can create the iterative objects
      const routeParts = thisRoute.resolvedRoute.split('/');
      for (let i = 0; i < routeParts.length; i++) {
        const part = routeParts[i];
        if (!part) continue;
        if (part[0] == ':') {
          //This is a parameter
          curPosition.params.push(part.substring(1));
        } else {
          //If it isn't a parameter then create and move to the next iteration (as needed)
          if (!curPosition[part]) curPosition[part] = { route: null, params: [] };
          curPosition = curPosition[part];
          curPosition.params = [];
        }
      }
      curPosition.route = thisRoute;
      thisRoute.loaded = true;
    }
    this.isEnabled = true;
  }

  async addMenuItems() {
    const menuModel = this.hotspring.models['system.menu'];
    for (const menuEntry of this.menuItems) {
      // Split by ">" and trim spaces
      const pathing = menuEntry.menuPath.split(">")
      let menuItem = null;

      for (const path of pathing) {
        const filter = { name: path.trim(), parent_menu_id: menuItem ? menuItem.menuID : null };
        let menuResult = await menuModel.browseObjects({ filter });
        if (menuResult.length == 0) {
          menuItem = await menuModel.addObject({ stackID: null, name: path.trim(), displayText: path.trim(), parent_menu_id: menuItem ? menuItem.menuID : null });
        } else {
          menuItem = menuResult[0];
        }
      }
      const filter = { name: menuEntry.name, stackID: this.stackId };
      let menuResult = await menuModel.browseObjects({ filter });
      let menuDBItem = null;
      if (menuResult.length == 0) {
        menuDBItem = await menuModel.addObject({
          stackID: this.stackId,
          name: menuEntry.name, displayText: menuEntry.displayText, parent_menu_id: menuItem.menuID,
          clientPackage: menuEntry.clientPackage, clientPackageParameters: menuEntry.clientPackageParameters
        });
      } else {
        menuDBItem = menuResult[0];
      }
      menuDBItem.isEnabled = true;
      // { "name": "users", "displayText": "User Security", "menuPath": "Administration", "defaultGroup": "admin", "clientPackage": "system.user-management", "clientPackageParameters": { } },
      // { "name": "platform", "displayText": "Platform Configuration", "menuPath": "Administration>Security", "defaultGroup": "admin", "clientPackage": "system.platform-config", "clientPackageParameters": { } },
      // { "name": "Raw Data", "displayText": "Raw Data", "menuPath": "Debug", "defaultGroup": "admin", "clientPackage": "system.uiMenu", "clientPackageParameters": { "subMenu": "models" } }
    }

  }
  async deactivate() {
    //Code to disable a stack. Do NOT delete data.
  }

  async destroy() {
    //Delete the associate Data
    this.deactivate();
  }

  // #endregion Stack Management Functions
}



module.exports = { HotspringStack };