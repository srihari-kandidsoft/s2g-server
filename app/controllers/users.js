'use strict';

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , Item = mongoose.model('Item')
  , logger = require('../logging').logger
  ;

exports.get = function(req,res,next) {
  // logger.debug('#users.get');
  User.find( {username: req.params.username} ).exec( function (err, d) {
    if (err) {
      // res.status(500);
      res.send(500, { status: 'error', message: err } );
      return next();
    } 
    if (d.length < 1) {
      res.send(404, { status: 'error', message: 'user ' + req.params.username + ' not found.'});
      return next();
    }
    res.send({
      status: 'success',
      data: d
    });
    next();
  });
}; 

exports.put = function (req,res,next) {
  // logger.debug('#users.put');
  var user = new User({
    username: req.params.username,
    neighborhoodId: req.params.neighborhoodId,
    firstName: req.params.firstName,
    lastName: req.params.lastName,
    address: req.params.address,
    avatar: req.params.avatar
  });

  // Remove the _id property from the json object
  // because it cannot be used with an upsert.
  var update = user.toObject();
  delete update._id;
  
  User.update( {username: req.params.username}, update, {upsert: true},
    function (err) {
    if (err) {
      logger.error('Failed to save user %s: %s', req.params.username, err);
      res.send(500,{
        status: 'error',
        message: err
      });
      return next();
    }
    res.send(201);
    return next();
  });
};

// create a 24 character hex string
function pad24 (id) {
  return String('000000000000000000000000' + id ).slice(-24);
}

exports.putItem = function (req, res, next) {
  // logger.debug('#users.putItem');
  var item = new Item({
    email: req.params.email,
    name: req.params.name,
    description: req.params.descripßtion,
  });

  // Remove the _id property from the json object
  // because it cannot be used with an upsert.
  var update = item.toObject()
    , id = pad24(req.params.id);
  delete update._id;

  // In this case here, the update is searching 
  // on the supplied id, so id will be used to
  // create the object _id if this turns out to be
  // a save instead of an update.
  Item.update( {_id: id}, update, {upsert: true}, function (err) {
    if (err) {
      logger.error('Failed to save the item %s for user %s: %s', item.id, item.email, err);
      res.send(500, {
        status: 'error',
        message: err
      });
      return next();
    }
    res.send(201);
    return next();
  });
};

exports.getItems = function (req, res, next) {
  // logger.debug('#users.getItems');
  Item.find( {email: req.params.email} ).exec( function (err, d) {
    if (err) {
      res.send(500, { status: 'error', message: err } );
      return next();
    }
    res.send({
      status: 'success',
      data: d
    });
    next();
  });
};

exports.getItem = function (req, res, next) {
  // logger.debug('#users.getItems');
  Item.find( { email: req.params.email, _id: req.params.id}).exec( function (err, d) {
    if (err) {
      logger.error('Failed to execute find for the item %s for user %s: %s', req.params.id, req.params.email, err);      
      res.send(500, { status: 'error', message: err } );
      return next();
    }
    res.send({
      status: 'success',
      data: d
    });
    next();
  });
};

