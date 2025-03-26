const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class GroupUser extends HotspringModel {
  static modelName = 'group_user';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; // admin, user, public
  static defaultReadAccess = 'admin'; // admin, user, public

  static sequelizeDefinition = {
    groupUserID: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    groupID: { type: DataTypes.INTEGER, allowNull: false },
    userID: { type: DataTypes.INTEGER, allowNull: false }
  };
  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.user", childParentKey: 'userID', childmodel: "system.group_user", required: true },
    { connectionType: "1M", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_user", required: true },    
  ]
  static seedData = [
    {groupUserID: 1, groupID: 1, userID: 1},
  ];
}

module.exports = GroupUser;
