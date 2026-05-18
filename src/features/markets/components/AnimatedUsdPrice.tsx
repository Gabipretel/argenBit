import { useEffect, useRef } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

interface Props {
  priceUsd: number;
  format: (n: number) => string;
  textStyle: StyleProp<TextStyle>;
  align?: "start" | "end";
}

/** Flash verde/rojo solo sobre el precio cuando cambia. */
export function AnimatedUsdPrice({ priceUsd, format, textStyle, align = "start" }: Props) {
  const prevRef = useRef<number | undefined>(undefined);
  const flash = useSharedValue(0);
  const dir = useSharedValue(1);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = priceUsd;
    if (prev === undefined || prev === priceUsd) return;
    dir.value = priceUsd > prev ? 1 : -1;
    flash.value = withSequence(
      withTiming(1, { duration: 160 }),
      withTiming(0, { duration: 240 })
    );
  }, [priceUsd, dir, flash]);

  const glowStyle = useAnimatedStyle(() => {
    const t = flash.value;
    const up = dir.value >= 0;
    const bg = up
      ? `rgba(5, 150, 105, ${t * 0.42})`
      : `rgba(186, 26, 26, ${t * 0.34})`;
    return {
      backgroundColor: bg,
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    };
  });

  return (
    <Animated.View
      style={[
        styles.row,
        align === "end" && styles.rowEnd,
        glowStyle,
      ]}
    >
      <Text style={textStyle}>{format(priceUsd)}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignSelf: "flex-start",
  },
  rowEnd: {
    alignSelf: "flex-end",
  },
});
