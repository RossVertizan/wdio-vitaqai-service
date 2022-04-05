ECHO OFF
ECHO Have you committed all of your changes?
ECHO If not you'll get an error at the next step.
PAUSE

REM Increment the patch (last) part of the version number and push it
echo[
echo Should we increment the patch number?
SET /P PATCH=Increment patch (YES to increment)? %=%
if %PATCH% == YES (
    CALL npm version patch
    CALL git push
)

REM Publish it to the local and private cloud repos
echo[
echo Would you like to push this to the local repository (Verdaccio) ?
echo [Verdaccio needs to be running first]
SET /P LOCAL=Push to local repository (YES to push)? %=%
IF %LOCAL% == YES (
    CALL npm publish --registry http://localhost:4873
)

echo[
echo Would you like to push this to the private cloud repository (pkgs.vitaq.online) ?
SET /P PRIVATE_CLOUD=Push to private cloud repository (YES to push)? %=%
IF %PRIVATE_CLOUD% == YES (
    CALL npm publish --registry https://pkgs.vitaq.online
)

echo[
echo Would you like to push this to the public NPM repository (npmjs.org) ?
SET /P PUBLIC_CLOUD=Push to public cloud repository (YES to push)? %=%
IF %PUBLIC_CLOUD% == YES (
    CALL npm publish --registry https://registry.npmjs.org
)
