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
* [예제 코드](#예제-코드)
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
iOS/Android Mobile 플랫폼은 Codrova 기반의 개발 환경(e.g : Ionic, PhoneGap 등)에서 사용 가능하며, MacOS/Windows Desktop 플랫폼은 Electron 기반의 개발 환경에서 사용 가능합니다.
### Mobile
#### Cordova
Cordova 기반의 개발 환경은 Cordova 프로젝트 루트 디렉토리에서 아래와 같은 Cordova cli 를 통해 의존 Cordova 플러그인들을 설치 해야 합니다.
##### 설치
###### cordova-plugin-ble-central
BLE 통신을 위한 플러그인 입니다.
```sh
$ cordova plugin add cordova-plugin-ble-central
```
###### cordova-plugin-background-mode
백그라운드 모드 스캔을 지원하기 위한 플러그인 입니다.
```sh
$ cordova plugin add cordova-plugin-background-mode
```
###### cordova-custom-config
iOS는 백그라운드 모드 스캔을 사용하기위해서 아래과 같이 cordova-custom-config 플러그인을 추가하고 config.xml에 UIBackgroundModes 관련 설정을 추가해야 합니다.
```sh
$ cordova plugin add cordova-plugin-background-mode
```
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
Electron에서 BLE 통신을 위해서는 [noble](https://github.com/noble/noble)의 설치가 필요합니다.
##### 설치
###### noble
BLE 통신을 위한 의존 라이브러리 입니다.
```sh
$ npm install noble
```
### Webpack 설정
#### alias 지정을 통한 타겟 플랫폼 별 빌드 설정
아래와 같이 Webpack의 alias 를 설정하여 플랫폼 별로 다른 buildthing-ble-sdk bundle  파일을 참조하여 개발이 가능합니다.
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
#### .node 빌드 설정 (Electron)
noble 에서 네이티브 노드 모듈 (.node) 을 사용하여, 데스크탑과 비콘이 BLE 통신을 할 수 있게 지원하기 때문에 빌드 시, 해당 네이티브 노드 모듈을 가져와 앱에 포합 시켜야 합니다.
##### native-ext-loader
이를 위해 native-ext-loader의 설치가 필요합니다.
```sh
$ npm install native-ext-loader
```
네이티브 노드 모듈을 앱에 포합시키기 위해 아래와 같이 Webpack을 설정합니다.
```
//.. Webpack Config Object
    //아래와 같이 런타임 환경에서 의존 하고있는 네이티브 노드 모듈을 로드 할 수 있음.
    module: {
        rules: [
            {
                test: /\.node$/,
                loader: 'native-ext-loader',
                options: {
                    rewritePath: undefined // production  배포 시, .node 모듈을 찾기 위함.
                }
            }
        ]
    }
```
### Webpack 미사용
Webpack을 사용하지 않을 경우 아래와 같이 /node_modules/buildthing-beacon-sdk/index.js를 수정합니다

## 예제 코드
```
import { Manager } from 'buildthing-beacon-sdk'
var manager = new Manager()
manager.on('discover', function(beacon){...})
manager.startScan() //스캔 시작
manager.stopScan() //스캔 종료
```

## API 문서
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
