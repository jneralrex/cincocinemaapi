const express = require("express");
<<<<<<< Updated upstream
const {
  createReport,
  viewReport,
  editReport,
  deleteReport,
  viewAllReports,
} = require("../controller/report.controller");
const upload = require("../utils/file/uploads");

=======
const {createReport, viewReport, editReport, deleteReport, viewAllReports, } = require("../controller/report.controller");
const upload = require("../utils/file/uploads");


>>>>>>> Stashed changes
const router = express.Router();

router.post("/report", upload.single("supportingImage"), createReport); 
router.get("/single-report/:id", viewReport); 
router.patch("/edit-report/:id", upload.single("supportingImage"), editReport); 
router.delete("/delete-report/:id", deleteReport); 
<<<<<<< Updated upstream

router.get("/all-reports", viewAllReports);
=======
router.get("/all-reports", viewAllReports); 
>>>>>>> Stashed changes

module.exports = router;
