'use strict';


var chai = require('chai');
var api_assertions = require('../lib/apiJsonChai.js');
var expect = chai.expect;

chai.use( api_assertions );

module.exports = function(request,url) {
  describe( 'GET /neighborhoods', function() {
    it('should return the route response', function (done) {
      request(url)
            .get('/neighborhoods')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              expect(err).to.be.null;
              res.body.should.exist.and.be.an.apiResponseJSON('success');
              res.body.should.have.a.property('data').that.is.an('array');
              for (var i = res.body.data.length - 1; i >= 0; i--) {
                res.body.data[i].should.be.a.neighborhoodJSON;
              }
              return done();
            });
    });
  });
};

