import React from 'react';
import { StyleSheet, ScrollView, StatusBar, Text, View } from 'react-native';
import PieChart from './src';

const App = () => {
  const widthAndHeight = 250;
  // const series = [123, 321, 123, 789, 537, 100];
  // const series = [123, 137, 101, 23, 23, 289];
  // const series = [123, 321, 23, 23, 137, 289];
  // const series = [23, 121, 23, 23, 137, 289];
  const series = [23, 23, 123, 321, 137, 289];
  // const series = [21, 23, 23];
  const sliceColor = ['#F44336', '#2196F3', '#FFEB3B', '#4CAF50', '#FF9800', '#A78090'];
  return (
    <ScrollView style={{ flex: 1 }}>
      <View style={styles.container}>
        <StatusBar hidden={true} />
        <Text style={styles.title}>Basic</Text>
        <PieChart widthAndHeight={widthAndHeight} series={series} sliceColor={sliceColor} />
        {/* <Text style={styles.title}>Doughnut</Text>
        <PieChart
          widthAndHeight={widthAndHeight}
          series={series}
          sliceColor={sliceColor}
          doughnut={true}
          coverRadius={0.45}
          coverFill={'#FFF'}
        /> */}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    margin: 10,
  },
});

export default App;
