const Personnel = require("../models/Personnel");

exports.getPersonnel = async (req, res) => {
  try {
    const { status, role } = req.query;
    const query = {};
    if (status) query.status = status;
    if (role) query.role = role;
    const personnel = await Personnel.find(query);
    res.json({ success: true, personnel });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.createPersonnel = async (req, res) => {
  try {
    const person = await Personnel.create(req.body);
    const io = req.app.get("io");
    if (io) io.emit("personnel:updated", person);
    res.status(201).json({ success: true, person });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

exports.updatePersonnel = async (req, res) => {
  try {
    const person = await Personnel.update(req.params.id, req.body);
    if (!person) return res.status(404).json({ success: false, error: "Not found" });
    const io = req.app.get("io");
    if (io) io.emit("personnel:updated", person);
    res.json({ success: true, person });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.deletePersonnel = async (req, res) => {
  try {
    await Personnel.delete(req.params.id);
    res.json({ success: true, message: "Personnel removed" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
