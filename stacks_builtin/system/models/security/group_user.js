const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class GroupUser extends HotspringModel {
  static modelName = 'group_user';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; // admin, user, public
  static defaultReadAccess = 'admin'; // admin, user, public

  static sequelizeDefinition = {
    groupID: { type: DataTypes.UUIDV4, allowNull: false },
    userID: { type: DataTypes.UUIDV4, allowNull: false }
  };
  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.user", childParentKey: 'userID', childmodel: "system.group_user", required: true },
    { connectionType: "1M", parentmodel: "system.group", childParentKey: 'groupID', childmodel: "system.group_user", required: true },    
  ]
  static seedData = [
 {
   "groupID": "6c7a6187-9871-4a3d-ae35-15e534002163",
   "userID": "a0ec3f73-65f5-41b6-b222-894443bc8a14"
 },
 {
   "groupID": "f62ddec6-e81a-4740-bd79-8b0dde5d38e0",
   "userID": "cf40da73-4c13-4497-89cf-212ffdef0659"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "userID": "981894dd-21d3-4b5c-a809-a16339637373"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "userID": "bcc9353f-6489-4a69-a60a-f099b4dfc981"
 },
 {
   "groupID": "f62ddec6-e81a-4740-bd79-8b0dde5d38e0",
   "userID": "b9eb34a3-246d-4674-a9bf-db477e20ce2e"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "userID": "76e79c30-f74e-48d5-80fb-2eeb54045890"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "userID": "41377786-8127-40f0-85bf-c0e42b910457"
 },
 {
   "groupID": "f62ddec6-e81a-4740-bd79-8b0dde5d38e0",
   "userID": "3cab3a43-1dc6-43df-ba61-34664b2a1267"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "userID": "54dc3da6-a460-4cc4-af16-03781cf10ff3"
 },
 {
   "groupID": "fe030ecf-e85c-4804-a7c9-0a55e65e1305",
   "userID": "074bcafe-0b33-44a4-a847-7da0a6b77185"
 }
];
}

module.exports = GroupUser;
