'use strict';

var mmock = require('mongoose-mock'),
  proxyquire = require('proxyquire'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  chai = require('chai'),
  should = chai.should,
  mongoose = require('mongoose'),
  api_assertions = require('../../lib/apiJsonChai.js');

chai.use(sinonChai);

describe('[unit] Account Controller', function() {

  describe( '.create', function() {

    it('should create a document and save it', function() {
      var documents = [];
      proxyquire('../../../app/model/account', {'mongoose': mmock });
      var AccountController = proxyquire('../../../app/controllers/accounts', 
        {'mongoose': mmock });
      mmock.on('document', documents.push.bind(documents));      
      // invoke .create
      var req = {
        params: {
          email: "seb@foo.bar",
          password: "apwd"
        }
      };
      AccountController.create(req,null,null);
      documents.should.have.length(1);
      documents[0].save.should.have.been.called;
    });

    it('it should set a response and call next when document is saved', function() {
      proxyquire('../../../app/model/account', {'mongoose': mmock });
      var Account = mmock.model('Account');
      var AccountController = proxyquire('../../../app/controllers/accounts', 
        {'mongoose': mmock });
      mmock.on('document', function(document) {
        document.save.onCall(0).callsArg(0);
        document.id = 'id';
      });
      // invoke .create
      var req = {
        params: {
          email: "seb@foo.bar",
          password: "apwd"
        }
      };
      var next = sinon.spy();
      var res = { send: sinon.spy() };
      AccountController.create(req,res,next);
      next.should.have.been.called;
      res.send.should.have.been.called;
      res.send.args[0][0].should.be.an.apiResponseJSON;
      res.send.args[0][0].data.should.be.an.accountDetailJSON;
    });


    it('it should set an error when the save fails.', function() {
      proxyquire('../../../app/model/account', {'mongoose': mmock });
      var Account = mmock.model('Account');
      var AccountController = proxyquire('../../../app/controllers/accounts', 
        {'mongoose': mmock });
      mmock.on('document', function(document) {
        document.save.onCall(0).callsArgWith(0, 'this is an error');
        document.id = 'id';
      });
      // invoke .create
      var req = {
        params: {
          email: "seb@foo.bar",
          password: "apwd"
        }
      };
      var next = sinon.spy();
      var res = { send: sinon.spy(), status: sinon.spy() };
      AccountController.create(req,res,next);
      next.should.have.been.called;
      res.send.should.have.been.called;
      res.send.args[0][0].should.be.an.apiResponseJSON;
      res.send.args[0][0].status.should.equal('error');
      res.status.should.have.been.called;
      res.status.should.have.been.calledWith(500);
    // it('it should')
    });

  });
  //   var AccountController;
  //   var AccountModel;
  //   var account;
  //   var models = [];
  //   var documents = [];
  //   var res, next;

  //   function saveModel(model) {
  //     models.push(model);
  //   }

  //   function saveDocument(document) {
  //     documents.push(document);
  //   }

  //   before(function() {
  //     // Inject mongoose-mock in model and controller and register 
  //     // event handlers.
  //     proxyquire('../../../app/model/account', {
  //       'mongoose': mmock
  //     });
  //     AccountController = proxyquire('../../../app/controllers/accounts', {
  //       'mongoose': mmock
  //     });
  //     // register event handlers
  //     mmock.on('model', saveModel);
  //     mmock.on('document', saveDocument);

  //     // invoke .create
  //     var req = {
  //       params: {
  //         email: "seb@foo.bar",
  //         password: "apwd"
  //       }
  //     };
  //     res = sinon.spy();
  //     next = sinon.spy();

  //     AccountController.create(req, res, next);
  //   });

  //   after(function() {
  //     // clear models and documents, remove handlers and clear the require cache.
  //     models = [];
  //     documents = [];
  //     mmock.removeListener('model', saveModel);
  //     mmock.removeListener('document', saveDocument);
  //     delete require.cache[require.resolve('../../../app/model/account')];
  //     delete require.cache[require.resolve('../../../app/controllers/accounts')];
  //   });

  //   it('should create an Account document', function() {
  //     documents.should.have.length(1);
  //   });

  //   it('should call save on the document', function() {
  //     documents[0].save.should.have.been.called;
  //   });
  // });

});