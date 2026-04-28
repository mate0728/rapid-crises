const Datastore = require("@seald-io/nedb");
const path = require("path");
const fs = require("fs");

const dbPath = path.join(__dirname, "../../data");
fs.mkdirSync(dbPath, { recursive: true });

const alertsDB = new Datastore({ filename: path.join(dbPath, "alerts.db"), autoload: true });
const personnelDB = new Datastore({ filename: path.join(dbPath, "personnel.db"), autoload: true });

// Auto-compact every 5 mins
alertsDB.setAutocompactionInterval(5 * 60 * 1000);
personnelDB.setAutocompactionInterval(5 * 60 * 1000);

alertsDB.ensureIndex({ fieldName: "status" });
alertsDB.ensureIndex({ fieldName: "createdAt" });

console.log("✅ Database ready (NeDB file-based store)");

module.exports = { alertsDB, personnelDB };
