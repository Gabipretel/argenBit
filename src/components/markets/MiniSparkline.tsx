import { memo, type ReactElement } from "react";
import { StyleSheet, View } from "react-native";

import { colors } from "@/theme";

export type SparkTone = "up" | "down" | "flat";

interface MiniSparklineProps {
  points: number[];
  tone: SparkTone;
  width?: number;
  height?: number;
}

export const MiniSparkline = memo(function MiniSparkline({
  points,
  tone,
  width = 64,
  height = 36,
}: MiniSparklineProps) {
  const n = points.length;
  if (n < 2) {
    return <View style={{ width, height }} accessibilityElementsHidden />;
  }

  const stroke =
    tone === "up" ? colors.success : tone === "down" ? colors.error : colors.outlineVariant;
  const fill =
    tone === "up"
      ? "rgba(5, 150, 105, 0.18)"
      : tone === "down"
        ? "rgba(186, 26, 26, 0.12)"
        : "rgba(193, 199, 208, 0.28)";

  const pad = 4;
  const innerH = height - pad * 2;
  const step = width / (n - 1);
  const xs = points.map((_, i) => i * step);
  const ys = points.map((v) => pad + (1 - v) * innerH);

  const segments: ReactElement[] = [];
  for (let i = 0; i < n - 1; i++) {
    const x0 = xs[i]!;
    const y0 = ys[i]!;
    const x1 = xs[i + 1]!;
    const y1 = ys[i + 1]!;
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    segments.push(
      <View
        key={`ln-${i}`}
        style={[
          styles.seg,
          {
            left: x0,
            top: y0,
            width: len,
            backgroundColor: stroke,
            transform: [{ rotate: `${angleDeg}deg` }],
            transformOrigin: ["0%", "50%", 0],
          },
        ]}
      />
    );
  }

  return (
    <View style={[styles.wrap, { width, height }]} accessibilityElementsHidden>
      {points.map((v, i) => {
        const x = i * step;
        const yTop = pad + (1 - v) * innerH;
        return (
          <View
            key={`ar-${i}`}
            style={[
              styles.areaCol,
              {
                left: Math.max(0, x - step / 2),
                top: yTop,
                width: step + 0.5,
                height: height - yTop - 1,
                backgroundColor: fill,
              },
            ]}
          />
        );
      })}
      {segments}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
    overflow: "hidden",
    borderRadius: 6,
  },
  areaCol: {
    position: "absolute",
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  seg: {
    position: "absolute",
    height: 2,
    borderRadius: 1,
  },
});
