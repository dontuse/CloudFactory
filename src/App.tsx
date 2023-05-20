import React from 'react';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import Table from './PoloTable/Table';
import About from './AboutApp';

const Stack = createNativeStackNavigator();

function App(): JSX.Element {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="About" component={About} />
        <Stack.Screen name="Table" component={Table} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
