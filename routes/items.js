const express = require("express");
const router = express.Router();

// Require controller modules.
const item_controller = require("../controllers/itemController");

router.get("/:category/create", item_controller.item_create_get);

router.post("/:category/create", item_controller.item_create_post);

router.get("/:category/:id", item_controller.item_detail);

router.get("/:category/:id/update", item_controller.item_update_get);

router.post("/:category/:id/update", item_controller.item_update_post);

router.get("/:category/:id/delete", item_controller.item_delete_get);

router.post("/:category/:id/delete", item_controller.item_delete_post);

module.exports = router;
