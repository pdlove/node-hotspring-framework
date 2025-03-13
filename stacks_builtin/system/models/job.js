const { HotspringModel, DataTypes } = require('../../../lib/HotspringModel');

class Job extends HotspringModel {
  static modelName = 'job';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    jobID: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    jobTemplateID: { type: DataTypes.INTEGER, allowNull: false },
    jobName: { type: DataTypes.STRING, allowNull: false },
    runInterval: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
    runIntervalUnits: { type: DataTypes.STRING, allowNull: false, defaultValue: 'hour' },
    runCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 5 }, //Priority 1-10 with 1 being the highest.
    retryCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    maxRetries: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 3 },
    nextRun: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    executeStart: { type: DataTypes.DATE, allowNull: true },
    executeStop: { type: DataTypes.DATE, allowNull: true },
    executeHeartbeat: { type: DataTypes.DATE, allowNull: true },
    executeBy: { type: DataTypes.STRING, allowNull: true },
    configuration: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    jobStatus: {type: DataTypes.SMALLINT, defaultValue: 0, allowNull: false, enumValues: {0: 'Created', 1: 'Ready', 2: 'Running', 11:'Success', 12:'Error', 13:'Ignored'} }
  };

  static requiredModels = [];
  static defaultAccess = 'admin'; // admin, user, public

//   sequelizeConnections = [
//     { connection: "1M", parentType: "inventory.networkdevice", parentKey: "deviceID", childType: "syslog.LogBatch", childKey: "sourceDeviceID" },
//     { connection: "1M", parentType: "inventory.networkdevice", parentKey: "deviceID", childType: "syslog.LogBatch", childKey: "collectorID" },
//     { connection: "1M", parentType: "inventory.networkdevice", parentKey: "deviceID", childType: "syslog.LogBatch", childKey: "processingByID" },
//     // { connection: "MM", type1: "system.group", Key1: "groupID", type2: "system.menu", Key2: "menuID", midType: "system.group_menu" }
//   ]
}
module.exports = Job;