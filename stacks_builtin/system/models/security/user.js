const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class User extends HotspringModel {
  static modelName = 'user';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'user'; //admin, user, public

  static sequelizeDefinition = {
    userID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    totp_key: { type: DataTypes.STRING, allowNull: true },
    locked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    last_login: { type: DataTypes.DATE, allowNull: true },
    organizationID: { type: DataTypes.INTEGER, allowNull: false }
  };
  static sequelizeConnections = [
    // { connection: "1M", parentType: "system.menu", parentKey: "menuID", childType: "system.group_menu", childKey: "menuID" },
    // { connection: "MM", type1: "system.group", Key1: "groupID", type2: "system.menu", Key2: "menuID", midType: "system.group_menu" }
  ]
}

module.exports = User;
