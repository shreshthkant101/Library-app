import React from 'react';
import {Text, View, ImageBackground} from 'react-native';

export default class Search extends React.Component {
    render() {
        return (
            <View>
                <ImageBackground source={require('../assets/bg.jpg')} 
                style={{
                    width:'100%',
                    height:'100%',
                    alignItems:'center',
                    alignSelf:'center',
                    justifyContent:'center'
                    }}><Text>Search</Text></ImageBackground>
            </View>
        );
    }
}