const { or } = require('sequelize');
const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class GroupMenu extends HotspringModel {
  static modelName = 'group_menu';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; // admin, user, public
  static defaultReadAccess = 'admin'; // admin, user, public

  static sequelizeDefinition = {
    organizationID: { type: DataTypes.UUIDV4, allowNull: true },
    groupID: { type: DataTypes.UUIDV4, allowNull: false },
    menuID: { type: DataTypes.UUIDV4, allowNull: false },
    accessLevel: { type: DataTypes.INTEGER, allowNull: false }
  };
  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.menu", childParentKey: 'menuID', childmodel: "system.group_menu", required: true },
    { connectionType: "1M", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_menu", required: true },    
  ]
}

module.exports = GroupMenu;
