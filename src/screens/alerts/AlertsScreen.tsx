import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
import { SafeAreaView } from "react-native-safe-area-context";

import { ensureNotificationPermissions } from "@/alerts/localNotifications";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { AppFriendlyLoader } from "@/components/ui/AppFriendlyLoader";
import { ExpoNotificationsHintBanner } from "@/components/alerts/ExpoNotificationsHintBanner";
import { useAlerts } from "@/hooks/useAlerts";
import {
  flattenTopCoinsPages,
  useTopCoinsInfiniteQuery,
} from "@/hooks/useTopCoinsInfiniteQuery";
import type { AlertKind } from "@/storage/alertsStorage";
import {
  colors,
  cardShadow,
  modalShadow,
  radii,
  spacing,
  toolbarPanelShadow,
  typography,
} from "@/theme";
import { parseLocaleNumber } from "@/utils/parseLocaleNumber";

const ALERT_ACCENT: Record<AlertKind, string> = {
  price_above: colors.success,
  price_below: colors.error,
  pct_up: colors.success,
  pct_down: colors.error,
};

const ALERT_ICON: Record<AlertKind, string> = {
  price_above: "trending-up",
  price_below: "trending-down",
  pct_up: "rocket-launch-outline",
  pct_down: "chart-line-variant",
};

/** Textos en el modal (crear alerta). */
const KIND_MODAL: {
  kind: AlertKind;
  title: string;
  hint: string;
}[] = [
  {
    kind: "price_above",
    title: "Supera un precio",
    hint: "Te avisamos cuando el precio en USD sea mayor al valor que elijas.",
  },
  {
    kind: "price_below",
    title: "Baja de un precio",
    hint: "Te avisamos cuando el precio en USD sea menor al valor que elijas.",
  },
  {
    kind: "pct_up",
    title: "Sube mucho en el día",
    hint: "Comparamos la variación del día (respecto de ayer). Aviso si supera el % que pongas.",
  },
  {
    kind: "pct_down",
    title: "Cae mucho en el día",
    hint: "Si la caída del día supera el % que indiques, te lo decimos.",
  },
];

/** Resumen corto en la tarjeta de la lista. */
const KIND_CARD_LABEL: Record<AlertKind, string> = {
  price_above: "Precio por encima de",
  price_below: "Precio por debajo de",
  pct_up: "Subida del día mayor a",
  pct_down: "Caída del día mayor a",
};

function kindLabel(k: AlertKind): string {
  return KIND_MODAL.find((o) => o.kind === k)?.title ?? k;
}

const ASSET_SUGGEST_MAX = 40;

export function AlertsScreen() {
  const { alerts, ready, addAlert, removeAlert } = useAlerts();
  const [open, setOpen] = useState(false);
  const [fsym, setFsym] = useState("");
  const [assetFilter, setAssetFilter] = useState("");
  const [threshold, setThreshold] = useState("");
  const [kind, setKind] = useState<AlertKind>("price_above");
  const [recurring, setRecurring] = useState(true);

  const marketQuery = useTopCoinsInfiniteQuery("mcap", { enabled: open });
  const marketAssets = useMemo(
    () => flattenTopCoinsPages(marketQuery.data?.pages).slice(0, ASSET_SUGGEST_MAX * 2),
    [marketQuery.data?.pages]
  );

  const filteredAssets = useMemo(() => {
    const q = assetFilter.trim().toLowerCase();
    if (!q) return marketAssets.slice(0, ASSET_SUGGEST_MAX);
    return marketAssets
      .filter(
        (a) =>
          a.fsym.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.symbolDisplay.toLowerCase().includes(q)
      )
      .slice(0, ASSET_SUGGEST_MAX);
  }, [marketAssets, assetFilter]);

  const openModal = () => {
    setOpen(true);
    setAssetFilter("");
    setFsym("");
    setThreshold("");
    setKind("price_above");
    setRecurring(true);
  };

  const closeModal = () => {
    setOpen(false);
    setFsym("");
    setAssetFilter("");
    setThreshold("");
    setKind("price_above");
    setRecurring(true);
  };

  const pickAsset = (sym: string) => {
    const u = sym.trim().toUpperCase();
    setFsym(u);
    setAssetFilter(u);
  };

  const save = () => {
    const sym = (fsym.trim() || assetFilter.trim()).toUpperCase();
    const t = parseLocaleNumber(threshold);
    if (!sym || sym.length < 2) {
      Alert.alert("Elegí un activo", "Seleccioná uno de la lista o escribí el símbolo (ej. BTC).");
      return;
    }
    if (t === null) {
      Alert.alert(
        "Valor inválido",
        kind === "pct_up" || kind === "pct_down"
          ? "Ingresá un porcentaje con número (ej. 5 o 3,5)."
          : "Ingresá un precio en USD (podés usar coma o punto)."
      );
      return;
    }
    addAlert({ fsym: sym, kind, threshold: t, recurring });
    closeModal();
    void ensureNotificationPermissions().catch(() => {});
  };

  const thresholdLabel =
    kind === "pct_up" || kind === "pct_down"
      ? "Porcentaje del día (%)"
      : "Precio en dólares (USD)";
  const thresholdPlaceholder =
    kind === "pct_up" || kind === "pct_down" ? "Ej. 5" : "Ej. 95000";

  if (!ready) {
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <AppTopBar />
        <View style={styles.center}>
          <AppFriendlyLoader
            title="Cargando alertas"
            message="Leemos tus reglas guardadas en el dispositivo."
            icon="bell-ring-outline"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <AppTopBar
        trailing={
          <Pressable onPress={openModal} hitSlop={10} accessibilityLabel="Nueva alerta">
            <MaterialCommunityIcons name="plus-circle-outline" size={28} color={colors.primary} />
          </Pressable>
        }
      />
      <FlatList
        style={styles.listFlex}
        data={alerts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={alerts.length === 0 ? styles.listEmptyGrow : styles.list}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View style={styles.listHeader}>
            <ExpoNotificationsHintBanner />
            <Text style={styles.screenTitle}>Mis alertas</Text>
          </View>
        }
        ListEmptyComponent={<AlertsEmptyCallout onCreate={openModal} />}
        renderItem={({ item }) => {
          const accent = ALERT_ACCENT[item.kind];
          return (
            <View style={styles.alertCard}>
              <View style={[styles.alertAccentTop, { backgroundColor: accent }]} />
              <View style={styles.alertCardInner}>
                <View style={[styles.alertIconWrap, { borderColor: accent }]}>
                  <MaterialCommunityIcons
                    name={ALERT_ICON[item.kind] as never}
                    size={20}
                    color={accent}
                  />
                </View>
                <View style={styles.alertCol}>
                  <View style={styles.alertTopLine}>
                    <Text style={styles.alertSym}>{item.fsym}</Text>
                    <Pressable
                      onPress={() => removeAlert(item.id)}
                      hitSlop={10}
                      accessibilityLabel="Eliminar alerta"
                      style={({ pressed }) => [styles.alertTrash, pressed && styles.alertTrashPressed]}
                    >
                      <MaterialCommunityIcons name="delete-outline" size={22} color={colors.error} />
                    </Pressable>
                  </View>
                  <Text style={[styles.alertKind, { color: accent }]}>{kindLabel(item.kind)}</Text>
                  <Text style={styles.alertCond}>
                    {KIND_CARD_LABEL[item.kind]}{" "}
                    <Text style={styles.alertCondStrong}>
                      {item.threshold}
                      {item.kind === "pct_up" || item.kind === "pct_down" ? "%" : " USD"}
                    </Text>
                  </Text>
                  <View
                    style={[
                      styles.alertRecChip,
                      item.recurring ? styles.alertRecChipRecurring : styles.alertRecChipOnce,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={item.recurring ? "repeat" : "numeric-1-circle-outline"}
                      size={14}
                      color={item.recurring ? colors.primary : colors.secondary}
                    />
                    <Text
                      style={[
                        styles.alertRecTxt,
                        item.recurring ? styles.alertRecTxtRecurring : styles.alertRecTxtOnce,
                      ]}
                    >
                      {item.recurring ? "Cada vez" : "Una vez"}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          );
        }}
      />

      <Modal visible={open} animationType="fade" transparent onRequestClose={closeModal}>
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <Pressable style={styles.modalBackdropTap} onPress={closeModal} />
          <View style={styles.modalCenterWrap} pointerEvents="box-none">
            <View style={styles.modalCard}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>Nueva alerta</Text>
                <Pressable
                  onPress={closeModal}
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
                    value={assetFilter}
                    onChangeText={(t) => {
                      setAssetFilter(t);
                      setFsym("");
                    }}
                    placeholder="Buscar o escribir símbolo…"
                    placeholderTextColor={colors.onSurfaceVariant}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />

                  <View style={styles.suggestBox}>
                    {marketQuery.isPending && open ? (
                      <ActivityIndicator color={colors.primary} style={styles.suggestLoader} />
                    ) : filteredAssets.length === 0 ? (
                      <Text style={[typography.caption, styles.suggestEmpty]}>
                        {marketQuery.isError
                          ? "No pudimos cargar sugerencias. Escribí el símbolo igual."
                          : "Sin coincidencias. Probá otras letras o el símbolo completo."}
                      </Text>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled
                        style={styles.suggestScroll}
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredAssets.map((a) => {
                          const selected = fsym === a.fsym.toUpperCase();
                          return (
                            <Pressable
                              key={a.fsym}
                              onPress={() => pickAsset(a.fsym)}
                              style={({ pressed }) => [
                                styles.suggestRow,
                                selected && styles.suggestRowOn,
                                pressed && styles.suggestRowPressed,
                              ]}
                            >
                              <Text style={[typography.labelMd, styles.suggestSym]}>
                                {a.symbolDisplay}
                              </Text>
                              <Text
                                style={[typography.bodyMd, styles.suggestName]}
                                numberOfLines={1}
                              >
                                {a.name}
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
                    {KIND_MODAL.map((o) => {
                      const on = kind === o.kind;
                      const tileAccent = ALERT_ACCENT[o.kind];
                      return (
                        <Pressable
                          key={o.kind}
                          onPress={() => setKind(o.kind)}
                          style={({ pressed }) => [
                            styles.kindTile,
                            on && styles.kindTileOn,
                            on && { borderColor: tileAccent },
                            pressed && styles.kindTilePressed,
                          ]}
                        >
                          <View style={styles.kindTileTop}>
                            <MaterialCommunityIcons
                              name={ALERT_ICON[o.kind] as never}
                              size={22}
                              color={on ? tileAccent : colors.onSurfaceVariant}
                            />
                            {on ? (
                              <MaterialCommunityIcons name="check-circle" size={20} color={tileAccent} />
                            ) : (
                              <View style={styles.kindTileSpacer} />
                            )}
                          </View>
                          <Text
                            style={[styles.kindTileTitle, on && { color: tileAccent }]}
                            numberOfLines={2}
                          >
                            {o.title}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <Text style={styles.kindDetailHint} numberOfLines={4}>
                    {KIND_MODAL.find((x) => x.kind === kind)?.hint ?? ""}
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={[styles.fieldLbl, styles.fieldLblInSection]}>{thresholdLabel}</Text>
                  <TextInput
                    style={styles.input}
                    value={threshold}
                    onChangeText={setThreshold}
                    placeholder={thresholdPlaceholder}
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
                      value={recurring}
                      onValueChange={setRecurring}
                      trackColor={{
                        false: colors.outlineVariant,
                        true: "rgba(35, 99, 145, 0.45)",
                      }}
                      thumbColor={Platform.OS === "android" ? (recurring ? colors.primary : colors.surfaceContainerHigh) : undefined}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalActions}>
                <Pressable onPress={closeModal} style={({ pressed }) => [styles.btnGhost, pressed && styles.btnGhostPressed]}>
                  <Text style={styles.btnGhostTxt}>Cancelar</Text>
                </Pressable>
                <Pressable onPress={save} style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPrimaryPressed]}>
                  <Text style={styles.btnPrimaryTxt}>Guardar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

function AlertsEmptyCallout({ onCreate }: { onCreate: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <View style={styles.emptyIconCircle}>
        <MaterialCommunityIcons name="bell-plus-outline" size={40} color={colors.primary} />
      </View>
      <Text style={[typography.headlineMd, styles.emptyTitle]}>Todavía no tenés alertas</Text>
      <Text style={[typography.bodyMd, styles.emptyBody]}>
        Creá avisos de precio o de variación del día. También podés usar el botón{" "}
        <Text style={styles.emptyPlus}>+</Text> arriba a la derecha.
      </Text>
      <Text style={[typography.caption, styles.emptyFoot]}>
        Las reglas se guardan en este dispositivo. Los avisos se evalúan con la app abierta o al volver del fondo.
      </Text>
      <Pressable onPress={onCreate} style={({ pressed }) => [styles.emptyCta, pressed && styles.emptyCtaPressed]}>
        <MaterialCommunityIcons name="bell-plus-outline" size={22} color={colors.onPrimary} />
        <Text style={styles.emptyCtaTxt}>Nueva alerta</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listFlex: {
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listEmptyGrow: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
    flexGrow: 1,
  },
  listHeader: {
    marginBottom: spacing.xs,
  },
  screenTitle: {
    ...typography.headlineMd,
    fontSize: 24,
    lineHeight: 30,
    letterSpacing: -0.4,
    fontWeight: "800",
    color: colors.primary,
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  emptyWrap: {
    marginTop: spacing.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: "center",
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    ...toolbarPanelShadow,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.base,
  },
  emptyTitle: {
    ...typography.headlineMd,
    textAlign: "center",
    color: colors.onSurface,
    marginBottom: spacing.sm,
    fontWeight: "700",
  },
  emptyBody: {
    ...typography.bodyMd,
    textAlign: "center",
    color: colors.onSurfaceVariant,
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  emptyPlus: {
    fontWeight: "800",
    color: colors.primary,
  },
  emptyFoot: {
    ...typography.caption,
    textAlign: "center",
    color: colors.onSurfaceVariant,
    marginBottom: spacing.lg,
    lineHeight: 18,
  },
  emptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: radii.lg,
    alignSelf: "stretch",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  emptyCtaPressed: {
    opacity: 0.92,
  },
  emptyCtaTxt: {
    ...typography.labelMd,
    color: colors.onPrimary,
    fontWeight: "700",
  },
  alertCard: {
    marginBottom: spacing.base,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    overflow: "hidden",
    ...cardShadow,
  },
  alertAccentTop: {
    height: 3,
    width: "100%",
  },
  alertCardInner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    padding: spacing.md,
  },
  alertIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    borderWidth: 1.5,
    backgroundColor: colors.surfaceBright,
    alignItems: "center",
    justifyContent: "center",
  },
  alertCol: {
    flex: 1,
    minWidth: 0,
  },
  alertTopLine: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    marginBottom: 2,
  },
  alertSym: {
    ...typography.headlineMd,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "800",
    color: colors.onSurface,
    letterSpacing: -0.3,
    flex: 1,
  },
  alertKind: {
    ...typography.labelMd,
    fontWeight: "700",
    marginBottom: 2,
  },
  alertCond: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  alertCondStrong: {
    color: colors.onSurface,
    fontWeight: "700",
  },
  alertRecChip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 6,
    marginTop: spacing.sm,
    paddingVertical: 5,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.full,
    borderWidth: 1,
  },
  alertRecChipRecurring: {
    backgroundColor: "rgba(35, 99, 145, 0.1)",
    borderColor: "rgba(35, 99, 145, 0.35)",
  },
  alertRecChipOnce: {
    backgroundColor: "rgba(123, 88, 0, 0.08)",
    borderColor: "rgba(123, 88, 0, 0.35)",
  },
  alertRecTxt: {
    ...typography.caption,
    fontWeight: "700",
    fontSize: 11,
  },
  alertRecTxtRecurring: {
    color: colors.primary,
  },
  alertRecTxtOnce: {
    color: colors.secondary,
  },
  alertTrash: {
    padding: spacing.xs,
    borderRadius: radii.md,
  },
  alertTrashPressed: {
    backgroundColor: colors.errorContainer,
    opacity: 0.95,
  },
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
