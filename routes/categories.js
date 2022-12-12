const express = require("express");
const router = express.Router();

// Require controller modules.
const category_controller = require("../controllers/categoryController");

// GET category home page.
router.get("/", category_controller.index);

// GET request for creating a Category.
router.get("/create", category_controller.category_create_get);

// POST request for creating a Category.
router.post("/create", category_controller.category_create_post);

// GET request for updating a Category.
router.get("/:category/update", category_controller.category_update_get);

// POST request for updating a Category.
router.post("/:category/update", category_controller.category_update_post);

// GET request for deleting a Category.
router.get("/:category/delete", category_controller.category_delete_get);

// POST request for deleting a Category.
router.post("/:category/delete", category_controller.category_delete_post);

router.get("/:category", category_controller.item_list);

module.exports = router;
