const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class GroupMenu extends HotspringModel {
  static name = 'group_menu';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; // admin, user, public
  static defaultReadAccess = 'admin'; // admin, user, public

  static sequelizeDefinition = {
    groupMenuID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    groupID: { type: DataTypes.INTEGER, allowNull: false },
    menuId: { type: DataTypes.INTEGER, allowNull: false },
    accessLevel: { type: DataTypes.INTEGER, allowNull: false }
  };
  static sequelizeConnections = [
    { connection: "1M", parentType: "system.group", parentKey: "groupID", childType: "system.group_menu", childKey: "groupID" },
    { connection: "1M", parentType: "system.menu", parentKey: "menuID", childType: "system.group_menu", childKey: "menuID" },
  ]
}

module.exports = GroupMenu;
