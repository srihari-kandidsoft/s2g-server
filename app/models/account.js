"use strict";

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
  , validator = require('validator')
  ;

/** Options: 
var options = {
  autoindex: false, // This is true by default. NOTE: prod release needs 
                    // this set to true!!
  bufferCommands: false, // Defaults to true
  capped: 1024, // Use it for circular buffers, can be set to a literal 
                // eg: {size: 1024, max: 1000, autoIndex: true}
  collection: 'neighborhoods_test', // specify if you need a different collection name.
  id: false,    // Defaults to true. Renames or Disables a virtual 'id' field
                // accessible from the model.
  _id: false,   // 
  read: '...',  // Controls read behavior. See http://mongoosejs.com/docs/guide.html#read
  safe: true,   // Controls write policy. See http://mongoosejs.com/docs/guide.html#safe
  shardKey: {}, // Used when sharding to specify which shard to use.
  strict: true, // Defaults to true. Ensures that new values not in schema 
                // are not saved to the database.
  toJSON: {},   // Specify options for these serializers.
  toObject: {}, // See http://mongoosejs.com/docs/api.html#document_Document-toObject
  versionKey: 'version'   // Configure the __v to something else.
};
*/

var Account = new Schema({
  created: { type: Date, default: Date.now },
  email: { type: String, required: true, unique: true, index: true, trim: true },
  passwordHash: { type: String, required: true },
  salt: String,
} );

Account.path('email').validate( validator.isEmail );

Account.statics.hashPassword = function(password) {
  var hash = null;
  if ( password ) {
    var p = password.trim()
      , salt =crypto.randomBytes(20).toString('hex');
    hash = crypto.createHmac('sha1', salt).update(p).digest('hex');
  }
  return hash;
};

Account.virtual('password').set(function(password) {
    this._password = password;
    this.salt = crypto.randomBytes(20).toString('hex');
    this.passwordHash = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
  }).get(function() {
    return this._password;
  });


mongoose.model('Account', Account); 
