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
#### Build
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
Installed as part of wdio-vitaq-mocha-framework:
```node
npm install @wdio/vitaq-mocha-framework@<version> --registry http://localhost:4873 --save-dev
```
or manually with:
```node
npm install @wdio/vitaqai-service@<version> --registry http://localhost:4873 --save-dev
```
Or from the cloud:
```node
npm install @wdio/vitaqai-service@<version> --registry https://pkgs.vitaq.online
```

## Development Notes

### Notes during selection of methods to expose

1. Focussing on the methods associated with controlling the actions/next actions because we don't know how mch people will want to programmatically control the data generation.
2. abort - need to find a way to pass the current action without the user having to do anything. Should be able to get this from the next action mechanism. Implemented in vitaqai_api convertArguments method
3. Need to handle default values in the writer - implemented with default in YAML
4. Several methods need customising, see:
   ```yaml
   Need to modify template code to handle a list of values
   ```
5. Need to remove the name sequence/sequences and replace it with action/actions - implemented with altname field in YAML
6. add_next/remove_next need the action specified as the second argument to be prefixed with "top." - implemented in the convertArguments method in vitaqai_api.
7. Need to convert boolean return values from Python  - implemented in vitaqai_api/convertReturn method
8. Discovered bug in GenFromList - weights are incorrect if not initialised with weights.  A weights array is maintained which keeps a list of the weights, but this is not initialised if the starting description does not have weights.  This issue has now been fixed  - just need a new build of the C++ code.

### Client methods to port

Need to have all of these methods supported from the Vitaq client
Three bits to the implementation:
1. In the socketClient.js (vitaqai_api)
2. In index.js - a caller function (vitaqai_api)
3. In service.ts - the exposed method (wdio_vitaq_service)


1. requestData - implemented
   - Also have getGen which is implemented as two runCommand calls (gen + get_value)
2. runCommand - already implemented in above work - this is the "core" function
3. recordCoverage
4. sendDataToVitaq/ writeDataToVitaq
5. readDataFromVitaq
6. createVitaqLogEntry
All implemented and passign correct usage tests

### Handling errors and exceptions
1. vitaq.read("DoesNotExist") - causes error in Python code
    - Need to modify Pythin interface code
    - Link the development code in with:
      ```shell
      cmd /c mklink /d lib Y:\git_xpose_cover_branch_4.0_release\bindings\python
      ```



### Other things to do
1. Make all this work in K8S
2. Check coverage is working - how to specify ?
3. Check AI is working - need to make re-runs possible
4. Enable sequence runs



### Study of the Sauce Service

