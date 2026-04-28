const express = require("express");
const router = express.Router();
const {
  getPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} = require("../controllers/personnelController");

router.route("/").get(getPersonnel).post(createPersonnel);
router.route("/:id").patch(updatePersonnel).delete(deletePersonnel);

module.exports = router;
