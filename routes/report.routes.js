const express = require("express");
const {
  createReport,
  viewReport,
  editReport,
  deleteReport,
  viewAllReports,
} = require("../controller/report.controller");
const upload = require("../utils/file/uploads");

const router = express.Router();

router.post("/report", upload.single("supportingImage"), createReport); 
router.get("/single-report/:id", viewReport); 
router.patch("/edit-report/:id", upload.single("supportingImage"), editReport); 
router.delete("/delete-report/:id", deleteReport); 

router.get("/all-reports", viewAllReports);

module.exports = router;
