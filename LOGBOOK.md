## 30/03/2021
### 16:07
Created with "npm run create" and files copied from sauce-service


---
## 20/04/2021
### 09:59
Have this to the point where I can now run Vitaq jobs through the sauce service and have demonstrated running the Vitaq set_enabled command.

Now need to build out:
    1. The full set of commands on Vitaq
    2. The remaining commands in the Vitaq client

1. Vitaq commands
    Copied files into vitaq_methods that list all of the vitaq classes and methods in different YAML files.
   See if we can find a way to develop a YAML file to capture the arguments and the return values - use set_enabled as an example

---
## 25/11/2022
### 11:30:22
Creating a combined ESM and CJS module:
Look at example in: https://github.com/webdriverio-community/wdio-chromedriver-service
https://www.sensedeep.com/blog/posts/2021/how-to-create-single-source-npm-module.html
