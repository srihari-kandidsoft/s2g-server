'use strict';

var mongoose = require('mongoose')
  , Item = mongoose.model('Item')
  , logger = require('../logging').logger
  ;

// exports.get = function(req,res,next) {
//   logger.debug('#items.get');
//   User.find( {username: req.params.username} ).exec( function (err, d) {
//     logger.info('#users.get.callback');
//     console.log(err);
//     console.log(d);
//     if (err) {
//       // res.status(500);
//       res.send(500, { status: 'error', message: err } );
//       return next();
//     } 
//     if (d.length < 1) {
//       res.send(404, { status: 'error', message: 'user ' + req.params.username + ' not found.'});
//       return next();
//     }
//     res.send({
//       status: 'success',
//       data: d
//     });
//     next();
//   });
// }; 

exports.put = function (req,res,next) {
  logger.debug('#items.put');
  var user = new Item({
    name: req.params.name,
    description: req.params.description,
    picture: req.params.picture,
  });

  // Remove the _id property from the json object
  // because it cannot be used with an upsert.
  var update = user.toObject();
  delete update._id;
  
  Item.update( {email: req.params.username}, update, {upsert: true},
    function (err) {
    if (err) {
      logger.error('Failed to save item %s for user %s: %s', req.params.name, req.params.username, err);
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