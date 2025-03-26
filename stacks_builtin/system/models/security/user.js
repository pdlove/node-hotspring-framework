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
    { connectionType: "1M", parentmodel: "system.user", childParentKey: 'userID', childmodel: "system.group_user", required: true },
    { connectionType: "MM", parentmodel: "system.user", childParentKey: 'userID', childmodel: "system.group_user", childPeerKey: 'groupID', peerModel: 'system.group', required: true },
  ]
  static seedData = [
    {userID: 1, username: 'admin', email: 'admin@localhost', password: 'admin', organizationID: 1},
  ];

}

module.exports = User;
