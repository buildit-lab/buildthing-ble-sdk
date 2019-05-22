# BuildThing™ ️beacon SDK

[![BuildThing beacon](https://buildit.kr/dist/img/img-buildthing-beacon.ade36617.png)](https://buildit.kr/products/beacon-and-sdk)

BuildThing™ beacon SDK는 Javascript 기반으로 구현된 Cross Platform SDK 입니다.
[Cordova](https://cordova.apache.org/) 및 [Electron](https://electronjs.org/) 기반의 어플리케이션에서 동작하며, iOS/Android/Windows/MacOS에서 배포 가능합니다.
SDK에서 제공하는 주요 기능들은 다음과 같습니다.

  - BuildThing™ beacon의 스캔 및 Advertising Packet 수신
  - BuildThing™ beacon 연결 및 비콘 값 설정
  - BuildThing™ beacon 영역의 진입/이탈 이벤트 수신 (Monitoring)
  - BuildThing™ beacon 과의 거리 확인 (Ranging)

## 목차
* [설치](#설치)
* [사용 가이드](#사용-가이드)
* [API 문서](#API-문서)
* [Scan Response](#Scan-Response)
* [Advertising Packet](#Advertising-Packet)
* [Connection Service](#Connection-Service)
* [참고 사항](#Connection-Service)
* [고객 문의](#고객-문의)

## 설치
BuildThing™ beacon SDK의 실행을 위해서는 [Node.js](https://nodejs.org/) 8.x를 필요로합니다.

```sh
$ npm install buildthing-beacon-sdk
```

## 사용 가이드
iOS/Android 등 Mobile 플랫폼은 Codrova 기반의 개발 환경(e.g : Ionic Framework, PhoneGap 등)에서 사용 가능하며, MacOS/Windows 등 Desktop 플랫폼은 Electron 기반의 개발 환경에서 사용 가능합니다.

### Mobile
#### 의존 Cordova Plugin 설치
Ionic Framework, Phonegap 등 Cordova 기반의 개발 환경은 아래와 같이 프로젝트 Root 디렉토리에서 Cordova CLI 를 통해 의존 Cordova 플러그인들을 설치 해야합니다.
##### cordova-plugin-ble-central
BLE 통신을 위한 플러그인 입니다.
```sh
# Cordova
$ cordova plugin add cordova-plugin-ble-central
# PhoenGap
$ phonegap cordova plugin add cordova-plugin-ble-central
# Ionic Framework
$ ionic cordova plugin add cordova-plugin-ble-central
```
##### cordova-plugin-background-mode
백그라운드 모드 스캔을 지원하기 위한 플러그인 입니다.
```sh
# Cordova
$ cordova plugin add cordova-plugin-background-mode
# PhoneGap
$ phonegap cordova plugin add cordova-plugin-background-mode
# Ionic Framework
$ ionic cordova plugin add cordova-plugin-background-mode
```
##### cordova-custom-config
iOS는 백그라운드 모드 스캔을 사용하기 위해서 아래과 같이 cordova-custom-config 플러그인을 추가하고 config.xml에 UIBackgroundModes 관련 설정을 추가합니다.
```sh
# Cordova
$ cordova plugin add cordova-custom-config
# PhoneGap
$ phonegap cordova plugin add cordova-custom-config
# Ionic Framework
$ ionic cordova plugin add cordova-custom-config
```
###### config.xml
```sh
<platform name="ios">
  <allow-intent href="itms:*" />
  <allow-intent href="itms-apps:*" />
  <config-file parent="UIBackgroundModes" target="*-Info.plist">
    <array>
      <string>bluetooth-central</string>
    </array>
  </config-file>
</platform>
```
#### Cordova / PhoneGap
##### index.js
아래와 같이 buildthing-beacon-sdk 모듈을 사용합니다. `deviceready 이벤트 함수 (cordova 정의 이벤트) 호출된 이후에 사용해야 정상적으로 동작합니다.`
```
const { Manager } = require('buildthing-beacon-sdk')

var app = {
   // Application Constructor
   initialize: function() {
     this.bleManager = null
     this.bindEvents();
   },
   // Bind Event Listeners
   //
   // Bind any events that are required on startup. Common events are:
   // 'load', 'deviceready', 'offline', and 'online'.
   bindEvents: function() {
       document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
   },
   // deviceready Event Handler
   //
   onDeviceReady: function() {
       this.receivedEvent('deviceready');
       // sdk test code
       this.bleManager = new Manager()
       this.bleManager._ble.on('stateChange', function (state) {
         console.log(state)
         if(state === 'on' || state === 'turningOn') this.bleManager.startScan()
       }.bind(this))
   },
   ...
};

window.app = app
```

##### Webpack 또는 Browserify
`Cordova, PhoneGap CLI 로 생성한 프로젝트의 경우, 기본 번들러(Bundler)가 존재하지 않습니다.` 이에 따라, webpack, browserify 등의 번들러를 통하여 bundle.js를 생성하여 사용해야하므로 webpack 또는 browserify 등과 같은 JS 모듈 번들러를 설치합니다.
```sh
$ npm install -g webpack
```
또는
```sh
$ npm install -g browserify
```
###### Webpack
아래와 같이 webpack.config.js 를 생성합니다.
```
// webpack.config.js
module.exports = {
  entry: ['./www/js/index'],
  module: {...},
  output: {
		chunkFilename: '[name].js',
		filename: 'bundle.js',
		path: path.resolve(__dirname, './www/dist/js')
	},
  ...
}
```
아래 명령어를 입력하여 JS 파일을 번들링하고 ./www/dist/js/bundle.js 파일을 생성합니다.
```sh
$ webpack
```
###### Browserify
아래 명령어를 입력하여 JS 파일을 번들링하고 ./www/dist/js/bundle.js 파일을 생성합니다.
```sh
$ browserify ./www/js/index.js -o ./www/dist/js/bundle.js
```
##### index.html
아래와 같이 index.html 에 번들링 된 bundle.js를 삽입 합니다.
```
<!-- www/index.html -->

<html>
<head>
    ...
</head>
<body>
    <div class="app">
        <h1>PhoneGap</h1>
        <div id="deviceready" class="blink">
            <p class="event listening">Connecting to Device</p>
            <p class="event received">Device is Ready</p>
        </div>
    </div>
    <script type="text/javascript" src="cordova.js"></script>
    <!-- <script type="text/javascript" src="js/index.js"></script> -->
    <script type="text/javascript" src="dist/js/bundle.js"></script>
    <script type="text/javascript">
        app.initialize();
    </script>
</body>
</html>
```

#### Ionic 4 (Cordova + AngularJS)
##### Known Issues
###### iOS 12.2 에서 cordova-plugin-ionic-webview 와 cordova-plugin-background-mode 플러그인 충돌
 Ionic Framework는 iOS에서 기본적으로 WKWebView를 사용하는데, 관련 플러그인과 buildthing-ble-sdk의 의존 플러그인인 cordova-plugin-background-mode 플러그인이 iOS 12.2 에서 충돌하는 이슈가 존재합니다. 2019년 5월 10일 기준, 아직 버그가 Fix 되지 않아 [연관 이슈](https://github.com/katzer/cordova-plugin-background-mode/issues/419#issuecomment-473851949)와 같이 플러그인의 iOS 코드를 수정해야만 정상 동작 합니다.

##### Ionic 4 : 예제
buildthing-beacon-sdk 는 다른 Cordova 플러그인들과 마찬가지로 deviceready 이벤트 호출 이후에 사용가능합니다. 따라서 Ionic 4 내 Angular JS Component 에서 사용할 때에도 아래 코드와 같이 deviceready 이벤트 호출 이후에 사용합니다.
```
// home.page.ts

import { Platform } from '@ionic/angular';
import { Manager } from 'buildthing-beacon-sdk';

@Component({
selector: 'app-home',
templateUrl: 'home.page.html',
styleUrls: ['home.page.scss'],
})
export class HomePage {
public bleManager: Manager
  constructor(public plt: Platform) {
    // ionic 프레임워크 사용시, 다음과 같은 방법으로도 cordovad의 deviceready 이벤트 콜백 함수를 정의 및 등록 할 수 있습니다.
    this.plt.ready().then((readySource) => {
      this.bleManager = new Manager()
      this.bleManager.on('discover', function(beacon) { console.log(beacon) })
    });
  }
}
```

### Desktop
#### 사전 준비
##### Windows
Powershell 또는 cmd.exe 에서 관리자 권한으로 실행 뒤 [windows-build-tools](https://github.com/felixrieseberg/windows-build-tools)를 설치합니다.
```sh
$ npm install --global --production windows-build-tools
```
Bluetooth 4.0 USB 어댑터를 위하여 [Zadig Tool](https://zadig.akeo.ie/)을 통해 [WinUSB](https://docs.microsoft.com/en-us/windows-hardware/drivers/ddi/content/index) 드라이버를 설치합니다.
WinUSB 드라이버 설치는 [BuildThing beacon 관리자 앱 사용자 매뉴얼](https://buildit.kr/dist/assets/BuildThing_beacon_Admin_App_User_Manual_v1.0_KR.pdf) 내 **Windows 지원 블루투스 장치 및 실행 가이드**를 참고합니다.

지원 Windows 블루투스 장치는 아래와 같습니다.

| 장치 이름 | USB VID | USB PID |
| ------ | ------ | ------ |
| Qualcomm Athreos QCA61x4 | 0CF3 | E300 |
| Broadcom BCM20702A0 | 0A5C | 21E8 |
| Broadcom BCM20702A0 | 19FF | 0239 |
| CSR(Cambridge Silicon Radio) | 0A12 | 0001 |
| ASUS BT400 | 0B05 | 17CB |
| Intel 6235 | 8087 | 07DA |
| Intel 7260 | 8087 | 07DC |
| Intel 7265 | 8087 | 0A2A |
| Intel 8265 | 8087 | 0A2B |
| Broadcom BCM20702A1 | 0489 | E07A |
| Broadcom BCM2045A0 | 0A5C | 6412 |
| Belkin BCM20702A0 | 050D | 065A |

##### MacOS
- [Xcode](https://itunes.apple.com/ca/app/xcode/id497799835?mt=12)를 설치합니다.

#### Electron
##### 설치
###### electron-packager
Electron 에서 앱을 빌드/패키징 할때 사용하는 노드 모듈 입니다. 아래의 명령어로 Electron 프로젝트에 설치합니다.
```sh
$ npm install electron-packager --save -dev
```
자세한 설정 및 사용 방법은 [electron-packager](https://github.com/electron-userland/electron-packager) 에서 확인할 수 있습니다.

###### package.json
electron-packager 로 빌드를 수행하는 경우, package.json 내 dependencies에 buildthing-beacon-sdk를 명시해야만합니다.
```
{
  "name": "electron-quick-start",
  "version": "1.0.0",
  "description": "A minimal Electron application",
  "main": "main.js",
  "scripts": {
    "start": "electron .",
    "build": "electron-packager . --overwrite"
  },
  "repository": "https://github.com/electron/electron-quick-start",
  "keywords": [
    "Electron",
    "quick",
    "start",
    "tutorial",
    "demo"
  ],
  "author": "GitHub",
  "license": "CC0-1.0",
  "devDependencies": {
    "electron": "^3.0.8",
    "electron-packager": "^13.1.1"
  },
  "dependencies": {
    "buildthing-beacon-sdk": "^1.0.0"
  }
}
```

###### Windows 개발 환경 설정 : 불필요 의존 모듈 삭제 및 재빌드 수행 (Windows 환경 필수)
Electron을 Windows 에서 사용하는 경우, Electron 프로젝트 내 `/node_modules/` 에 설치되는 `noble-mac`을 삭제하고 `/node_modules/buildthing-beaon-sdk/package.json` 내 `dependencies` 에서 `noble-mac을 제거` 합니다. 이후 `node_modules/.bin/electron-rebuild` 를 실행시켜야, 이후에 정상적으로 electron 빌드가 가능합니다.

##### Electron : 예제
아래와 같이 renderer.js(Renderer Process)에서 buildthing-beacon-sdk를 사용할 수 있습니다.
```
const { Manager } = require('buildthing-beacon-sdk')

window.addEventListener("load", function(event) {
  var bleManager = new Manager()

  bleManager.on('discover', function(beacon) {
    console.log(beacon)
  })

  bleManager._ble.on('stateChange', function (state) {
    if(state[0] === 'poweredOn') bleManager.startScan()
  })

  window.bleManager = bleManager
});

```
##### Electron-vue : 예제
Electron 과 vue.js 를 같이 사용 하는 경우, [electron-vue](https://github.com/SimulatedGREG/electron-vue) 를 이용해 프로젝트 초기 구성을 하는 것을 권장합니다. 다음과 같이 buildthing-beacon-sdk를 사용 할 수 있습니다.

```
// LandingPage.vue

<template>
  <div id="wrapper">
  ...
    <main>
      <div>hello buildthing Beacon</div>
    </main>
  </div>
</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import { Manager } from 'buildthing-beacon-sdk'

  export default {
    name: 'landing-page',
    components: { SystemInformation },
    mounted () {
      window.addEventListener("load", function(event) {
        var bleManager = new Manager()

        bleManager.on('discover', function(beacon) {
          console.log(beacon)
        })

        bleManager._ble.on('stateChange', function (state) {
          if(state[0] === 'poweredOn') bleManager.startScan()
        })

        window.bleManager = bleManager
      });
    }
  }
</script>

<style>
 ...
</style>

```

##### Electron-react : 예제
Electron 과 React 를 같이 사용 하는 경우, [electron-react-boilerplate](https://github.com/electron-react-boilerplate/electron-react-boilerplate) 를 이용해 프로젝트 초기 구성을 하는 것을 권장합니다. 다음과 같이 buildthing-beacon-sdk를 사용 할 수 있습니다.
```
import React, { Component } from 'react';
import { Manager } from 'buildthing-beacon-sdk';
import styles from './Home.css';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  constructor(props) {
    super(props);
    window.addEventListener("load", () => {
       const bleManager = new Manager()

       bleManager.on('discover', (beacon) => {
         console.log(beacon)
       })

       bleManager._ble.on('stateChange', (state) => {
         if(state[0] === 'poweredOn') bleManager.startScan()
       })

       window.bleManager = bleManager
     });
  }

  render() {
    return (
      <div className={styles.container} data-tid="container">
        <h2>hello !! BuildThing Beacon</h2>
      </div>
    );
  }
}
```

### 공통 Webpack 설정
#### Webpack 미사용
Webpack을 사용하지 않을 경우 아래와 같이 /node_modules/buildthing-beacon-sdk/index.js를 수정합니다.
##### Mobile
```
// for Mobile (iOS, Android) (No Webpack Configuration)
var BuildThingBLE =  require('./dist/buildthing.ble.cordova.js')
module.exports = BuildThingBLE
```
##### MacOS
```
// for MacOS (No Webpack Configuration)
var BuildThingBLE = require('./dist/buildthing.ble.electron.darwin.js')
module.exports = BuildThingBLE
```
##### Windows
```
// for Windows (No Webpack Configuration)
var BuildThingBLE = require('./dist/buildthing.ble.electron.win32.js')
module.exports = BuildThingBLE
```
#### Webpack 사용
아래와 같이 Webpack.config.js 파일에서 alias 를 설정하여 플랫폼 별로 다른 buildthing-ble-sdk bundle  파일을 참조하여 개발이 가능합니다.
```
const path = require('path')
// Set Root Path
const ROOT_PATH = path.resolve(__dirname, '../')
const NODE_MODULE_PATH = '/node_modules/buildthing-beacon-sdk/dist/'

//Target Platform
const CORDOVA_BUNDLE = 'buildthing.ble.cordova.js'
//const MACOS_BUNDLE = 'buildthing.ble.electron.darwin.js'
//const WINDOWS_BUNDLE = 'buildthing.ble.electron.win32.js'

//.. Webpack Config Object
    resolve: {
        alias: {
          'buildthing-beacon-sdk': ROOT_PATH + NODE_MODULE_PATH + CORDOVA_BUNDLE
        }
    }
```

## API 문서
플랫폼 별 라이브러리 사용의 예제 코드는 아래와 같습니다.
```
import { Manager } from 'buildthing-beacon-sdk'
var manager = new Manager()
manager.on('discover', function(beacon){...})
manager.startScan() //스캔 시작
manager.stopScan() //스캔 종료
```
상세한 API는 아래 문서를 참고해주시기 바랍니다.
[API 문서 바로가기](https://buildit-lab.github.io/buildthing-beacon-sdk/)

## Scan Response
BuildThing beacon 스캔 수행 시, Scan Response로 수신되는 Service UUID와 Service 별 수신 값은 아래와 같습니다.
아래 Scan Response는 BuildThing, iBeacon, Eddystone 모드 모두 동일합니다.

| 항목 | Service UUID | 수신 값 |
| ------ | ------ | ------ |
| Device Information | 0x180A | 0x983006 |
| Mac Address | 0xADD0 | Mac Address |

## Advertising Packet
BuildThing beacon은 BuildThing 모드 외 iBeacon, Eddystone 모드의 Advertising Packet 을 지원합니다. Advertising Packet을 수신하기 위한 각 모드 별 UUID 및 Service UUID는 다음과 같습니다.

| 비콘 모드 | UUID | Service UUID |
| ------ | ------ | ------ |
| BuildThing | - | 0xBCBC |
| iBeacon | 0x0b2b0848-205f-11e9-ab14-820316983006 | - |
| Eddystone | - | 0xFEAA |

비콘 모드 별 수신되는 Advertising Packet Format은 아래와 같습니다.
[![BuildThing beacon Advertising Packet Format](https://buildit.kr/dist/assets/buildthing-beacon-advertising-packet-format.png)](https://buildit.kr/dist/assets/buildthing-beacon-advertising-packet-format.png)

## Connection Service
아래 Connection Service UUID를 통하여 BuildThing beacon Connection Service에 연결합니다.

| 항목 | Service UUID |
| ------ | ------ |
| Connection Service | 6E400001-B5A3-F393-E0A9-E50E24DCCA9E |

Connection이 완료되면 아래 2개의 Characteristic에 접근할 수 있습니다.

| 항목 | Characteristic UUID | 속성 | 비고 |
| ------ | ------ | ------ | ------ |
| 비콘 값 설정 | 6E400002-B5A3-F393-E0A9-E50E24DCCA9E | Read, Write | 비콘 값 을 설정할 수 있습니다.
| 비콘 값 설정 결과 | 6E400003-B5A3-F393-E0A9-E50E24DCCA9E | Notify | 비콘 값 설정 완료 후 Notify를 수신할 수 있습니다.

비콘 값 설정 Characteristic에 값을 Write하여 비콘 값을 설정합니다.
설정 시, 아래와 같은 전송 패킷 포맷으로 Write 합니다.
**최초 Password 값은 000000** 입니다.

[![BuildThing beacon Connection Service](https://buildit.kr/dist/assets/buildthing-beacon-connection-service.png)](https://buildit.kr/dist/assets/buildthing-beacon-connection-service.png)

## 참고 사항
### 거리 계산 테스트
비콘과 기기 간의 거리 계산에 대하여 테스트가 완료된 기기 모델은 아래와 같습니다.

| 플랫폼 | 모델명 |
| ------ | ------ |
| iOS | iPhone8, iPhoneX, iPhoneXS, iPad 9.7 5세대 |
| Android | Galaxy S8, Galaxy S9, Galaxy S10, Galaxy Note 9|

## 고객 문의
Github Issue 외 기타 문의 사항은 web.dev@buildit.kr로 문의해주시기 바랍니다.
