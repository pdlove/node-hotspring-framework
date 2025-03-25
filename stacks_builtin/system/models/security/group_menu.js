const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class GroupMenu extends HotspringModel {
  static modelName = 'group_menu';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; // admin, user, public
  static defaultReadAccess = 'admin'; // admin, user, public

  static sequelizeDefinition = {
    groupMenuID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    groupID: { type: DataTypes.INTEGER, allowNull: false },
    menuID: { type: DataTypes.INTEGER, allowNull: false },
    accessLevel: { type: DataTypes.INTEGER, allowNull: false }
  };
  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.menu", parentKey: 'menuID', childmodel: "system.group_menu", childKey: 'menuID', required: true },
    { connectionType: "1M", parentmodel: "system.group", parentKey: 'groupID', childmodel: "system.group_menu", childKey: 'groupID', required: true },    
  ]
}

module.exports = GroupMenu;
