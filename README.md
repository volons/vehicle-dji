__ALPHA VERSION__: Volons is still early access alpha software, use at your own risk!
***

# Vehicle DJI

Vehicle DJI take part of the Volons - Open Source Internet Of Drone Plateform as a vehicle connector for DJI product. 
This project is a React-Native Mobile Application using [React-Native-DJI-Mobile](https://www.npmjs.com/package/react-native-dji-mobile) node module.

## Getting Started
```
$ git clone git@github.com:volons/vehicle-dji.git
```

Read the [https://github.com/Aerobotics/react-native-dji-mobile](https://github.com/Aerobotics/react-native-dji-mobile) documentation to link and start building the app. Follow DJI Mobile documentation to integrate DJI-SDK.

### Connecting Hive
To use this application you should run Volons on your local computer.

```
$ npm install -g volons
$ npm start
```

Or simply use the Hive docker container
```
$ docker pull volons/hive
$ docker start volons/hive
```

Enter the Hive IP address from the Application home screen.

### Connecting DJI Aircraft
With the Vehicle-DJI application you can connect DJI Product directly or by using the [DJI Bridge Application](https://developer.dji.com/mobile-sdk/documentation/ios-tutorials/BridgeAppDemo.html).

Enter the DJI Bridge Application IP address from the Application home screen, or leave the input text empty if you connect DJI Product using USB cable.

Click connect to start the app with your configuration. Console should appear then give you information on what's going on.
