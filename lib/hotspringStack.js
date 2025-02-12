const fs = require('fs').promises;
const path = require('path');
const Sequelize = require('sequelize');

const { HotspringClientPackage } = require('./hotspringClientPackage');
const exp = require('constants');

async function checkFolderExists(folderPath) {
  try {
    await fs.access(folderPath);
    return true;
  } catch (error) {
    return false;
  }
}

class HotspringStack {
  stackId = 0;
  enabled = false;
  name = '';
  description = '';
  stackPath = '';
  configuration = {};

  clientPackages = {};
  objectTypes = {};
  objectViews = {};
  routes = {};
  jobs = {};
  otherFiles = {};

  constructor() {
  }

  static async loadSingleFromPath(stackPath) {
    // Path Cleanup
    if (stackPath == '') {
      this.loadStacks_all(global.hotspring.configuration.defaultStackRoot);
    }
    if (!path.isAbsolute(stackPath)) { // Search a relative path from the default stack root)
      stackPath = path.resolve(global.hotspring.configuration.defaultStackRoot, stackPath);
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
    try {
      // Check if the file exists
      await fs.access(definitionPath);
    } catch (error) {
      console.warn("Stack Definition file missing: " + definitionPath);
      return;
    }
    try {
      // Read the JSON content
      const jsonData = JSON.parse(await fs.readFile(definitionPath, 'utf8'));

      newStack = new HotspringStack();
      newStack.stackPath = stackPath;
      if (jsonData.name) newStack.name = jsonData.name;
      if (jsonData.description) newStack.description = jsonData.description;
      if (jsonData.configuration) newStack.configuration = jsonData.configuration
    } catch (error) {
      console.error("Error loading stackDefinition.json: " + error);
      throw new Error("Error loading stackDefinition.json: " + error);
    }

    // Get a list of all files contained in the stack.
    let allFiles = [];
    let filesUsed = {};
    try {
      allFiles = await fs.readdir(path.join(stackPath), { recursive: true, withFileTypes: true });
      for (const file of allFiles) {
        if (file[Object.getOwnPropertySymbols(file)[0]] === 1) {
          if (!file.parentPath) file.parentPath = file.path; // Backwards Compatability for node 18.
          let relativePath = path.join(path.relative(stackPath, file.parentPath), file.name);
          filesUsed[relativePath] = false;
        }
      }
      filesUsed['stackDefinition.json'] = true; //Flag that we've used the stackDefinition file.
    } catch (error) {
      console.error("Unable to get stack file list: " + error);
      throw new Error("Unable to get stack file list: " + error);
    }

    //Load Client Packages
    try {
      // Look for definition.json files. These are currently only associated with client packages.
      for (const file in filesUsed) {
        if (path.basename(file) == 'definition.json') { // definition.json files contain information concerning client packages.
          let thisPackage = null
          try {
            thisPackage = await HotspringClientPackage.loadDefinition(path.join(stackPath, file), newStack.name);
          } catch (error) {
            console.warn(`Failed to load client package ${file}: ${error.message}`);
            continue;
          }
          let packageRelativePath = path.relative(stackPath, thisPackage.basePath)
          filesUsed[file] = true;
          for (const fname in thisPackage.cssFiles) {
            try {
              filesUsed[path.join(packageRelativePath, fname)] = true;
            } catch (error) {
              console.warn(`Client Package ${thisPackage.fullName} is missing file ${fname}: ${error.message}`);
            }
          }
          for (const fname in thisPackage.htmlFiles) {
            try {
              filesUsed[path.join(packageRelativePath, fname)] = true;
            } catch (error) {
              console.warn(`Client Package ${thisPackage.fullName} is missing file ${fname}: ${error.message}`);
            }
          }
          for (const fname in thisPackage.jsFiles) {
            try {
              filesUsed[path.join(packageRelativePath, fname)] = true;
            } catch (error) {
              console.warn(`Client Package ${thisPackage.fullName} is missing file ${fname}: ${error.message}`);
            }
          }
          for (const fname in thisPackage.ejsFiles) {
            try {
              filesUsed[path.join(packageRelativePath, fname)] = true;
            } catch (error) {
              console.warn(`Client Package ${thisPackage.fullName} is missing file ${fname}: ${error.message}`);
            }
          }
          for (const fname in thisPackage.otherFiles) {
            try {
              filesUsed[path.join(packageRelativePath, fname)] = true;
            } catch (error) {
              console.warn(`Client Packase ${thisPackage.fullName} is missing file ${fname}: ${error.message}`);
            }
          }
          newStack.clientPackages[thisPackage.name] = thisPackage;
          console.log("Loaded Client Package: " + thisPackage.fullName);
        }

      }
    } catch (error) {
      console.error("Unable to load Client Packages from Stack: " + error);
      throw new Error("Unable to load Client Packages from Stack: " + error);
    }

    let classList = [];
    // Get list of other javascript files and parse class information of the export.
    try {
      //Scan for Javascript files.
      for (const file in filesUsed) {
        if (filesUsed[file]) continue; //Skip this file if it has already been used
        if (path.extname(file) != '.js') {
          continue;
        }
        // At this point the file hasn't been used and is a javascript file.
        // Load all classes into classList and mark the base class of each. We'll then loop through this to determine types.
        try {
          const exported = require(path.join(stackPath, file));

          if (typeof exported === 'function' && /^class\s/.test(exported.toString())) {
            const className = exported.name || 'AnonymousClass';
            const baseClass = Object.getPrototypeOf(exported.prototype)?.constructor?.name || null;
            classList.push({ file, className, baseClass, exported });
          }
        } catch (error) {
          console.warn(`Failed to process file ${file}: ${error.message}`);
        }
      }
    } catch (error) {
      console.error("Unable to load classes from stack: " + error);
      throw new Error("Unable to load classes from stack: " + error);
    }

    try {
      // Now we need to loop through classList and do something different depending on baseClass.
      for (const cls of classList) {
        if (cls.baseClass == 'HotspringObjectType') {
          // This is an object type.
          let newObjectType = new cls.exported();
          newObjectType.stack = newStack.name;
          newStack.objectTypes[newObjectType.name] = newObjectType;
          const routeList = newObjectType.apiRoutes();
          for (const route of routeList) {
            newStack.routes[route.method + ':' + route.path] = route;
          }
          console.log("Loaded Object Type: " + newStack.name + "." + newObjectType.name);
        }
        if (cls.baseClass == 'HotspringRoute') {
          // This is a route.
          let newRoute = new cls.exported();
          newRoute.stack = newStack.name;
          const routeList = newRoute.apiRoutes();
          for (const route of routeList) {
            newStack.routes[route.method + ':' + route.path] = route;
          }
        }
        if (cls.baseClass == 'HotspringJob') {
          // This is a route.
          let newJob = new cls.exported();
          newJob.stack = newStack.name;
          newStack.jobs[newJob.name] = newJob;
        }
      }
      console.log('Loaded Stack: ' + newStack.name);
      return newStack;
    } catch (error) {
      console.error('Unable to process classes: ' + error);
      throw new Error('Unable to process classes: ' + error);
    }
    return null;
  }

  static async loadAllFromPath(absolutePath) {
    try {
      if (!absolutePath) {
        absolutePath = global.hotspring.configuration.defaultStackRoot;
      }
      const subfolders = await fs.readdir(absolutePath, { withFileTypes: true });
      for (const subfolder of subfolders) {
        if (subfolder.isDirectory()) {
          const stackDefinitionPath = path.join(absolutePath, subfolder.name, 'stackDefinition.json');
          try {

            let thisStack = await HotspringStack.loadSingleFromPath(path.join(absolutePath, subfolder.name));
            if (!thisStack) continue;
            thisStack.enabled = false; //All stacks should start as disabled.
            global.hotspring.stacks[thisStack.name] = thisStack;
          } catch (err) {
            global.hotspring.stackLoadErrors[subfolder.name] = err;
            // If the file doesn't exist or there's an error reading it, we can skip this subfolder
            console.error(`Error loading stack from ${stackDefinitionPath}:`, err);
          }
        }
      }
    } catch (err) {
      console.error(`Error reading directory ${absolutePath}:`, err);
    }
  }

  static async loadAll() {
    for (stackPath of global.hotspring.configuration.stackPaths) {
      if (await checkFolderExists(stackPath))
        await HotspringStack.loadAllFromPath(stackPath);
    }
    const appStackPath = path.join(global.hotspring.configuration.appRoot, 'stacks');
    if (await checkFolderExists(appStackPath))
      await HotspringStack.loadAllFromPath(appStackPath);
    const builtinStackPath = path.join(global.hotspring.configuration.coreModulePath, 'stacks_builtin');
    if (await checkFolderExists(builtinStackPath))
      await HotspringStack.loadAllFromPath(builtinStackPath);
  }


  async loadDatabaseObject_partial() {
    //Use global.hotsprings.sequelize to use the system.stack objecttype and update the database.
    const dbInterface = global.hotspring.stacks['system'].objectTypes['stack'].sequelizeObject
    const dbObject = await dbInterface.findOne({ where: { name: this.name } });
    if (dbObject) {
      this.stackId = dbObject.stackId;
      this.enabled = dbObject.enabled;
    }
  }
  async updateDatabaseObject() {
    //Use global.hotsprings.sequelize to use the system.stack objecttype and update the database.
    const dbInterface = global.hotspring.stacks['system'].objectTypes['stack'].sequelizeObject
    let dbObject = await dbInterface.findOne({ where: { name: this.name } });
    if (!dbObject) {
      dbObject = await dbInterface.create({ name: this.name, description: this.description, enabled: this.enabled, localPath: this.stackPath });
    } else {
      await dbObject.update({ name: this.name, description: this.description, enabled: this.enabled, localPath: this.stackPath });
    }
    if (this.stackId == 0) this.stackId = dbObject.stackId;
  }


  async activate() {
    this.enabled = true;
    for (const objectType in this.objectTypes) {
      this.objectTypes[objectType].sequelizeDefine(global.hotspring.sequelize, Sequelize.DataTypes);
      global.hotspring.models[this.name + '.' + objectType] = this.objectTypes[objectType];
    }
    for (const job in this.jobs) {
      //If this is a service, make sure it is started
      global.hotspring.jobs[this.name + '.' + job] = this.jobs[job];
    }
    for (const clientPackage in this.clientPackages) {
      //Is there any initialization code that needs to be run?
      global.hotspring.clientPackages[this.name + '.' + clientPackage] = this.clientPackages[clientPackage];
    }
    for (const apiRoutes in this.routes) {
      let thisRoute = this.routes[apiRoutes];
      if (thisRoute.isAPI)
        thisRoute.resolvedRoute = '/api/' + this.name + '/' + thisRoute.path
      else
        thisRoute.resolvedRoute = thisRoute.path;
      thisRoute.stack = this.name; //This should probably be when the routes are first fetched.
      thisRoute.loaded = false;

      //Start by creating the routes object for the Operation.
      if (!global.hotspring.routes[thisRoute.method]) global.hotspring.routes[thisRoute.method] = { route: null, params: [] };

      let curPosition = global.hotspring.routes[thisRoute.method]; // Set our current route to the operation object.

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
  }

  async deactivate() {
    //Code to disable a stack. Do NOT delete data.
  }

  async destroy() {
    //Delete the associate Data
    this.deactivate();
  }
}



module.exports = { HotspringStack };