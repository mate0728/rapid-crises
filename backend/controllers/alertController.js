const Alert = require("../models/Alert");

exports.createAlert = async (req, res) => {
  try {
    const alert = await Alert.create(req.body);
    const io = req.app.get("io");
    if (io) {
      io.emit("alert:new", alert);
      if (["Critical","High"].includes(alert.severity)) {
        io.emit("alert:critical", { id: alert._id, type: alert.type, location: alert.location, severity: alert.severity });
      }
    }
    res.status(201).json({ success: true, alert });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.getAlerts = async (req, res) => {
  try {
    const { status, type, severity, limit = 200 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (type) query.type = type;
    if (severity) query.severity = severity;
    const alerts = await Alert.find(query, { createdAt: -1 }, Number(limit));
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getAlert = async (req, res) => {
  try {
    const alert = await Alert.findById(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: "Alert not found" });
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { status, note, updatedBy, assignedPersonnel, casualties, evacuated } = req.body;
    const existing = await Alert.findById(req.params.id);
    if (!existing) return res.status(404).json({ success: false, error: "Alert not found" });

    const updates = { ...req.body };
    if (assignedPersonnel) updates.assignedPersonnel = assignedPersonnel;

    // Append to timeline
    const timeline = existing.timeline || [];
    timeline.push({ action: status || "UPDATED", by: updatedBy || "Operator", note: note || `Status changed to ${status}`, timestamp: new Date() });
    updates.timeline = timeline;

    const alert = await Alert.update(req.params.id, updates);
    const io = req.app.get("io");
    if (io) {
      io.emit("alert:updated", alert);
      if (status === "RESOLVED") io.emit("alert:resolved", { id: req.params.id });
    }
    res.json({ success: true, alert });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    await Alert.delete(req.params.id);
    const io = req.app.get("io");
    if (io) io.emit("alert:deleted", { id: req.params.id });
    res.json({ success: true, message: "Alert deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.getStats = async (req, res) => {
  try {
    const stats = await Alert.getStats();
    res.json({ success: true, stats: { total: stats.total, active: stats.active, responding: stats.responding, contained: stats.contained, resolved: stats.resolved, avgResponseTime: stats.avgResponseTime }, recentAlerts: stats.recentAlerts, typeBreakdown: stats.typeBreakdown });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
