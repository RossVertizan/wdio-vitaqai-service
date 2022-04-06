![vitaq logo](https://vitaq.io/wp-content/uploads/2020/10/Vitaq-new-logo-small.png)


# WDIO VitaqAI Service

**A plugin service for WebdriverIO to allow the use of VitaqAI**

## Description
This is a [WebdriverIO](https://webdriver.io) service that integrates the [Vitaq AI](https://vitaq.io) testing platform.

## Installation

This is one of a number of packages that are required to integrate WebdriverIO with Mocha and Vitaq, this is the master package and the other required packages are dependencies of this package.

The easiest way is to keep ```wdio-vitaqai-service``` as a devDependency in your ```package.json``` e.g:

```json
{
  "devDependencies": {
    "wdio-vitaqai-service": "^1.10"
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
        ['./test/specs/*.js']
    ],
```
2. Set the framework to be vitaqai-mocha:
```json
    "framework": 'vitaqai-mocha',
```

3. Add the vitaqai service and the parameters:
```json
"services": [
        ['vitaqai', {
            userName: 'fred@webtesting.com',
            testActivityName: 'Shopping_Basket_Test',
            projectName: "SellStuff",
            url: "https://vitaq.online",
            userAPIKey: "...",
            useSync: true
        }],
        'chromedriver',
    ],
```
Where:

- `userName` - refers to the user name of your account on vitaq.online
- `testActivityName` - refers to the name of the test activity you wish to use
- `projectName` - refers to the project containing the test activity
- `url` - is the URL for the Vitaq
- `userAPIKey` - is the API key copied from your vitaq.online account
- `useSync` - when set to true specifies that the @wdio/sync capability (now deprecated) should be used

Mocha Options can be added in the [usual way](https://webdriver.io/docs/frameworks/#mocha-options)


For more information on WebdriverIO see the [homepage](https://webdriver.io).
