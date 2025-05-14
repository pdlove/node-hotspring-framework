const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class Menu extends HotspringModel {
  static modelName = 'menu';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'user'; //admin, user, public
  static defaultBrowsePageSize = 0; // 0 means no limit

  static sequelizeDefinition = {
    menuID: { type: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    displayText: { type: DataTypes.STRING(255), allowNull: false },
    iconText: { type: DataTypes.STRING(255) },
    iconClass: { type: DataTypes.STRING(255) },
    parent_menu_id: { type: DataTypes.INTEGER },
    external_link: { type: DataTypes.STRING(255) },
    clientPackage: { type: DataTypes.STRING(255) },
    clientPackageParameters: { type: DataTypes.JSON },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    debug: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    production: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    stackID: { type: DataTypes.UUIDV4, allowNull: true }
  };

  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.stack", childParentKey: 'stackID', childmodel: "system.menu", required: true },
    { connectionType: "1M", parentmodel: "system.menu", childParentKey: 'menuID', childmodel: "system.group_menu", required: true },
    { connectionType: "MM", parentmodel: "system.menu", childParentKey: 'menuID', childmodel: "system.group_menu", childPeerKey: 'groupID', peerModel: 'system.group', required: true },
  ]

  static sequelizeOptions = {
    indexes: [
      { fields: ['stackId'] }
    ]
  };
}

module.exports = Menu;



