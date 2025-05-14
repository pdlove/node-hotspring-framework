const { HotspringModel, DataTypes } = require('../../../../lib/HotspringModel');

class User extends HotspringModel {
  static modelName = 'user';
  static autoRoute = true; // Creates CRUD Routes and CRUD Views automatically.
  static defaultWriteAccess = 'admin'; //admin, user, public
  static defaultReadAccess = 'user'; //admin, user, public

  static sequelizeDefinition = {
    userID: { type: DataTypes.UUIDV4, primaryKey: true },
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    email: { type: DataTypes.STRING, allowNull: true },
    password: { type: DataTypes.STRING, allowNull: false },
    passwordPlainText: { type: DataTypes.STRING, allowNull: true }, //This will be removed after testing.
    description: { type: DataTypes.STRING(1024), allowNull: true },
    totp_key: { type: DataTypes.STRING, allowNull: true },
    locked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    last_login: { type: DataTypes.DATE, allowNull: true },
    organizationID: { type: DataTypes.UUIDV4, allowNull: false }
  };
  static sequelizeConnections = [    
    { connectionType: "1M", parentmodel: "system.user", childParentKey: 'userID', childmodel: "system.group_user", required: true },
    { connectionType: "MM", parentmodel: "system.user", childParentKey: 'userID', childmodel: "system.group_user", childPeerKey: 'groupID', peerModel: 'system.group', required: true },
    { connectionType: "1M", parentmodel: "system.organization", childParentKey: 'organizationID', childmodel: "system.user", required: true },

  ]
  static seedData = [
 {
   "userID": "a0ec3f73-65f5-41b6-b222-894443bc8a14",
   "username": "admin",
   "email": "admin@example.com",
   "password": "$2b$12$P34sUBpvrm/Sl6zDukW7T.wvZiLdjgVa9YopLYUObTbTOvWN9X.zu",
   "passwordPlainText": "Passw0rd!",
   "description": "MEAD Administrator with full access to everything",
   "locked": false,
   "organizationID": "d11f5a17-3b5b-4a6f-96ec-77616e730cea"
 },
 {
   "userID": "cf40da73-4c13-4497-89cf-212ffdef0659",
   "username": "jchen",
   "email": "jchen@nexora.com",
   "password": "$2b$12$rcsjSrnKQELDQSLfXJyjqOUX8FejrSn.AcX20Dr/UwgHORCxJBM4W",
   "passwordPlainText": "cloud123",
   "description": "Handles cloud integration and backend infrastructure.",
   "locked": false,
   "organizationID": "8248c465-3713-4a71-a025-67d5bcd181ad"
 },
 {
   "userID": "981894dd-21d3-4b5c-a809-a16339637373",
   "username": "mredford",
   "email": "mredford@nexora.com",
   "password": "$2b$12$0G38IJEUS6RMIMWJ7Hk4OuGB.dz1vONbIj42ydCjg.PwmdMkD2gvq",
   "passwordPlainText": "billing456",
   "description": "Contact for invoicing and payment issues.",
   "locked": false,
   "organizationID": "8248c465-3713-4a71-a025-67d5bcd181ad"
 },
 {
   "userID": "bcc9353f-6489-4a69-a60a-f099b4dfc981",
   "username": "adominguez",
   "email": "adominguez@nexora.com",
   "password": "$2b$12$Cjejm.uHsjv/AqkWiYxqzeKSMY9wtHuj8k2Zzl/Gf.IicolFa6uOS",
   "passwordPlainText": "schedule789",
   "description": "Coordinates system update and deployment timelines.",
   "locked": true,
   "organizationID": "8248c465-3713-4a71-a025-67d5bcd181ad"
 },
 {
   "userID": "b9eb34a3-246d-4674-a9bf-db477e20ce2e",
   "username": "lwatkins",
   "email": "lwatkins@bluegridtech.com",
   "password": "$2b$12$wCC.8M9xSuIsNUqP7985FO8JhSCM6.I7iQlKZTgXLR1PLV4jsWKpS",
   "passwordPlainText": "iot321",
   "description": "Manages device firmware and diagnostics.",
   "locked": true,
   "organizationID": "49d06aa0-8567-439c-a118-4707cacd3737"
 },
 {
   "userID": "76e79c30-f74e-48d5-80fb-2eeb54045890",
   "username": "sandra.lin",
   "email": "sandra.lin@bluegridtech.com",
   "password": "$2b$12$cufmx20ITq8RjgM9iUA42eAuHRCdi0bM67L9A4Wn98IGuWsyS4ima",
   "passwordPlainText": "billme",
   "description": "Handles billing cycles and contract renewals.",
   "locked": false,
   "organizationID": "49d06aa0-8567-439c-a118-4707cacd3737"
 },
 {
   "userID": "41377786-8127-40f0-85bf-c0e42b910457",
   "username": "bellis",
   "email": "bellis@bluegridtech.com",
   "password": "$2b$12$5nX0qfpsDPIf2BHVuN8kle2k/MfYV/bm8AyuzUvJgOYY4huSskdQa",
   "passwordPlainText": "installnow",
   "description": "Oversees installation and maintenance appointments.",
   "locked": false,
   "organizationID": "49d06aa0-8567-439c-a118-4707cacd3737"
 },
 {
   "userID": "3cab3a43-1dc6-43df-ba61-34664b2a1267",
   "username": "pmehta",
   "email": "pmehta@vantico.io",
   "password": "$2b$12$0X7r.XDVfviw445Nbqz51.ZVzCW/5fBZyPvYi8OthX3Xi.GjqFKNC",
   "passwordPlainText": "networking!",
   "description": "Specializes in VLAN design and security compliance.",
   "locked": false,
   "organizationID": "f5bb5b7d-97e2-414a-b265-057b10321e79"
 },
 {
   "userID": "54dc3da6-a460-4cc4-af16-03781cf10ff3",
   "username": "jfields",
   "email": "jfields@vantico.io",
   "password": "$2b$12$P6ZiKw50R/4Qe5qOSHkRgOhdzxYzD0.clkVRs5hGeUywVNdunobvO",
   "passwordPlainText": "fintrack",
   "description": "Manages purchase orders and financial records.",
   "locked": true,
   "organizationID": "f5bb5b7d-97e2-414a-b265-057b10321e79"
 },
 {
   "userID": "074bcafe-0b33-44a4-a847-7da0a6b77185",
   "username": "cnguyen",
   "email": "cnguyen@vantico.io",
   "password": "$2b$12$0QOqlnL8ojf3QgkpN/kXnebr9LLl/yYOcW88g9JTVNiEWvvbuHf8a",
   "passwordPlainText": "audits123",
   "description": "Books on-site audits and review sessions.",
   "locked": false,
   "organizationID": "f5bb5b7d-97e2-414a-b265-057b10321e79"
 }
]


}

module.exports = User;
