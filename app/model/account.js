"use strict";

var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , crypto = require('crypto')
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
  email: { type: String, unique: true, index: true },
  passwordHash: { type: String }
} );

Account.statics.hashPassword = function(password) {
  var key = '616f6a1f92059a2c8ed1ba1b45e26335'
    , hash = null;
  if ( password ) {
    hash = crypto.createHmac('sha1', key).update(password).digest('hex');
  }
  return hash;
};

module.exports = mongoose.model('Account', Account); 
