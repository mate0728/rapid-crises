const { personnelDB } = require("../config/db");

class Personnel {
  static async create(data) {
    const doc = {
      name: data.name,
      role: data.role || "Security",
      status: data.status || "Available",
      zone: data.zone || "Unassigned",
      contact: data.contact || "",
      assignedIncident: data.assignedIncident || null,
      lat: data.lat || null,
      lng: data.lng || null,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new Promise((resolve, reject) => {
      personnelDB.insert(doc, (err, newDoc) => (err ? reject(err) : resolve(newDoc)));
    });
  }

  static async find(query = {}) {
    return new Promise((resolve, reject) => {
      personnelDB.find(query).sort({ name: 1 }).exec((err, docs) => (err ? reject(err) : resolve(docs)));
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      personnelDB.findOne({ _id: id }, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  static async update(id, updates) {
    const existing = await Personnel.findById(id);
    if (!existing) return null;
    const updatedDoc = { ...existing, ...updates, updatedAt: new Date(), lastSeen: new Date() };
    return new Promise((resolve, reject) => {
      personnelDB.update({ _id: id }, updatedDoc, {}, (err) => {
        if (err) reject(err); else resolve(updatedDoc);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      personnelDB.remove({ _id: id }, {}, (err, n) => (err ? reject(err) : resolve(n)));
    });
  }

  static async count() {
    return new Promise((resolve, reject) => {
      personnelDB.count({}, (err, n) => (err ? reject(err) : resolve(n)));
    });
  }
}

module.exports = Personnel;
