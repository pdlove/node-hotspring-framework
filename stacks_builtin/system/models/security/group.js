const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class Group extends HotspringModel {
  static modelName = 'group';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'admin'; //admin, user, public

  static sequelizeDefinition = {
    groupID: { type: DataTypes.UUIDV4, primaryKey: true },
    organizationid: { type: DataTypes.UUIDV4, allowNull: true },
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
 {
   "groupID": "6c7a6187-9871-4a3d-ae35-15e534002163",
   "organizationID": "",
   "name": " meadadmin",
   "description": " MEAD Administrators (Everything)"
 },
 {
   "groupID": "f62ddec6-e81a-4740-bd79-8b0dde5d38e0",
   "organizationID": "",
   "name": " orgadmin",
   "description": " Organization Administrators"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "organizationID": "",
   "name": " orguser",
   "description": " Organization Users"
 }
]

}

module.exports = Group;
