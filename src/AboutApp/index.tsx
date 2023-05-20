import React from 'react';
import {Button} from 'react-native';
import ScreenContainer from '../ScreenContainer';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export default function AboutApp({
  navigation,
}: NativeStackScreenProps<any, any>) {
  return (
    <ScreenContainer>
      <Button title="Table" onPress={() => navigation.navigate('Table')} />
    </ScreenContainer>
  );
}
