const { alertsDB } = require("../config/db");

class Alert {
  static _genId() {
    return "INC-" + Date.now().toString(36).toUpperCase().slice(-6);
  }

  static async create(data) {
    const doc = {
      incidentId: Alert._genId(),
      type: data.type || "Other",
      severity: data.severity || "High",
      status: data.status || "ACTIVE",
      location: data.location || "",
      floor: data.floor || "",
      zone: data.zone || "",
      lat: data.lat || null,
      lng: data.lng || null,
      message: data.message || "",
      reportedBy: data.reportedBy || "Anonymous",
      reporterRole: data.reporterRole || "Staff",
      assignedPersonnel: data.assignedPersonnel || [],
      casualties: data.casualties || 0,
      evacuated: data.evacuated || 0,
      isSOSTriggered: data.isSOSTriggered || false,
      resolvedAt: null,
      responseTimeMs: null,
      timeline: data.timeline || [{ action: "CREATED", by: data.reportedBy || "System", note: "Incident reported", timestamp: new Date() }],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return new Promise((resolve, reject) => {
      alertsDB.insert(doc, (err, newDoc) => (err ? reject(err) : resolve(newDoc)));
    });
  }

  static async find(query = {}, sort = { createdAt: -1 }, limit = 200) {
    return new Promise((resolve, reject) => {
      alertsDB.find(query).sort(sort).limit(limit).exec((err, docs) => (err ? reject(err) : resolve(docs)));
    });
  }

  static async findById(id) {
    return new Promise((resolve, reject) => {
      alertsDB.findOne({ _id: id }, (err, doc) => (err ? reject(err) : resolve(doc)));
    });
  }

  static async update(id, updates) {
    const existing = await Alert.findById(id);
    if (!existing) return null;
    const updatedDoc = { ...existing, ...updates, updatedAt: new Date() };
    if (updates.status === "RESPONDING" && !existing.responseTimeMs) {
      updatedDoc.responseTimeMs = Date.now() - new Date(existing.createdAt).getTime();
    }
    if (updates.status === "RESOLVED" && !existing.resolvedAt) {
      updatedDoc.resolvedAt = new Date();
    }
    return new Promise((resolve, reject) => {
      alertsDB.update({ _id: id }, updatedDoc, {}, (err) => {
        if (err) reject(err); else resolve(updatedDoc);
      });
    });
  }

  static async delete(id) {
    return new Promise((resolve, reject) => {
      alertsDB.remove({ _id: id }, {}, (err, n) => (err ? reject(err) : resolve(n)));
    });
  }

  static async count(query = {}) {
    return new Promise((resolve, reject) => {
      alertsDB.count(query, (err, n) => (err ? reject(err) : resolve(n)));
    });
  }

  static async getStats() {
    const [total, active, responding, contained, resolved] = await Promise.all([
      Alert.count({}), Alert.count({ status: "ACTIVE" }), Alert.count({ status: "RESPONDING" }),
      Alert.count({ status: "CONTAINED" }), Alert.count({ status: "RESOLVED" }),
    ]);
    const allAlerts = await Alert.find({});
    const respondedAlerts = allAlerts.filter(a => a.responseTimeMs);
    const avgResponseTime = respondedAlerts.length > 0
      ? Math.round(respondedAlerts.reduce((a, b) => a + b.responseTimeMs, 0) / respondedAlerts.length / 1000) : 0;
    const recentAlerts = allAlerts.slice(0, 5);
    const typeMap = {};
    allAlerts.forEach(a => { typeMap[a.type] = (typeMap[a.type] || 0) + 1; });
    const typeBreakdown = Object.entries(typeMap).map(([_id, count]) => ({ _id, count })).sort((a, b) => b.count - a.count);
    return { total, active, responding, contained, resolved, avgResponseTime, recentAlerts, typeBreakdown };
  }
}

module.exports = Alert;
