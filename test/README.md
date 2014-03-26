# Testing the service

In this project, we have two types of tests: _UNIT_ and _INTEGRATION_.
UNIT tests are written to establish that a specific component behaves 
as it is intended to.  A unit test has two key characteristic:

1. It exercices error cases and ensures that all code paths
   in the component behaves as expected.
2. It has no external dependencies, therefore it can run on the 
   local machine without any network or required software (like a 
   database).

The second type of tests are INTEGRATION tests.  These tests are 
designed to exercise the external interfaces of the application and 
assert expected outcomes. For these tests to operate, it is expected 
that external dependent systems are available and configured properly.

Integration tests can be ran on _any_ environment without any negative
functional impact to current clients or the application itself.  This
is important because integration tests could be executed against a 
production environment as well as a development setup.

In the simplest case, an INTEGRATION test would call one api, validate
success, and maybe a few requirements around it's specification. This
is the typical starting point for the developer when it is time to 
code a feature, and a good source of documentation for the api user as
well.

More sophisticated features may require more than a single api call.
For example, user registration may require multiple steps to complete.
These scenarios are INTEGRATION tests, but since they define very
specific use-cases that describe the application in great detail, we 
characterize these tests as ACCEPTANCE tests.  Unlike INTEGRATION tests,
UNIT tests cannot be a type of ACCEPTANCE test because they lack 
a client interface and a functional environment.

Finally, another major class of test are REGRESSION tests.  These tests
may be of either type UNIT or INTEGRATION and are specific to reported
customer bugs.  The main goal of a REGRESSION test is to prevent the 
reapperance of a resolved bugs.

## Naming Tests

As the application broaden it's feature set and the code base matures,
the number of tests can become quite large.  These tests needs to be 
manageable as more and more are added to the code base. Besides a proper
folder structure, the Mocha framework offers a way to run tests
selectively by pattern matthing their names. For this work, we use a 
naming scheme that offers the flexibility and searchability.

Keep in mind that the goal of the naming convention is to allow the 
developer to easily select tests to run based on grep'able strings.

For example, to run all the INTEGRATION tests in production:

```bash
$ env TEST_URL=api.share2give.com mocha -R spec --recursive test -g "INTEGRATION" | bunyan
```

To run all tests against against the '/neighborhood' route, both unit (local)
and integration in staging.

```bash
$ env TEST_URL=staging-api.share2give.com mocha -R spec --recursive test -g "/neighborhood" | bunyan
```

To run all tests on the Models:
```bash
$ mocha -R spec --recursive test -g "Model" | bunyan
```

To exercise only the unit test for create function in the Account 
controller module:
```bash
$ mocha -R spec test/unit/controllers/accountsSpec.js -g "#create" |  bunyan
```

For more refined control on single tests, you can always use [.only](
http://visionmedia.github.io/mocha/#exclusive-tests) in 
the test file during development. 

### Test Suites

The core organizing element in the testing framework is the suite's 
'describe' directive.  The top level describe needs to follow this
convention:

* Each test has a major type of either UNIT or INTEGRATION, not both.
* Add ACCEPTANCE to a INTEGRATION tests that document use-cases.
* Add REGRESSION to any tests that are created after a bug-report.
* If the test is a REGRESSION, include the bug number.
* Optionally include the name of the name of object or module.
* If applicable, specify the 'type' of the component targetted as part
  of the suite, e.g. 'Route' or 'Controller' or 'Model'.  This is
  usually the name of the folder holding the target module.

Here are a few examples:

```javascript
describe('UNIT Account Controller', function () {});
describe('UNIT Account Model', function () {});
describe('UNIT /neighborhoods Route', function() {});
describe('INTEGRATION Route', function () {});
describe('INTEGRATION ACCEPTANCE UserRegistration', function () {});
describe('INTEGRATION REGRESSION PasswordReset', function() {})
```

When specifying a UNIT test for a route, *always* use the route path
and precede the route with a /.  This is allow for specific test 
selections based on paths instead of module implementing the paths.
There is a similar rule for INTEGRATION test for routes, but for those,
the route is preceded with a '#/'.  This is described further down.

### Nested Test Suites
The naming rules for nested test suites vary depending on the type of
their parent test suite.

#### Suites nested under UNIT tests 
Most of the time module methods are described as their own test suite
inside of their parent module test suite.  The convention to use is:

* Start with REGRESSION if applicable, followed by bug number.
* Use the exact function name tested preceded with a #.

#### Suites nested under INTEGRATION 

For Routes, the important information is the path and the method:

* Start with the HTTP method, e.g. GET PUT POST DELETE etc.
* Specify the full path starting with '#/'.

If there are further suites nested under any of the routes, include
the full path for each of these suites.  

For ACCEPTANCE test suite, you will probably want to add a text after
the route to describe the step a bit more.

Some examples:

```javascript
describe( 'POST #/accounts', function() {});
describe( 'GET #/neighborhoods', function() {});
```

## Developing with tests

Javascript is finicky so a good setup to continuously lint and test is 
not only useful, but essential. At a minimum, you should run the grunt
watch task:

```bash
grunt watch --env development | bunyan
```

This will monitor the project folder and trigger a rebuild:

* jshint
* mochaTest
* istanbul (coverage)
 
This by itself will ensure you are developing robust code.

### Other tasks
The package manager NPM has a few commands for testing that are used
during the build of the application on the CI system:

```bash
$ npm run-script mocha     # runs integration and unit tests
                           # using the default environment in the 
                           # app configurations (app/config.js) 
$ npm test                 # runs istanbul wrapped mocha to get test 
                           # and coverage.
$ npm run-script coverage  # runs a script that tests the coverage
                           # thresholds.
```

There are also some grunt tasks you can invoke for greater control:

```bash
grunt mochaTest
grunt jshint
grunt mocha_istanbul
```

And finally, you can run the individual tools:

### Configuring the tests
By supplying environment variables, you can configure how the tests
can run.

You can find all the documentation for these in [config.js](https://bitbucket.org/share2give/s2g-server/src/bd98e8eaae224e65d2acf4ad2776d51afa88affe/app/config.js?at=master)

A few handy ones:
* TEST_URL - Only used for tests, specifies what endpoint for integration and acceptance tests.
* NODE_ENV - The config environment to use for the app.
* PORT - Port for the endpoint
* CLUSTER - true to enable cluster mode.
* LOG_LEVEL - Global log level

