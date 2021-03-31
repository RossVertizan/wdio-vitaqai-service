### How to develop
This is developed in-situ in a WebdriverIO hierarchy.  To develop, simply clone webdriverIO and then add this as a submodule in the packages directory

e.g.:
```
cd <webdriverio_install_root>/packages
git submodule add https://RossVertizan@bitbucket.org/RossVertizan/wdio-vitaqai-service
```

### How to publish
```npm publish --registry http://localhost:4873```


### How to install
Installed as part of wdio-vitaq-mocha-framework

npm install @wdio/vitaq-mocha-framework@<version> --save-dev



