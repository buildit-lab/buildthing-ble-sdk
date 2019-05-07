//만약 Webpack을 사용하지 않을 경우, 아래 코드 라인을 주석 처리하고
// If you are not using Webpack, comment out the line of code below.

//타겟 플랫폼에 해당하는 모듈을 참조하는 라인의 주석을 해제하세요.
// And then, Uncomment specific line of code about reference to the module that corresponds to the target platform.

// for MacOS (No Webpack Configuration)
// var BuildThingBLE = require('./dist/buildthing.ble.electron.darwin.js')
// for Windows (No Webpack Configuration)
//var BuildThingBLE = require('./dist/buildthing.ble.electron.win32.js')
// for Mobile (iOS, Android) (No Webpack Configuration)
//var BuildThingBLE =  require('./dist/buildthing.ble.cordova.js')
// for Webpack alias Configuration
var BuildThingBLE = require('buildthing-beacon-sdk')
module.exports = BuildThingBLE
