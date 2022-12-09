const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/itemController");

router.get("/:id", item_controller.item_detail);

module.exports = router;
