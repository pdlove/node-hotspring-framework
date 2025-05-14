const { HotspringModel, DataTypes } = require('../../../lib/HotspringModel');

class JobTemplate extends HotspringModel {
  static modelName = 'jobtemplate';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    jobTemplateID: { type: DataTypes.UUIDV4, allowNull: false, primaryKey: true },
    stack: { type: DataTypes.STRING, allowNull: false },
    jobTemplateName: { type: DataTypes.STRING, allowNull: false },
    jobTemplateLanguage: { type: DataTypes.STRING, allowNull: false, defaultValue: 'javascript' },
    jobTemplateCommand: { type: DataTypes.STRING, allowNull: true },
    jobTemplateType: { type: DataTypes.STRING, allowNull: false, defaultValue: 'user-initiated' }, // user-initiated, scheduled, system-initiated
    description: { type: DataTypes.STRING, allowNull: false },
    defaultInterval: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 4 },
    defaultIntervalUnits: { type: DataTypes.STRING, allowNull: false, defaultValue: 'once' },
    defaultRunCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    defaultConfiguration: { type: DataTypes.JSON, allowNull: false, defaultValue: {} },
    isEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    supportsPause: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    supportsCancel: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    supportsUndo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false }
  };

  static requiredModels = [];
  static defaultAccess = 'admin'; // admin, user, public


}
module.exports = JobTemplate;