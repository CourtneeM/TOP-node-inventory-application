const express = require("express");
const router = express.Router();

// Require controller modules.
const category_controller = require("../controllers/categoryController");
const item_controller = require("../controllers/itemController");

router.get('/:category', item_controller.item_list);

// GET catalog home page.
router.get("/", item_controller.index);

module.exports = router;
