const { HotspringModel, DataTypes } = require('../../../lib/HotspringModel');

class JobLog extends HotspringModel {
  static modelName = 'jobLog';
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

module.exports = JobLog;