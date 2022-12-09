const Item = require("../models/item");

const async = require("async");
const { body, validationResult } = require('express-validator');

exports.item_detail = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id)
          .populate("category")
          .exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        const err = new Error("Item not found");
        err.status = 404;
        return next(err);
      }

      // Successful, so render.
      res.render("item_detail", {
        title: results.item.name,
        item: results.item,
      });
    }
  );
}