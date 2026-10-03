import React from 'react';
import { Image, StyleSheet, View, ViewStyle, ImageStyle } from 'react-native';

export interface AppLogoProps {
  size?: number;
  style?: ViewStyle;
  imageStyle?: ImageStyle;
  showShadow?: boolean;
}

export const AppLogo: React.FC<AppLogoProps> = ({
  size = 40,
  style,
  imageStyle,
  showShadow = true,
}) => {
  const borderRadius = Math.round(size * 0.22);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius,
        },
        showShadow && styles.shadow,
        style,
      ]}
    >
      <Image
        source={require('../../../assets/logo.png')}
        style={[
          styles.image,
          {
            width: size,
            height: size,
            borderRadius,
          },
          imageStyle,
        ]}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
