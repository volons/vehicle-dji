import DJIMobile from 'react-native-dji-mobile';
import { DJIMissionControl } from 'react-native-dji-mobile';

const _verbose_ = true;
const _bridgeIPAddress_ = '192.168.8.103';
// const _bridgeIPAddress_ = '192.168.43.77';
const _gateIPAddress_ = '192.168.8.100';
// const _gateIPAddress_ = '192.168.43.239';
const _gatePort_ = '8656';
const _gateURI_ = '/vehicle?token=newToken';

export default class Vehicle {
    constructor( app ) {
        this.handlers = {};
        this.gateWsEnable = false;
        this.app = app;

        this.addMsgHandler( 'info', async () => {
            return { model: 'DJI Mavik', name: 'ReactNative' };
        } );

        this.addMsgHandler( 'takeoff', async () => {
            this.log( 'RECEIVE TAKEOFF CMD', DJIMissionControl );

            // const ga = new DJIMissionControl.GimbalAttitudeAction( { pitch: 0, roll: 0, yaw: 0, completionTime: 10 } );
            // DJIMissionControl.scheduleElement( ga );
            // DJIMissionControl.startTimeline();
            //

            const waypointMission = new DJIMissionControl.WaypointMissionTimelineElement( { autoFlightSpeed: 5, maxFlightSpeed: 5 } );
            waypointMission.setAutoFlightSpeed( 5 );
            waypointMission.setMaxFlightSpeed( 5 );
            waypointMission.addWaypoints( [ { latitude: 2, longitude: 1, altitude: 10 }, { latitude: 2, longitude: 1, altitude: 32 } ] );
            DJIMissionControl.scheduleElement( waypointMission );
            DJIMissionControl.startTimeline();

            DJIMobile.getAircraftLocation()
                .then( ( observalbe ) => {
                    this.log( 'Get Aircraft Location', observable );
                } )
                .catch( err => {
                    this.log( 'ERROR: getAircraftLocation', err );
                } );

            return { };
        } );

        this.gateWs = new WebSocket( 'ws://' + _gateIPAddress_ + ':' + _gatePort_ + _gateURI_ );

        this.battery = -1;
        this.position = {
            lat: -1,
            lon: -1,
            alt: -1,
            relAlt: -1,
            hdg: -1
        };

        this.initDJIProduct();
        this.initGateWs();
    }

    initGateWs() {
        this.gateWs.onopen = () => {
            this.gateWsEnable = true;
            this.log( 'FMS Open WebSocket', { gateIp: _gateIPAddress_, port: _gatePort_, uri: _gateURI_ } );

            this.gateWs.send( JSON.stringify( {
                msg: "Hello Gate"
            } ) );
        };

        this.gateWs.onmessage = ( e ) => {

            let msg;
            try {
                msg = JSON.parse( e.data );
            } catch ( exception ) { 
                this.log( 'FMS Websocket OnError: Cannot JSON.parse message.', exception );
            }
            if ( msg ) {
                this.log( 'FMS Websocket OnMessage: ${ msg }', msg );
                this.onMessage( msg );
            }
        };
        this.gateWs.onerror = ( error ) => {
            this.log( `FMS Websocket OnError: ${error.message}`, error );
        };
        this.gateWs.onclose = ( info ) => {
            this.gateWsEnable = false;
            this.log( `FMS Websocket OnClose: ${info.message}`, info );
        };
    }

    onMessage( msg ) {
        let handler = this.handlers[ msg.type ];
        if ( handler ) {
            let promise = handler();

            if ( msg.verb === 'req' ) {
                promise
                    .then( ( res ) => { this.reply( msg.id, res ); } )
                    .catch( ( err ) => { this.reply( msg.id, null, err ); } );
            }
        } else {
            this.log( `Unknown message type ${ msg.type }` );
            if ( msg.verb === 'req' ) {
                this.reply( msg.id, null, 'Unknown message type' );
            }
        }
    }

    addMsgHandler( type, handler ) {
        this.handlers[ type ] = handler;
    }

    reply( to, result, error ) {
        this.sendMsg( 'reply', {
            id: to,
            result: result,
            error: error
        } );
    }

    sendMsg( type, data, verb ) {
        let msg = {
            type: type,
            data: data,
            verb: verb || 'req',
            id: Math.random().toString(36).substr(2) // Generate random ID string (like 'qs8x53qb3u')
        };

        if ( this.gateWs && this.gateWs.readyState === this.gateWs.OPEN ) {
            this.gateWs.send( JSON.stringify( msg ) );
        }

    }

    sendPositionMsg() {
        this.sendMsg( 'position', this.position, 'upd' );
    }

    updateBattery( battery ) {
        this.log( 'Update battery: ', battery );
        this.battery = battery;
        this.sendMsg( 'battery', {
            voltage: -1,
            current: -1,
            percent: this.battery
        }, 'upd' );
    }

    updateLocation( location ) {
        this.log( 'Update position: ', location );
        this.position.lat = location.latitude;
        this.position.lon = location.longitude;
        this.position.alt = location.altitude;
        this.sendPositionMsg();
    }

    updateCompassHeading( heading ) {
        this.position.hdg = heading;
        this.sendPositionMsg();
    }

    updateVelocity( velocity ) { }

    log( msg ) {
        console.log( arguments );
        this.app.println( msg );
    }

    initDJIProduct() {
        if ( _verbose_ ) {
            console.log( 'initDJIProduct', DJIMobile );
        }

        DJIMobile.registerApp( _bridgeIPAddress_ )
        .then( val => {
            this.log( 'RegisterApp succeed!', _bridgeIPAddress_, val );

            //ProductConnection
            DJIMobile.startProductConnectionListener()
                .then( ( observable ) => {

                    const observer = observable.subscribe( evt => {
                        this.log( `Product ${ evt.value }!`, evt );

                    } );
                } )
                .catch( err => {
                    console.log( 'ERROR: startProductConnectionListener fail.', err );
                } );


            DJIMobile.startBatteryPercentChargeRemainingListener()
                .then( ( observable ) => { const observer = observable.subscribe( evt => { this.updateBattery( evt.value ); } ); } )
                .catch( err => { console.log( 'ERROR: startBatteryPercentChargeRemainingListener fail.', err ); } );

            DJIMobile.startAircraftCompassHeadingListener()
                .then( ( observable ) => { const observer = observable.subscribe( evt => { this.updateCompassHeading( evt.value.heading ); } ); } )
                .catch( err => { console.log( 'ERROR: startAircraftCompassHeadingListener fail.', err ); } );

            DJIMobile.startAircraftLocationListener()
                .then( ( observable ) => { const observer = observable.subscribe( evt => { this.updateLocation( evt.value ); } ); } )
                .catch( err => { console.log( 'ERROR: startAircraftLocationListener fail.', err ); } );

            // AircraftVelocity
            DJIMobile.startAircraftVelocityListener()
                .then( ( observable ) => { const observer = observable.subscribe( evt => { this.updateVelocity( evt.value ); } ); } )
                .catch( err => { console.log( 'ERROR: startAircraftVelocityListener fail.', err ); } );

            // RecordRealTime
            // DJIMobile.startRecordRealTimeData()
            // .then( ( observable ) => { const observer = observable.subscribe( evt => { console.log( 'startRecordRealTimeData', evt ); } ); } )
            // .catch( err => { console.log( 'ERROR: startRecordRealTimeData fail.', err ); } );

            DJIMissionControl.startTimelineListener()
            .then( ( observable ) => { const observer = observable.subscribe( evt => {
                    console.log( 'Timeline listener', evt );
                    if ( evt.eventType === 0 ) {
                        DJIMissionControl.stopTimeline()
                            .then( () => { console.log( 'End Timeline.' ); } )
                            .catch( ( err ) => { console.log( 'ERROR: from DJIMissionControl.stopTimeline()', err ); } );
                    }
                } ); } )
            .catch( err => { console.log( 'ERROR: startTimelineListener fail.', err ); } );

        } )
        .catch( err => { this.log( 'RegisterApp fail.', err ); } );
    }


}

