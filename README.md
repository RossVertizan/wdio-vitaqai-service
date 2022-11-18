![vitaq logo](https://vitaq.io/wp-content/uploads/2020/10/Vitaq-new-logo-small.png)



# WDIO VitaqAI Service
[![npm version](https://badge.fury.io/js/wdio-vitaqai-service.svg)](https://badge.fury.io/js/wdio-vitaqai-service)
[![downloads](https://img.shields.io/npm/dm/wdio-vitaqai-service)](https://img.shields.io/npm/dm/wdio-vitaqai-service)

Vitaq AI is a unique AI-powered cloud based test automation tool built on WebdriverIO.
Accessed through your browser to easily capture a graphical digital twin of your application. It extends the full capability of Webdriverio into a model-driven approach for web, mobile and API testing. 
- Uses the power of variability to find defects that other approaches miss.
- Measures and analyses what has been tested and what has not been tested into a user journey cloud based test coverage database.
- Reduces your risks with machine learning by prioritising your most critical user journeys.

## Installation

This is one of a number of packages that are required to integrate WebdriverIO with Mocha and Vitaq, this is the master package and the other required packages are dependencies of this package.

The easiest way is to keep ```wdio-vitaqai-service``` as a devDependency in your ```package.json``` e.g:

```json
{
  "devDependencies": {
    "wdio-vitaqai-service": "^1.1.26"
  }
}
```
You can install it either with npm:

```bash
npm install wdio-vitaqai-service --save-dev
```
or Yarn:
```bash
yarn add wdio-vitaqai-service --dev
```

Instructions on how to install `WebdriverIO` can be found [here.](https://webdriver.io/docs/gettingstarted)

## Upgrade
If you want to do an incremental upgrade of this package, then it can be done with npm:

```bash
npm install wdio-vitaqai-service@<version> --save-dev
```

or Yarn:

```bash
yarn add wdio-vitaqai-service@<version> --dev
```

where `<version>` should be substituted with the version you wish to install.

## Configuration

In order to use this package the WebdriverIO configuration file (default name wdio.conf.js) needs to be modified in the following ways:

1. Group the specs so they are all run in the same runner instance:
```json
    "specs": [
        ["./test/specs/*.js"]
    ],
```
2. Set the framework to be vitaqai-mocha:
```json
    "framework": 'vitaqai-mocha',
```

3. Add the vitaqai service and the parameters:
```json
"services": [
        ["vitaqai", {
            userName: "fred@webtesting.com",
            testActivityName: "Shopping_Site_Test",
            projectName: "Surf_Shop",
            url: "https://vitaq.online",
            userAPIKey: "..."
        }],
        "chromedriver",
    ],
```
Where:

- `userName` - refers to the user name of your account on vitaq.online
- `testActivityName` - refers to the name of the test activity you wish to use
- `projectName` - refers to the project containing the test activity
- `url` - is the URL for the Vitaq
- `userAPIKey` - is the API key copied from your vitaq.online account


Mocha Options can be added in the [usual way](https://webdriver.io/docs/frameworks/#mocha-options)

For more information on WebdriverIO see the [homepage](https://webdriver.io).

## Documentation
Details of all of the above configuration options and details of command line usage can be found in the [Vitaq AI WebdriverIO Service](https://vitaq.online/documentation/vitaqService) documentation.

## Getting Started with VitaqAI for WebdriverIO

The quickest way to get started with Vitaq is to:

1. Register for an account on [vitaq.online](https://vitaq.online/register)
2. Follow the steps in the [getting started with Vitaq AI](https://vitaq.online/documentation/gettingStarted) guide to run through the example we have provided.
3. Create your own test activity diagram and follow the steps to get that running.