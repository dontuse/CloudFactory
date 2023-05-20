import React from 'react';
import {StyleSheet, SafeAreaView} from 'react-native';

const App = (props: {children: React.ReactNode}) => {
  return <SafeAreaView style={styles.container}>{props.children}</SafeAreaView>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
