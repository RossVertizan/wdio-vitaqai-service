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
when it has built succesfully it can then be committed, version number updated:
```node
npm version <version number>
```
and then published to the registry
```node
npm publish --registry http://localhost:4873
```

### How to install
Installed as part of wdio-vitaq-mocha-framework

npm install @wdio/vitaq-mocha-framework@<version> --save-dev







## Development Notes
### Study of the Sauce Service

