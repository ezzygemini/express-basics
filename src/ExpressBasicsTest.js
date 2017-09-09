const trueTypeOf = require('ezzy-typeof');
const express = require('express');
const request = require('ezzy-testing/request');
const ExpressBasics = require('./ExpressBasics');
let app;

describe('ExpressBasics', () => {

  beforeEach(() => {
    app = new ExpressBasics(express());
  });

  it('should have the bindable methods', () => {
    expect(app.use).toBeDefined();
    expect(app.get).toBeDefined();
    expect(app.post).toBeDefined();
    expect(app.delete).toBeDefined();
    expect(app.listen).toBeDefined();
    expect(app.i18n).toBeDefined();
  });

  describe('HttpBasics', () => {

    afterEach(() => {
      app.close();
    });

    it('should have the request object', done => {
      app = app.use('/', basics => {
        basics.response.send(trueTypeOf(basics.request));
      }).listen(3001);
      request(app)
        .get('/')
        .expect('object', done);
    });

    it('should have the response object', done => {
      app = app.use('/', basics => {
        basics.response.send(trueTypeOf(basics.response));
      }).listen(3001);
      request(app)
        .get('/')
        .expect('object', done);
    });

    it('should have the next function', done => {
      app = app.use('/', basics => {
        basics.response.send(trueTypeOf(basics.next));
      }).listen(3001);
      request(app)
        .get('/')
        .expect('function', done);
    });

    it('should have the body function', done => {
      app = app.use('/', basics => {
        basics.response.send(trueTypeOf(basics.body));
      }).listen(3001);
      request(app)
        .get('/')
        .expect('function', done);
    });

  });

});
