'use strict';

var mmock = require('mongoose-mock'),
  proxyquire = require('proxyquire'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  chai = require('chai'),
  should = chai.should,
  mongoose = require('mongoose')
  ;

chai.use(sinonChai);

describe('[unit] Account Controller', function() {

  var AccountController;
  var AccountModel;
  var account;
  var sink = [];

  before(function() {
    mmock.sink = sink;
    proxyquire('../../../app/model/account', {
      'mongoose': mmock
    });
    AccountController = proxyquire('../../../app/controllers/accounts', {
      'mongoose': mmock
    });
    AccountModel = mmock.model('Account');
    account = new AccountModel();
    // console.log(AccountModel);
  });

  it('should call save', function() {
    var req = {
      params: {
        email: "seb@foo.bar",
        password: "apwd"
      }
    };
    var res = sinon.spy();
    var done = sinon.spy();

    AccountController.create(req, res, done);
    
    // account.save.should.have.been.called;
    // AccountModel.save.should.have.been.called;
  });


});