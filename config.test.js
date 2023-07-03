"use strict";
//this uses strict too


//this is the test from the config file 
describe("config can come from env", function () {
  test("works", function() {
    // this is giving it mock data and setting it up to test if the config can get these variables 
    process.env.SECRET_KEY = "abc";
    process.env.PORT = "5000";
    process.env.DATABASE_URL = "other";
    process.env.NODE_ENV = "other";

    //this is the config checking these variables 
    const config = require("./config");
    expect(config.SECRET_KEY).toEqual("abc");
    expect(config.PORT).toEqual(5000);
    expect(config.getDatabaseUri()).toEqual("other");
    expect(config.BCRYPT_WORK_FACTOR).toEqual(12);

    //this is doing the delete ( tear down )
    delete process.env.SECRET_KEY;
    delete process.env.PORT;
    delete process.env.BCRYPT_WORK_FACTOR;
    delete process.env.DATABASE_URL;

    //this is checking to see if the database is connected to jobly then connects to test
    expect(config.getDatabaseUri()).toEqual("jobly");
    process.env.NODE_ENV = "test";

    //connects back to the other one
    expect(config.getDatabaseUri()).toEqual("jobly_test");
  });
})

