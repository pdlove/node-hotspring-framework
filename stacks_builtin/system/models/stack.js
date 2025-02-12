const { HotspringObjectType, DataTypes } = require('../../../lib/HotspringObjectType');

class Stack extends HotspringObjectType {
  name = 'stack';
  autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  defaultWriteAccess = 'admin'; //admin, user, public
  defaultReadAccess = 'admin'; //admin, user, public

  sequelizeDefinition = {
      stackId: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(255), allowNull: false },
      description: { type: DataTypes.STRING(2048), allowNull: false, defaultValue: "" },
      remoteSource: { type: DataTypes.STRING(1024) },
      localPath: { type: DataTypes.STRING(1024), allowNull: false },
      configuration: { type: DataTypes.TEXT },
      enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },

    };
  sequelizeConnections = {};
}

module.exports = Stack;