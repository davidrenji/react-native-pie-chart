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

  const radius = getRadius();
  const rotation = Platform.OS == 'ios' ? 90 : 0;
  const totalSerie = series.reduce((acc, val) => acc + val);
  const reverseAngle = angle.map((a) => a * -1);
  const textDistance = widthAndHeight / 3; //widthAndHeight / 4 + widthAndHeight / 12.5;
  let textPositions: Array<Point> = [];
  const labelHight = widthAndHeight / 14;
  const labelWidth = labelHight * 2.5;
  console.log('Label', labelWidth, labelHight);

  return (
    <View style={{ width: widthAndHeight, height: widthAndHeight }}>
      {/* @ts-expect-error */}
      <Surface style={style} width={widthAndHeight} height={widthAndHeight}>
        {/* @ts-expect-error 'rotation' is not defined in the types, but actually exists */}
        <Group rotation={rotation} originX={radius} originY={radius}>
          {series.flatMap((serie, index) => {
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
            // console.log(
            //   'Index: ',
            //   index,
            //   'Angle: ',
            //   reverseAngle[index],
            //   reverseAngle[index + 1],
            //   'Middle: ',
            //   middleAngleValue
            // );
            let x1 = textDistance * Math.cos((middleAngleValue * Math.PI) / 180);
            let y1 = textDistance * Math.sin((middleAngleValue * Math.PI) / 180);
            index == 1 && console.log('line 109', x1, textDistance, Math.cos((middleAngleValue * Math.PI) / 180));
            // y1 += y1 < 0 ? widthAndHeight / 12.5 : widthAndHeight / 25;
            if (middleAngleValue < -200 && middleAngleValue > -340) y1 -= labelHight / 2;
            else y1 += labelHight / 2;

            //Only for 3rd and 4th cuadrant
            if (middleAngleValue <= -270 || middleAngleValue >= -100) {
              if (Math.abs(reverseAngle[index + 1] - reverseAngle[index]) > 25) x1 -= labelWidth / 2;
              else x1 -= labelWidth / 4;
            }
            // console.log(index, textPositions);

            // to avoid text overlapping
            // const displacementY = labelHight;
            // const displacementX = labelWidth;

            textPositions.forEach((p) => {
              //Checking overlapings on point top-left
              let overlapX = x1 >= p.x && x1 <= p.x + labelWidth && Math.abs(y1 - p.y) <= labelHight;
              let overlapY = y1 >= p.y - labelHight && y1 <= p.y && Math.abs(x1 - p.x) <= labelWidth;

              //Checking overlapings on point bottom-right
              if (!overlapX) {
                const _x1 = x1 + labelWidth;
                overlapX = _x1 >= p.x && _x1 <= p.x + labelWidth && Math.abs(y1 - p.y) <= labelHight;
              }

              if (!overlapY) {
                const _y1 = y1 - labelHight;
                overlapY = _y1 >= p.y - labelHight && _y1 <= p.y && Math.abs(x1 - p.x) <= labelWidth;
              }

              index == 3 && console.log('=====', y1, p.y, Math.abs(y1 - p.y));
              index == 3 && console.log(index, overlapX, overlapY);

              if (overlapX) {
                const displacementX = p.y + labelHight - y1;
                // console.log('displacementX', displacementX);
                x1 = (textDistance + labelWidth) * Math.cos((middleAngleValue * Math.PI) / 180);
                //Only for 3rd and 4th cuadrant
                if (middleAngleValue < -270 || middleAngleValue > -100) x1 -= labelWidth / 2;
                index == 3 && console.log('line 142', x1, textDistance, Math.cos((middleAngleValue * Math.PI) / 180));
                // if (middleAngleValue < -270 || middleAngleValue > -90) y1 -= labelHight / 1.5;
                // if (middleAngleValue < -90 && middleAngleValue > -270) y1 += labelHight / 1.5;
                // y1 += labelHight / 1.5;
              }

              if (overlapY) {
                const displacementY = p.y + labelHight - y1;
                console.log('=====', y1, p.y, p.y + labelHight, Math.abs(y1 - p.y), displacementY);
                y1 = (textDistance + labelHight) * Math.sin((middleAngleValue * Math.PI) / 180);
                if (middleAngleValue <= -210 && middleAngleValue >= -330) y1 -= labelHight / 2;
                else y1 += labelHight / 2;
                // if (middleAngleValue < -270 || middleAngleValue > -90) x1 -= labelHight / 1.5;
                // if (Math.abs(reverseAngle[index + 1] - reverseAngle[index]) < 25) y1 += labelHight / 2;
              }
            });

            // x1 -= labelWidth / 2;

            // if (Math.abs(reverseAngle[index + 1] - reverseAngle[index]) > 25) y1 += labelHight;

            textPositions.push({ x: x1, y: y1 });
            //The Y translation on the component is at the oposite direction of the cartesian plane
            y1 *= -1;

            return (
              <View
                key={index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 'auto',
                  height: labelHight,
                  // borderWidth: 1,
                  transform: [{ translateX: x1 }, { translateY: y1 }],
                }}
              >
                <Text style={[{ fontSize: widthAndHeight / 17 }, styles.percentageText]}>
                  {((serie / totalSerie) * 100).toFixed(1)}%
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
  percentageText: {
    color: 'black',
    textShadowColor: 'white',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
});

export default Pie;
