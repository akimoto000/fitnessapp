import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TabNavigator } from './TabNavigator';
import { WorkoutScreen } from '../screens/WorkoutScreen';
import { Colors, FontSize } from '../constants/theme';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        headerTitleStyle: {
          fontWeight: '700',
          color: Colors.text,
          fontSize: FontSize.xl,
        },
        headerTintColor: Colors.primary,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Workout"
        component={WorkoutScreen}
        options={{
          title: 'トレーニング',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
