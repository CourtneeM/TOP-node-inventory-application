const Category = require("../models/category");
const Item = require("../models/item");

const async = require("async");
const { body, validationResult } = require('express-validator');

exports.item_list = function (req, res, next) {
  
}

exports.index = (req, res) => {
  async.parallel(
    {
      category_count(callback) {
        Category.countDocuments({}, callback);
      },
      item_count(callback) {
        Item.countDocuments({}, callback); // Pass an empty object as match condition to find all documents of this collection
      },
    },
    (err, results) => {
      res.render("index", {
        title: "Shop Home",
        error: err,
        data: results,
      });
    }
  );
};