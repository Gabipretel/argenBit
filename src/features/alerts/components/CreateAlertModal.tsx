import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ALERT_ACCENT_COLOR,
  ALERT_ICON_NAME,
  ALERT_KIND_OPTIONS,
} from "../constants/alertUiConstants";
import type { Asset } from "@/domain/models/Asset";
import type { AlertKind } from "@/storage/alertsStorage";
import {
  cardShadow,
  colors,
  modalShadow,
  radii,
  spacing,
  toolbarPanelShadow,
  typography,
} from "@/core/theme";

export interface CreateAlertModalProps {
  visible: boolean;
  onClosePress: () => void;
  onSavePress: () => void;
  assetSearchText: string;
  onAssetSearchTextChange: (text: string) => void;
  selectedSymbol: string;
  thresholdText: string;
  onThresholdTextChange: (text: string) => void;
  selectedKind: AlertKind;
  onKindChange: (kind: AlertKind) => void;
  isRecurring: boolean;
  onRecurringChange: (value: boolean) => void;
  suggestedAssets: Asset[];
  isLoadingSuggestions: boolean;
  hasSuggestionsError: boolean;
  onSelectAsset: (symbol: string) => void;
  thresholdFieldLabel: string;
  thresholdFieldPlaceholder: string;
}

export function CreateAlertModal({
  visible,
  onClosePress,
  onSavePress,
  assetSearchText,
  onAssetSearchTextChange,
  selectedSymbol,
  thresholdText,
  onThresholdTextChange,
  selectedKind,
  onKindChange,
  isRecurring,
  onRecurringChange,
  suggestedAssets,
  isLoadingSuggestions,
  hasSuggestionsError,
  onSelectAsset,
  thresholdFieldLabel,
  thresholdFieldPlaceholder,
}: CreateAlertModalProps) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClosePress}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.modalBackdropTap} onPress={onClosePress} />
        <View style={styles.modalCenterWrap} pointerEvents="box-none">
          <View style={styles.modalCard}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Nueva alerta</Text>
              <Pressable
                onPress={onClosePress}
                hitSlop={12}
                accessibilityLabel="Cerrar"
                style={({ pressed }) => [styles.modalClose, pressed && styles.modalClosePressed]}
              >
                <MaterialCommunityIcons name="close" size={24} color={colors.onSurfaceVariant} />
              </Pressable>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              <View style={[styles.modalSection, styles.modalSectionFirst]}>
                <Text style={[styles.fieldLbl, styles.fieldLblFirst]}>Activo</Text>
                <Text style={[typography.caption, styles.fieldHelp]}>
                  Buscá en la lista o escribí el símbolo (ej. SOL).
                </Text>
                <TextInput
                  style={styles.input}
                  value={assetSearchText}
                  onChangeText={onAssetSearchTextChange}
                  placeholder="Buscar o escribir símbolo…"
                  placeholderTextColor={colors.onSurfaceVariant}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />

                <View style={styles.suggestBox}>
                  {isLoadingSuggestions ? (
                    <ActivityIndicator color={colors.primary} style={styles.suggestLoader} />
                  ) : suggestedAssets.length === 0 ? (
                    <Text style={[typography.caption, styles.suggestEmpty]}>
                      {hasSuggestionsError
                        ? "No pudimos cargar sugerencias. Escribí el símbolo igual."
                        : "Sin coincidencias. Probá otras letras o el símbolo completo."}
                    </Text>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled
                      style={styles.suggestScroll}
                      keyboardShouldPersistTaps="handled"
                    >
                      {suggestedAssets.map((asset) => {
                        const isSelected = selectedSymbol === asset.fsym.toUpperCase();
                        return (
                          <Pressable
                            key={asset.fsym}
                            onPress={() => onSelectAsset(asset.fsym)}
                            style={({ pressed }) => [
                              styles.suggestRow,
                              isSelected && styles.suggestRowOn,
                              pressed && styles.suggestRowPressed,
                            ]}
                          >
                            <Text style={[typography.labelMd, styles.suggestSym]}>
                              {asset.symbolDisplay}
                            </Text>
                            <Text
                              style={[typography.bodyMd, styles.suggestName]}
                              numberOfLines={1}
                            >
                              {asset.name}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </ScrollView>
                  )}
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.fieldLbl, styles.fieldLblInSection]}>¿Cuándo avisarte?</Text>
                <View style={styles.kindGrid}>
                  {ALERT_KIND_OPTIONS.map((option) => {
                    const isSelected = selectedKind === option.kind;
                    const accentColor = ALERT_ACCENT_COLOR[option.kind];
                    return (
                      <Pressable
                        key={option.kind}
                        onPress={() => onKindChange(option.kind)}
                        style={({ pressed }) => [
                          styles.kindTile,
                          isSelected && styles.kindTileOn,
                          isSelected && { borderColor: accentColor },
                          pressed && styles.kindTilePressed,
                        ]}
                      >
                        <View style={styles.kindTileTop}>
                          <MaterialCommunityIcons
                            name={ALERT_ICON_NAME[option.kind] as never}
                            size={22}
                            color={isSelected ? accentColor : colors.onSurfaceVariant}
                          />
                          {isSelected ? (
                            <MaterialCommunityIcons name="check-circle" size={20} color={accentColor} />
                          ) : (
                            <View style={styles.kindTileSpacer} />
                          )}
                        </View>
                        <Text
                          style={[styles.kindTileTitle, isSelected && { color: accentColor }]}
                          numberOfLines={2}
                        >
                          {option.title}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text style={styles.kindDetailHint} numberOfLines={4}>
                  {ALERT_KIND_OPTIONS.find((option) => option.kind === selectedKind)?.hint ?? ""}
                </Text>
              </View>

              <View style={styles.modalSection}>
                <Text style={[styles.fieldLbl, styles.fieldLblInSection]}>{thresholdFieldLabel}</Text>
                <TextInput
                  style={styles.input}
                  value={thresholdText}
                  onChangeText={onThresholdTextChange}
                  placeholder={thresholdFieldPlaceholder}
                  placeholderTextColor={colors.onSurfaceVariant}
                  keyboardType="decimal-pad"
                />

                <View style={styles.switchPanel}>
                  <View style={styles.switchText}>
                    <Text style={styles.switchTitle}>Avisar cada vez</Text>
                    <Text style={styles.switchSub}>
                      Si está apagado, solo avisamos la primera vez que se cumpla.
                    </Text>
                  </View>
                  <Switch
                    value={isRecurring}
                    onValueChange={onRecurringChange}
                    trackColor={{
                      false: colors.outlineVariant,
                      true: "rgba(35, 99, 145, 0.45)",
                    }}
                    thumbColor={
                      Platform.OS === "android"
                        ? isRecurring
                          ? colors.primary
                          : colors.surfaceContainerHigh
                        : undefined
                    }
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={onClosePress}
                style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]}
              >
                <Text style={styles.btnGhostTxt}>Cancelar</Text>
              </Pressable>
              <Pressable
                onPress={onSavePress}
                style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}
              >
                <Text style={styles.btnPrimaryTxt}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
  },
  modalBackdropTap: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  modalCenterWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  modalCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radii.lg,
    padding: spacing.lg,
    maxHeight: "92%",
    width: "100%",
    maxWidth: 420,
    alignSelf: "center",
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...modalShadow,
  },
  modalHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  modalTitle: {
    ...typography.headlineMd,
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.35,
    color: colors.primary,
  },
  modalClose: {
    padding: spacing.xs,
    borderRadius: radii.md,
  },
  modalClosePressed: {
    backgroundColor: colors.surfaceContainerLow,
    opacity: 0.9,
  },
  modalScroll: {
    maxHeight: 440,
  },
  modalScrollContent: {
    paddingBottom: spacing.sm,
  },
  modalSection: {
    marginBottom: spacing.md,
    padding: spacing.base,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    ...toolbarPanelShadow,
  },
  modalSectionFirst: {
    marginTop: 0,
  },
  fieldLbl: {
    ...typography.labelMd,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
    color: colors.onSurface,
    fontWeight: "700",
  },
  fieldLblFirst: {
    marginTop: 0,
  },
  fieldLblInSection: {
    marginTop: 0,
  },
  fieldHelp: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginBottom: spacing.xs,
    lineHeight: 18,
  },
  input: {
    ...typography.bodyMd,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.onSurface,
    backgroundColor: colors.surfaceBright,
    ...cardShadow,
  },
  suggestBox: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceBright,
    minHeight: 56,
    maxHeight: 200,
    overflow: "hidden",
    ...cardShadow,
  },
  suggestScroll: {
    maxHeight: 200,
  },
  suggestLoader: {
    padding: spacing.lg,
  },
  suggestEmpty: {
    padding: spacing.base,
    textAlign: "center",
    color: colors.onSurfaceVariant,
  },
  suggestRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.outlineVariant,
  },
  suggestRowOn: {
    backgroundColor: "rgba(35, 99, 145, 0.1)",
  },
  suggestRowPressed: {
    opacity: 0.92,
  },
  suggestSym: {
    width: 56,
    color: colors.primary,
    fontWeight: "700",
  },
  suggestName: {
    flex: 1,
    color: colors.onSurface,
  },
  kindGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  kindTile: {
    flexGrow: 1,
    flexBasis: "47%",
    minWidth: 140,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceBright,
    gap: spacing.xs,
    ...cardShadow,
  },
  kindTileOn: {
    backgroundColor: colors.surfaceContainerLow,
  },
  kindTilePressed: {
    opacity: 0.94,
  },
  kindTileTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  kindTileSpacer: {
    width: 20,
    height: 20,
  },
  kindTileTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 18,
  },
  kindDetailHint: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    marginTop: spacing.xs,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceBright,
    overflow: "hidden",
    ...cardShadow,
  },
  switchPanel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.md,
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...toolbarPanelShadow,
  },
  switchText: {
    flex: 1,
    minWidth: 0,
  },
  switchTitle: {
    ...typography.labelMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  switchSub: {
    ...typography.caption,
    color: colors.onSurfaceVariant,
    marginTop: 4,
    lineHeight: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.sm,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.outlineVariant,
  },
  btnGhost: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.lg,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.surfaceContainerLowest,
  },
  btnGhostPressed: {
    opacity: 0.9,
    backgroundColor: colors.surfaceContainerLow,
  },
  btnGhostTxt: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
  btnPrimary: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.14,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  btnPrimaryPressed: {
    opacity: 0.92,
  },
  btnPrimaryTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
});
