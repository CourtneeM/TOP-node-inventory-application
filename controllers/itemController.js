const Category = require("../models/category");
const Item = require("../models/item");

const async = require("async");
const { body, validationResult } = require('express-validator');

exports.item_create_get = function (req, res, next) {
  async.parallel(
    {
      items(callback) {
        Item.find()
          .populate("category")
          .exec(callback);
      },
      category(callback) {
        Category.findOne({name: req.params.category})
          .exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render("item_form", {
        title: "Create Item",
        items: results.items,
        category: results.category
      });
    }
  );
}
exports.item_create_post = [
  // Validate and sanitize fields.
  body("itemName", "Item name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  // body("itemName")
  //   .trim()
  //   .custom((val, {req}) => {
  //     return new Promise((res, rej) => {
  //       Item.findOne({name: req.body.itemName}, function(err, name) {
  //         if (err) {
  //           rej(new Error('Server Error'));
  //         }
  //         if (Boolean(name)) {
  //           rej(new Error(`${req.body.itemName} already exists.`));
  //         }

  //         res(true);
  //       });
  //     });
  //   }),
  body("itemDescription", "Item description must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object.
    const item = new Item({
      name: req.body.itemName,
      description: req.body.itemDescription,
      category: req.body.categoryId,
      price: req.body.itemPrice,
      num_in_stock: req.body.itemStock,
    });

    console.log(item);

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.
      async.parallel(
        {
          items(callback) {
            Item.find(callback)
          },
          category(callback) {
            Category.findOne({name: req.params.category})
              .exec(callback);
          }
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("item_form", {
            title: "Create Item",
            item,
            category: results.category,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save item.
    item.save((err) => {
      if (err) {
        return next(err);
      }

      // Successful: redirect to new item record.
      res.redirect(`/categories/${req.params.category}/${item.url}`);
    });
  },
];

exports.item_detail = (req, res, next) => {
  async.parallel(
    {
      item(callback) {
        Item.findById(req.params.id)
          .populate("category")
          .exec(callback);
      },
      category(callback) {
        Category.findOne({name: req.params.category})
          .exec(callback);
      },
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
        category: results.category,
      });
    }
  );
}

exports.item_update_get = function (req, res, next) {
  async.parallel(
    {
      items(callback) {
        Item.find()
          .populate("category")
          .exec(callback);
      },
      category(callback) {
        Category.findOne({name: req.params.category})
          .exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render("item_form", {
        title: "Update Item",
        item: results.items.filter(({ id }) => id === req.params.id)[0],
        category: results.category,
      });
    }
  );
}
exports.item_update_post = [
  // Validate and sanitize fields.
  body("itemName", "Item name must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  // body("itemName")
  // .trim()
  // .custom((val, {req}) => {
  //   return new Promise((res, rej) => {
  //     Item.findOne({name: req.body.itemName}, function(err, category) {
  //       console.log(req.params)
  //         if (err) {
  //           rej(new Error('Server Error'));
  //         }

  //         if (req.params.category !== req.body.categoryName) {
  //           if (Boolean(category)) {
  //             rej(new Error(`${req.body.categoryName} already exists.`));
  //           }
  //         }

  //         res(true);
  //     });
  //   });
  // }),
  body("itemDescription", "Item description must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object.
    const item = new Item({
      name: req.body.itemName,
      description: req.body.itemDescription,
      category: req.body.categoryId,
      price: req.body.itemPrice,
      num_in_stock: req.body.itemStock,
      _id: req.params.id, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      async.parallel(
        {
          items(callback) {
            Item.find(callback)
          },
          category(callback) {
            Category.findOne({name: req.params.category})
              .exec(callback)
          }
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("item_form", {
            title: "Update Item",
            item,
            category: results.category,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Item.findByIdAndUpdate(req.params.id, item, {}, (err, theitem) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new category record.
      res.redirect(`/categories/${req.params.category}/${item.url}`);
    });
  },
];

exports.item_delete_get = function (req, res, next) {
  async.parallel(
    {
      item(callback) {
        Item.findOne({_id: req.params.id}).populate("category").exec(callback);
      },
      category(callback) {
        Category.findOne({name: req.params.category})
          .exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.item == null) {
        // No results.
        res.redirect(`/categories/${req.params.category}`);
      }
      // Successful, so render.
      res.render("item_delete", {
        title: `Delete Item - ${results.item.name}`,
        item: results.item,
        category: results.category,
      });
    }
  );
}
exports.item_delete_post = function (req, res, next) {
  async.parallel(
    {
      item(callback) {
        Item.findOne({_id: req.params.id}).populate("category").exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      // Success
      // Delete object and redirect to the list of items in the selected category.
      Item.deleteOne(results.item, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to genre list
        res.redirect(`/categories/${req.params.category}`);
      });
    }
  );
}