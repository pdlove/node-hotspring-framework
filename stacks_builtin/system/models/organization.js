const { HotspringModel, DataTypes } = require('../../../lib/HotspringModel');

class Organization extends HotspringModel {
  static modelName = 'organization';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'user'; //admin, user, public

  static sequelizeDefinition = {
    organizationID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.STRING, allowNull: true },
    streetAddress: { type: DataTypes.STRING, allowNull: true },
    phonenumber: { type: DataTypes.STRING, allowNull: true },
    primaryUserID: { type: DataTypes.INTEGER, allowNull: false }
  };

}

module.exports = Organization;
