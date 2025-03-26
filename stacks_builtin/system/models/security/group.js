const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class Group extends HotspringModel {
  static modelName = 'group';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    groupID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(1024) } 
  };

  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_menu", required: true },
    { connectionType: "MM", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_menu", childPeerKey: 'menuID', peerModel: 'system.menu', required: true },

    { connectionType: "1M", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_user", required: true },
    { connectionType: "MM", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_user", childPeerKey: 'userID', peerModel: 'system.user', required: true },

  ]

  static seedData = [
    {groupID: 1, name: 'admin', description: 'Administrators'},
    {groupID: 2, name: 'user', description: 'Users'}
  ];
}

module.exports = Group;
