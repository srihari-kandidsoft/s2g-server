'use strict';

/* Sample structure creating a route test.
 * Include route.{name}.js in routeSpec.js through the require() function.
 * This one has name=test (it's the test route after all).  If you create
 * a route named 'login', your test will be named: route.login.js.
 * If the test is too large and needs to be broken out, you can name them
 * by operation:
 *    route.login.get.js
 *    route.login.post.js
 */
module.exports = function(request, url) {
  describe( 'GET /test', function() {
    it('should return the static test response', function (done) {
      request(url)
            .get('/test')
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json')
            .expect(200)
            .end(function (err, res) {
              if (err) return done(err);
              var resp = res.body;
              resp.should.be.an('object');
              resp.result.should.equal("test");
              return done();
            });
    });
  });
};