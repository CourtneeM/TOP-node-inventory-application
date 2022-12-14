const Category = require("../models/category");
const Item = require("../models/item");

const async = require("async");
const { body, validationResult } = require('express-validator');
const category = require("../models/category");

exports.index = (req, res) => {
  Category.find({})
    .sort({ name: 1 })
    .exec(function (err, list_categories) {
      if (err) {
        return next(err);
      }
      //Successful, so render
      res.render("index", { title: "Shop Home", category_list: list_categories });
  });
};

exports.category_create_get = function (req, res, next) {
  async.parallel(
    {
      categories(callback) {
        Category.find(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      res.render("category_form", {
        title: "Create Category",
        categories: results.categories,
      });
    }
  );
}
exports.category_create_post = [
  // Validate and sanitize fields.
  body("categoryName", "Category name must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("categoryName")
    .trim()
    .custom((val, {req}) => {
      return new Promise((res, rej) => {
        Category.findOne({name: req.body.categoryName}, function(err, name) {
            if (err) {
              rej(new Error('Server Error'));
            }
            if (Boolean(name)) {
              rej(new Error(`${req.body.categoryName} already exists.`));
            }

            res(true);
        });
      });
    }),
  body("categoryDescription", "Category description must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object.
    const category = new Category({
      name: req.body.categoryName,
      description: req.body.categoryDescription,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      async.parallel(
        {
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("category_form", {
            title: "Create Category",
            category,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Save category.
    category.save((err) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new category record.
      res.redirect(`${category.url}`);
    });
  },
];

exports.category_update_get = function (req, res, next) {
  async.parallel(
    {
      category(callback) {
        Category.findOne({name: req.params.category})
          .exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      res.render("category_form", {
        title: `Update ${results.category.name}`,
        category: results.category,
      });
    }
  );
}
exports.category_update_post = [
  // Validate and sanitize fields.
  body("categoryName", "Category name must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),
  body("categoryName")
  .trim()
  .custom((val, {req}) => {
    return new Promise((res, rej) => {
      Category.findOne({name: req.body.categoryName}, function(err, category) {
          if (err) {
            rej(new Error('Server Error'));
          }

          if (req.params.category !== req.body.categoryName) {
            if (Boolean(category)) {
              rej(new Error(`${req.body.categoryName} already exists.`));
            }
          }

          res(true);
      });
    });
  }),
  body("categoryDescription", "Category description must not be empty.")
  .trim()
  .isLength({ min: 1 })
  .escape(),

  // Process request after validation and sanitization.
  (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Category object.
    const category = new Category({
      name: req.body.categoryName,
      description: req.body.categoryDescription,
      _id: req.body.categoryId, //This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      async.parallel(
        {
          categories(callback) {
            Category.find(callback);
          },
        },
        (err, results) => {
          if (err) {
            return next(err);
          }

          res.render("category_form", {
            title: "Create Category",
            category,
            errors: errors.array(),
          });
        }
      );
      return;
    }

    // Data from form is valid. Update the record.
    Category.findOneAndUpdate({name: req.params.category}, category, {}, (err, thecategory) => {
      if (err) {
        return next(err);
      }
      // Successful: redirect to new category record.
      res.redirect(`${thecategory.url}`);
    });
  },
];

exports.category_delete_get = function (req, res, next) {
  async.parallel(
    {
      category(callback) {
        Category.findOne({name: req.params.category}).exec(callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      if (results.category == null) {
        // No results.
        res.redirect("/categories");
      }
      // Successful, so render.
      res.render("category_delete", {
        title: `Delete ${results.category.name}`,
        category: results.category,
      });
    }
  );
}
exports.category_delete_post = function (req, res, next) {
  async.parallel(
    {
      category(callback) {
        Category.findOne({name: req.body.categoryName}).exec(callback);
      },
      items(callback) {
        Item.find({category: req.body.categoryId})
          .exec(callback);
      }
    },
    (err, results) => {
      if (err) {
        return next(err);
      }
      
      // Success
      if (results.items.filter((item) => item.category).length > 0) {
        // Category has items. Render in same way as for GET route.
        res.render("category_delete", {
          title: `Delete ${results.category.name}`,
          category: results.category,
        });
        return;
      }
      // Delete object and redirect to the list of categories.
      Category.deleteOne(results.category, (err) => {
        if (err) {
          return next(err);
        }
        // Success - go to category list
        res.redirect("/categories");
      });
    }
  );
}

exports.item_list = function (req, res, next) {
  Item.find({}, "name description category price num_in_stock")
    .sort({ name: 1 })
    .populate("category")
    .exec(function (err, list_items) {
      if (err) {
        return next(err);
      }

      Category.findOne({name: req.params.category})
        .exec(function (err, results) { 
          if (err) {
            return next(err);
          }
          
          const filteredListItems = list_items.filter((item) => item.category.name == req.params.category);
          //Successful, so render
          res.render("item_list", { category: results, item_list: filteredListItems });
      });
  });
}