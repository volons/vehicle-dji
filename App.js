/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { Platform, StyleSheet, Text, View, FlatList, TextInput } from 'react-native';
import { Button, Linking } from 'react-native';
import Vehicle from './Vehicle.js';

const instructions = Platform.select({
  ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu',
  android:
    'Double tap R on your keyboard to reload,\n' +
    'Shake or press menu button for dev menu',
});

type Props = {};
export default class App extends Component<Props> {

  state = {
    consoleView: false,
    consoleLines: [],
  };

  println = ( msg ) => {
    this.setState( previousState => {
      return { ...this.state,
        consoleLines: [
          ...this.state.consoleLines,
          msg
        ] };
    } );
    console.log( msg );
    //render();
    };


  render() {

    if ( this.state.consoleView ) {
      console.log( 'render', this.state );
      return (
        <View style={styles.consolePage}>
            <Text style={styles.consoleTitle}>Console Log</Text>
            <FlatList
              data={this.state.consoleLines}
              keyExtractor={(item, index) => index.toString()}
              renderItem={ ( {item } ) => (
                <Text style={styles.rowViewContainer}>{item}</Text>
              ) } />
        </View>
        );
      }
      return (
        <View style={styles.container}>
          <Text style={styles.welcome}>Welcome to React Native Volons Vehicle-DJI</Text>
          <Text style={styles.instructions}>This application takes part of the Internet Of Drone Opensource Plateforme: Volons</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.instructions}>1 - Enter Volons' Fleet Management System IP address:</Text>
            <TextInput style={styles.textInput}>192.168.8.100</TextInput>
            <Text style={styles.instructions}>and port:</Text>
            <TextInput style={styles.textInput}>8656</TextInput>
            <Text style={styles.instructions}>2 - Connect DJI product or to use the Bridge APP. In other words, leave blank or enter Bridge App's IP address.</Text>
            <TextInput style={styles.textInput}>192.168.8.103</TextInput>
            <Button title="Connect" onPress={ () => {
              vehicle = new Vehicle( this );
              this.setState( previousState => (
              { consoleView: !previousState.consoleView }
              ) );
              } }/>
            <Text style={styles.linkBouton}
              onPress={ () => Linking.openURL( 'https://github.com/volons/get-started' ) }>
              https://github.com/volons/get-started
            </Text>
          </View>
        </View>
        );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
    padding:0,
    margin:0
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  infoContainer: {
    backgroundColor: '#F5FCFF',
    margin: 10,
  },
  instructions: {
    justifyContent: 'center',
    textAlign: 'left',
    color: '#333333',
    marginBottom: 5,
  },
  textInput: {
    textAlign: 'center',
    color: '#FF3333',
    marginBottom: 5,
    backgroundColor: '#FF0',
    minWidth: 50,
    padding: 5,
  },
  linkBouton: {
    textAlign: 'center',
    marginTop: 150,
    color: 'blue'
  },
  consolePage: {
    flex: 1,
    // justifyContent: 'center',
    // flexDirection: 'column',
    // // justifyContent: 'center',
    // alignItems: 'stretch',
    backgroundColor: '#000',
    //width: '100%', /// strange... eg. FullWidth
  },
  consoleTitle: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 60,
    marginBottom: 10,
    color: '#FFF',
  },
  consoleLog: {
    // android load use consola.
    fontFamily: 'CourierNewPSMT',
    fontSize: 16,
    backgroundColor: '#F00',
    color: '#FFF',
  },
rowViewContainer: {
    fontFamily: 'CourierNewPSMT',
    paddingLeft: 10,
    paddingRight: 10,
    fontSize: 14,
    color: '#FFF',
  },
  textStyle: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 18,
    padding: 7,
  },
});
