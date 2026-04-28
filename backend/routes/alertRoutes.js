const express = require("express");
const router = express.Router();
const {
  createAlert,
  getAlerts,
  getAlert,
  updateAlertStatus,
  deleteAlert,
  getStats,
} = require("../controllers/alertController");

router.get("/stats", getStats);
router.route("/").get(getAlerts).post(createAlert);
router.route("/:id").get(getAlert).patch(updateAlertStatus).delete(deleteAlert);

module.exports = router;
