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
id: false,    // Defaults to true. Disables the _id field
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

var Oauth2Token = new Schema({
  tokenHash: { type: String, required: true, unique: true, index: true, trim: true },
  email: { type: String, required: true, index: true, trim: true },  
  created: { type: Date, default: Date.now },
});


// Using recommended settings for password handling by the 
function generateToken(data) {
  var salt = crypto.randomBytes(16).toString('hex');
  var pbkdf2 = crypto.pbkdf2Sync(data, salt, 5000, 30).toString('base64');
  return pbkdf2;
}

// Set token to a non-persisted property and hash
// to tokenHash
Oauth2Token.virtual('token')
  .get( function () { 
    return this._token; 
  })
  .set( function (token) {
    this._token = token;
    this.tokenHash = generateToken(token);
  });

/*
Neighborhood.methods.findSimilar = function(cb) {
return this.model('Neighborhood').find({city: this.city}, cb);
};

Neighborhood.index({name: 1, type: -1}); // schema level

Neighborhood.virtual('composedName').get( function(){
    return util.format( '%s - %s, %s.', this.name, this.city, this.state.short );
});
*/
module.exports = mongoose.model('Oauth2Token', Oauth2Token);