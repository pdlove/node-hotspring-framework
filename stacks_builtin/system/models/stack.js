const { HotspringModel, DataTypes } = require('../../../lib/HotspringModel');

class Stack extends HotspringModel {
  static modelName = 'stack';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    stackId: { type: DataTypes.UUIDV4, primaryKey: true },
    stackName: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(2048), allowNull: false, defaultValue: "" },
    remoteSource: { type: DataTypes.STRING(1024) },
    localPath: { type: DataTypes.STRING(1024), allowNull: false },
    configuration: { type: DataTypes.TEXT },
    isEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  };
}

module.exports = Stack;