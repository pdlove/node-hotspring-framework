const { HotspringObjectType, DataTypes } = require('../../../../lib/HotspringObjectType');

class GroupMenu extends HotspringObjectType {
  name = 'group_menu';
  autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  defaultWriteAccess = 'admin'; // admin, user, public
  defaultReadAccess = 'admin'; // admin, user, public

  sequelizeDefinition = {
    groupMenuID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    groupID: { type: DataTypes.INTEGER, allowNull: false },
    menuId: { type: DataTypes.INTEGER, allowNull: false },
    accessLevel: { type: DataTypes.INTEGER, allowNull: false }    
  };
  sequelizeConnections = [
    { connection: "1M", parentType: "system.group", parentKey: "groupID", childType: "system.group_menu", childKey: "groupID" },
    { connection: "1M", parentType: "system.menu", parentKey: "menuID", childType: "system.group_menu", childKey: "menuID" },    
  ]
}

module.exports = GroupMenu;
