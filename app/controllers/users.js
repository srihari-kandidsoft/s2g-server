'use strict';

var mongoose = require('mongoose')
  , User = mongoose.model('User')
  , logger = require('../logging').logger
  ;

exports.get = function(req,res,next) {
  logger.debug('#users.get');
  User.find( {username: req.params.username} ).exec( function (err, d) {
    logger.info('#users.get.callback');
    console.log(err);
    console.log(d);
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
  logger.debug('#users.put');
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