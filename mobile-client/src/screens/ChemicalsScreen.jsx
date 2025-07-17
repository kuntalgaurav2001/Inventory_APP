import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../context/ThemeContext';

const ChemicalsScreen = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background,
    },
    text: {
      fontSize: 18,
      color: colors.textPrimary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chemicals Screen</Text>
    </View>
  );
};

export default ChemicalsScreen; 