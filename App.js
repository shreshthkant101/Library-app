import React from 'react';
import {Text} from 'react-native';
import {createAppContainer} from 'react-navigation';
import {createBottomTabNavigator} from 'react-navigation-tabs';
import Transactions from './screens/transactions';
import Search from './screens/search';

export default class App extends React.Component {
    render() {
        return (
            <AppContainer/>
        );
    }
}
const TabNavigator = createBottomTabNavigator({
  Transactions:{screen:Transactions},
  Search:{screen:Search}
});
const AppContainer = createAppContainer(TabNavigator);