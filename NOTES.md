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
Before publishing, the code needs to be built. To do this go to the webdriverio-vitaq-dev project (H:\Git\webdriverio-vitaq-dev) and run
```node
npm run build
```
when it has built successfully it can then be committed and then published to the registry
```node
npm publish --registry http://localhost:4873
```
after publishing update the version number for any further changes
```node
npm version <version number>
```

### How to install
Installed as part of wdio-vitaq-mocha-framework:
```node
npm install @wdio/vitaq-mocha-framework@<version> --registry http://localhost:4873--save-dev
```
or manually with:
```node
npm install @wdio/vitaqai-service@<version> --registry http://localhost:4873 --save-dev
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

### Study of the Sauce Service

