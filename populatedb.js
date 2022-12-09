#! /usr/bin/env node

console.log('This script populates some test categories and items to your database. Specified database as argument - e.g.: populatedb mongodb+srv://cooluser:coolpassword@cluster0.a9azn.mongodb.net/inventory_application?retryWrites=true');

// Get arguments passed on command line
const userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
const async = require('async');
const Category = require('./models/category');
const Item = require('./models/item');


const mongoose = require('mongoose');
const mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const categories = []
const items = []

function categoryCreate(name, description, cb) {
  const category = new Category({ name, description });

  category.save(function (err) {
    if (err) {
      console.log('ERROR CREATING CATEGORY: ' + category);
      cb(err, null);
      return;
    }

    console.log('New Category:' + category);
    categories.push(category);
    cb(null, category);
  });
}

function itemCreate(name, description, category, price, num_in_stock, cb) {
  const item = new Item({ name, description, category, price, num_in_stock });

  item.save(function (err) {
    if (err) {
      console.log('ERROR CREATING ITEM: ' + item);
      cb(err, null);
      return;
    }

    console.log('New Item:' + item);
    items.push(item);
    cb(null, item);
  });
}

function createCategories(cb) {
    async.series([
      function(callback) {
        categoryCreate('Accessories', 'Description', callback);
      },
      function(callback) {
        categoryCreate('Armor', 'Description', callback);
      },
      function(callback) {
        categoryCreate('Consumables', 'Description', callback);
      },
      function(callback) {
        categoryCreate('Equipment', 'Description', callback);
      },
      function(callback) {
        categoryCreate('Tools', 'Description', callback);
      },
    ],
    // optional callback
  cb);
}

function createItems(cb) {
  async.parallel([
    function(callback) {
      itemCreate('Boomerang', 'Can be used for attack or to retrieve far away items', categories[3], '300', '1', callback);
    },
    function(callback) {
      itemCreate('Red Potion', 'Has the ability to rejuvenate', categories[2], '120', '1', callback);
    },
    function(callback) {
      itemCreate('Hylian Shield', 'The shield of a royal knight', categories[3], '200', '1', callback);
    },
    function(callback) {
      itemCreate('Deku Nut', 'Releases a blinding light when thrown', categories[4], '5', '30', callback);
    },
    function(callback) {
      itemCreate('Bombchu', 'A bomb that can run up walls', categories[4], '10', '20', callback);
    },
    function(callback) {
      itemCreate('Goron Tunic', 'Protects the wearer from extreme heat', categories[1], '200', '1', callback);
    },
    function(callback) {
      itemCreate('Keaton Mask', 'A mask of the ever-popular Keaton. Wearing it could make anyone popular!', categories[0], '10', '1', callback)
    },
    function(callback) {
      itemCreate('Arrow', 'Requires a bow to use', categories[4], '10', '20', callback)
    },
    function(callback) {
      itemCreate('Magic Bean', 'Plant and add water to watch it grow', categories[4], '10', '5', callback)
    }
  ],
  // optional callback
  cb);
}

async.series(
  [
    createCategories,
    createItems,
  ],

  // Optional callback
  function(err, results) {
    if (err) {
      console.log('FINAL ERR: '+ err);
    }

    console.log(categories);

    // All done, disconnect from database
    mongoose.connection.close();
  }
);
