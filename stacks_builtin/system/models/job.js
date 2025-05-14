const { or } = require('sequelize');
const { HotspringModel, DataTypes } = require('../../../lib/HotspringModel');

class Job extends HotspringModel {
  static modelName = 'job';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    jobID: { type: DataTypes.UUIDV4, primaryKey: true},
    jobTemplateID: { type: DataTypes.UUIDV4, allowNull: false },
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
    jobStatus: {type: DataTypes.SMALLINT, defaultValue: 0, allowNull: false, enumValues: {0: 'Created', 1: 'Ready', 2: 'Running', 11:'Success', 12:'Error', 13:'Ignored'} },
    organizationID: { type: DataTypes.UUIDV4, allowNull: true }
  };

  static requiredModels = [];
  static defaultAccess = 'admin'; // admin, user, public

}

class JobLog extends HotspringModel {
  static modelName = 'jobLog';
  static filterRequired = true;
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    logID: { type: DataTypes.INTEGER, allowNull: false, primaryKey: true, autoIncrement: true },
    jobID: { type: DataTypes.INTEGER, allowNull: false },
    logLine: { type: DataTypes.TEXT, allowNull: false },
    logReferenceModel: { type: DataTypes.STRING, allowNull: true }, // Model Name (With stack)
    logReferenceID: { type: DataTypes.INTEGER, allowNull: true },
    logStatus: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }, // 0=Info, 1=Warning, 2=Error
  };

  static requiredModels = [];
  static defaultAccess = 'admin'; // admin, user, public
}
module.exports = { Job, JobLog};