import React from 'react';
import { Platform, ViewStyle, StyleProp, Text, View, StyleSheet } from 'react-native';
// @ts-expect-error 'Path' is not defined in the types, but actually exists
import { Surface, Group, Path, Shape } from '@react-native-community/art';

import Wedge from './Wedge';

export type Props = {
  angle: number[];
  widthAndHeight: number;
  coverFill: string;
  coverRadius: number;
  doughnut: boolean;
  series: number[];
  sliceColor: string[];
  style?: StyleProp<ViewStyle>;
  showLabels?: boolean;
};

type Point = {
  x: number;
  y: number;
};

const Pie = ({
  angle,
  widthAndHeight,
  coverFill,
  coverRadius,
  doughnut,
  series,
  sliceColor,
  style,
  showLabels,
}: Props): JSX.Element => {
  const handleCover = (): JSX.Element | null => {
    if (!doughnut) {
      return null;
    }

    const radius = getRadius();
    const actualCoverRadius = widthAndHeight * coverRadius;
    const coverPath = new Path()
      .moveTo(radius, radius - actualCoverRadius / 2)
      .arc(0, actualCoverRadius, 25)
      .arc(0, -actualCoverRadius, 25)
      .close();

    return <Shape d={coverPath} fill={coverFill} />;
  };

  const getRadius = () => widthAndHeight / 2;

  const pointFromAngle = (distance: number, angle: number) => {
    return {
      x: distance * Math.cos((angle * Math.PI) / 180),
      y: distance * Math.sin((angle * Math.PI) / 180),
    };
  };

  const checkOverlapping = (p1: Point, p2: Point, w: number, h: number) => {
    //Checking overlapings on point top-left
    let overlapX = p1.x >= p2.x && p1.x <= p2.x + w && Math.abs(p1.y - p2.y) <= h;
    let overlapY = p1.y >= p2.y - h && p1.y <= p2.y && Math.abs(p1.x - p2.x) <= w;

    //Checking overlapings on point bottom-right
    if (!overlapX) {
      const _p1x = p1.x + w;
      overlapX = _p1x >= p2.x && _p1x <= p2.x + w && Math.abs(p1.y - p2.y) <= h;
    }
    //Checking overlapings on point bottom-right
    if (!overlapY) {
      const _p1y = p1.y - h;
      overlapY = _p1y >= p2.y - h && _p1y <= p2.y && Math.abs(p1.x - p2.x) <= w;
    }
    return overlapX || overlapY;
  };

  const radius = getRadius();
  const rotation = Platform.OS == 'ios' ? 90 : 0;
  const totalSeries = series.reduce((acc, val) => acc + val);
  //The pie graph is draw in reverse order (clockwise), so we need to revert the angles in order
  //to place the labels in the correct postion
  const reverseAngle = angle.map((a) => a * -1);
  const labelDistance = radius / 1.5;
  const labelPosition: Array<Point> = [];
  const labelHight = widthAndHeight / 14;
  const labelWidth = labelHight * 2.5;

  return (
    <View style={{ width: widthAndHeight, height: widthAndHeight }}>
      {/* @ts-expect-error */}
      <Surface style={style} width={widthAndHeight} height={widthAndHeight}>
        {/* @ts-expect-error 'rotation' is not defined in the types, but actually exists */}
        <Group rotation={rotation} originX={radius} originY={radius}>
          {series.flatMap((_, index) => {
            if (angle[index] != angle[index + 1]) {
              return [
                <Wedge
                  key={index}
                  outerRadius={radius}
                  startAngle={angle[index]}
                  endAngle={angle[index + 1]}
                  fill={sliceColor[index]}
                />,
              ];
            }
            return [];
          })}
          {handleCover()}
        </Group>
      </Surface>
      {showLabels && (
        <View
          style={{
            width: widthAndHeight,
            height: widthAndHeight,
            marginTop: -widthAndHeight / 2,
            marginLeft: widthAndHeight / 2,
          }}
        >
          {series.map((serie, index) => {
            const middleAngleValue = reverseAngle[index] + (reverseAngle[index + 1] - reverseAngle[index]) / 2;
            const currentPoint = pointFromAngle(labelDistance, middleAngleValue);

            //Moving Y axis because the pivot is in the top-left corner
            if (middleAngleValue < -200 && middleAngleValue > -340) currentPoint.y -= labelHight / 2;
            else currentPoint.y += labelHight / 2;

            //Only for 3rd and 4th cuadrant, Moving X axis because the pivot is in the top-left corner
            if (middleAngleValue <= -270 || middleAngleValue >= -100) {
              if (Math.abs(reverseAngle[index + 1] - reverseAngle[index]) > 25) currentPoint.x -= labelWidth / 2;
              else currentPoint.x -= labelWidth / 4;
            }

            //To check Overlappings labels
            labelPosition.forEach((prevPoint) => {
              const overlapping = checkOverlapping(currentPoint, prevPoint, labelWidth, labelHight);

              if (overlapping) {
                ({ x: currentPoint.x } = pointFromAngle(labelDistance + labelWidth, middleAngleValue));
                ({ y: currentPoint.y } = pointFromAngle(labelDistance + labelHight, middleAngleValue));
                //Only for 1st & 2nd cuadrant
                if (middleAngleValue < -270 || middleAngleValue > -100) currentPoint.x -= labelWidth / 2;
                //Only for +- 3rd & 4th cuadrant
                if (middleAngleValue <= -210 && middleAngleValue >= -330) currentPoint.y -= labelHight / 2;
                else currentPoint.y += labelHight / 2;

                return;
              }
            });

            //addign current label pivot point to history
            labelPosition.push(currentPoint);

            return (
              <View
                key={index}
                style={[
                  styles.labelContainer,
                  {
                    height: labelHight,
                    //The Y translation on the component is at the oposite direction of the cartesian plane
                    transform: [{ translateX: currentPoint.x }, { translateY: currentPoint.y * -1 }],
                  },
                ]}
              >
                <Text style={[{ fontSize: widthAndHeight / 17 }, styles.labelPercentage]}>
                  {((serie / totalSeries) * 100).toFixed(1)}%
                </Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  labelContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 'auto',
  },
  labelPercentage: {
    color: 'black',
    textShadowColor: 'white',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
});

export default Pie;
