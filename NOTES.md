### How to develop
This is developed in-situ in a WebdriverIO hierarchy.  To develop, simply clone webdriverIO and then add this as a submodule in the packages directory

#### To build the WebdriverIO directory
```node
git clone https://github.com/webdriverio/webdriverio
git clone https://github.com/webdriverio/webdriverio webdriverio-vitaq-dev
cd .\webdriverio-vitaq-dev\
npm install
npm run setup-full
```

#### To add the submodule
```node
cd <webdriverio_install_root>/packages
git submodule add https://RossVertizan@bitbucket.org/RossVertizan/wdio-vitaqai-service
```

### How to publish

#### Dependencies
This package has three dependencies that may also need to be updated, these are:
1. vitaqai-api (Y:\vitaqai-api)
2. wdio-vitaqai-mocha-framework (H:\Git\webdriverio-vitaq-dev\packages\wdio-vitaqai-mocha-framework)
3. vitaqai-mocha (H:\Git\vitaqai-mocha)

Check that these have all been published as necessary and their final versions inserted into the package.json of this package before going through the following steps.

#### Build

##### New build system
When switching to building ofr CommonJS (cjs) and ES Module (esm), followed this [guide](https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html).

Now the build is run directly from within the module using:

```shell
npm run build
```

Need to see if we can make this a stand-alone module.

##### Old build system
Before publishing, the code needs to be built. To do this go to the webdriverio-vitaq-dev project (H:\Git\webdriverio-vitaq-dev) and run
```node
npm run build
```
It is actually easiest to set:
```node
npm run watch
```
and take advantage of incremental builds.

#### Commit
When it has built successfully it can then be committed

#### Tag
Update the version number
```node
npm version <version number>
git push
```

#### Publish
Then publish to the registry:
```node
npm publish --registry http://localhost:4873
```
Can also publish to the cloud repository:
```node
npm publish --registry https://pkgs.vitaq.online
```


### How to install
Installed as part of wdio-vitaqai-mocha-framework:
```node
npm install wdio-vitaqai-mocha-framework@<version> --registry http://localhost:4873 --save-dev
```
or manually with:
```node
npm install wdio-vitaqai-service@<version> --registry http://localhost:4873 --save-dev
npm install wdio-vitaqai-service@latest --registry http://localhost:4873 --save-dev
```
Or
```node
npm update wdio-vitaqai-service --registry http://localhost:4873 --save-dev
```
Or from the cloud:
```node
npm install wdio-vitaqai-service@<version> --registry https://pkgs.vitaq.online
```

## Development Notes

### Notes during selection of methods to expose

1. Focussing on the methods associated with controlling the actions/next actions because we don't know how mch people will want to programmatically control the data generation.
2. abort - need to find a way to pass the current action without the user having to do anything. Should be able to get this from the next action mechanism. Implemented in vitaqai-api convertArguments method
3. Need to handle default values in the writer - implemented with default in YAML
4. Several methods need customising, see:
   ```yaml
   Need to modify template code to handle a list of values
   ```
5. Need to remove the name sequence/sequences and replace it with action/actions - implemented with altname field in YAML
6. add_next/remove_next need the action specified as the second argument to be prefixed with "top." - implemented in the convertArguments method in vitaqai-api.
7. Need to convert boolean return values from Python  - implemented in vitaqai-api/convertReturn method
8. Discovered bug in GenFromList - weights are incorrect if not initialised with weights.  A weights array is maintained which keeps a list of the weights, but this is not initialised if the starting description does not have weights.  This issue has now been fixed  - just need a new build of the C++ code.

### Client methods to port

Need to have all of these methods supported from the Vitaq client
Three bits to the implementation:
1. In the socketClient.js (vitaqai-api)
2. In index.js - a caller function (vitaqai-api)
3. In service.ts - the exposed method (wdio_vitaq_service)


1. requestData - implemented
   - Also have getGen which is implemented as two runCommand calls (gen + get_value)
2. runCommand - already implemented in above work - this is the "core" function
3. recordCoverage
4. sendDataToVitaq/ writeDataToVitaq
5. readDataFromVitaq
6. createVitaqLogEntry
All implemented and passing correct usage tests

### Handling errors and exceptions
1. vitaq.read("DoesNotExist") - causes error in Python code
    - Need to modify Python interface code
    - Link the development code in with:
      ```shell
      cmd /c mklink /d lib Y:\git_xpose_cover_branch_4.0_release\bindings\python
      ```
Error now handled correctly


## Debugging
To check that the server is responding to API calls
```javascript
this.runTestData = await got(`https://vitaq.online/api/health-check`);
console.log(this.runTestData.body)
```
Need to work on this to make this a management utility


