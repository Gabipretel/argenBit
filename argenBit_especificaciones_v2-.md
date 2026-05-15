# Documento de Especificaciones y Requerimientos: Proyecto argenBit
### Versión 2.8 — Stack: Expo 54 · React 19 · RN 0.81.5 · StyleSheet nativo · UI Stitch (sin menú lateral ni trading)

> **Proveedor único de datos de mercado + noticias + streaming:** [CryptoCompare / CoinDesk API](https://min-api.cryptocompare.com/) (REST + WebSocket según [documentación legacy CoinDesk](https://developers.coindesk.com/)). **Nunca** commitear API keys; usar `.env` + `.env.example` (ver §6.0).

---

## 1. Descripción General del Proyecto

**argenBit** es una aplicación móvil analítica construida con **React Native (Expo)** que consume datos de criptomonedas en tiempo real. El objetivo central del proyecto es demostrar excelencia técnica en:

- **Arquitectura limpia y escalable** (Clean Architecture / Hexagonal)
- **Manejo avanzado de estado** diferenciado por responsabilidad
- **Optimización de rendimiento** para listas de alto volumen a 60fps
- **Conexión en tiempo real** vía WebSocket nativo de React Native
- **Resiliencia y UX robusta** ante fallos de red y errores de API

> **Dominio elegido:** Activos financieros (criptomonedas) — **CryptoCompare** ([min-api](https://min-api.cryptocompare.com/)). **API key obligatoria para `/data/v2/news/`**; **lista top** e **histórico** verificados **sin** key en pruebas `curl` (§6.6); igualmente conviene enviar **`api_key`** en todas las llamadas si la política de tu cuenta lo recomienda. **Tabla única de params, paginación y límites:** §6.9.

--- 

## 2. Stack Tecnológico

| Categoría | Tecnología | Justificación |
|---|---|---|
| Framework base | Expo SDK (última versión estable) | Gestión simplificada de builds, EAS Build, OTA updates |
| Lenguaje | TypeScript (modo estricto) | Tipado obligatorio. `any` prohibido excepto casos extremos justificados |
| Estilos | React Native StyleSheet (nativo) | Sin NativeWind ni CSS-in-JS; tokens del diseño se mapean a constantes TS (`theme/colors.ts`, etc.) |
| Tipografía | **Hanken Grotesk** (titulares) + **Manrope** (cuerpo y labels) vía `expo-font` / `@expo-google-fonts/*` | Paridad con mockups Stitch; cargar fuentes antes del primer frame de UI |
| Iconografía | **Tabs / navegación:** `@expo/vector-icons` (p. ej. **MaterialCommunityIcons** o **Ionicons**, incluido en Expo). Resto: Material Symbols vía SVG o equivalente | Búsqueda, tabs, favoritos — **sin** menú hamburguesa ni «sensors» en la top bar |
| Navegación | React Navigation v7 (Native Stack) | Stack nativo para transiciones 60fps, compatible con RN 0.81+ |
| Fetching / Server State | TanStack Query v5 (React Query) | Caché, reintentos, polling, invalidación y stale-while-revalidate |
| Estado Global / Client State | Redux Toolkit (RTK) | Filtros, búsqueda, preferencias del usuario |
| WebSocket | **API WebSocket nativa de React Native** | RN incluye WebSocket globalmente; no se requiere librería extra |
| HTTP Client | Axios | Interceptores, tipado de respuestas, manejo centralizado de errores |
| Listas virtualizadas | @shopify/flash-list | Renderizado de 60fps en listas de +100 ítems |
| Imágenes cacheadas | expo-image | Caché de imágenes nativa, optimizada para Expo |
| Animaciones | react-native-reanimated v3 | Animaciones en el UI thread (sin bridge JS), worklets |
| Gráficos | victory-native (con @shopify/react-native-skia) | Gráficos de líneas interactivos, rendimiento Skia |
| Conectividad | @react-native-community/netinfo | Detección de estado de red para modo offline |
| Fechas | dayjs | Librería ligera para formateo de fechas en gráficos |
| Persistencia local (favoritos, alertas MVP) | `@react-native-async-storage/async-storage` | Lista de IDs y reglas de alerta no son secretos; simple y suficiente |
| Notificaciones locales (alertas, opcional) | `expo-notifications` | Avisos cuando se cumple condición (ver §7.7; limitaciones en segundo plano) |
| Enlace externo (noticia completa) | `expo-linking` / `Linking.openURL` | Abrir el artículo en el navegador del sistema |

---

## 3. Arquitectura de Software: Clean Architecture

El proyecto implementa **Clean Architecture** (también denominada Arquitectura Hexagonal) con separación estricta en tres capas. Cada capa solo conoce a las capas interiores; **las capas externas nunca son importadas desde las internas**.

```
src/
├── domain/                    # Capa de Dominio (núcleo, sin dependencias externas)
│   ├── models/                # Interfaces TypeScript puras de negocio
│   │   ├── Asset.ts
│   │   ├── AssetHistory.ts
│   │   ├── AssetDetail.ts
│   │   └── NewsArticle.ts
│   └── repositories/          # Contratos (interfaces) de repositorios
│       ├── IAssetRepository.ts
│       └── INewsRepository.ts
│
├── data/                      # Capa de Datos (implementación de contratos)
│   ├── dtos/                  # Interfaces que reflejan exactamente la respuesta de la API
│   │   ├── AssetDTO.ts
│   │   ├── AssetDetailDTO.ts
│   │   ├── AssetHistoryDTO.ts
│   │   └── NewsArticleDTO.ts
│   ├── mappers/               # Transforman DTOs → Domain Models
│   │   ├── assetMapper.ts
│   │   ├── assetDetailMapper.ts
│   │   ├── assetHistoryMapper.ts
│   │   └── newsArticleMapper.ts
│   ├── repositories/          # Implementaciones concretas
│   │   ├── AssetRepository.ts
│   │   └── NewsRepository.ts
│   └── datasources/           # Clientes HTTP (Axios)
│       └── cryptoCompareApi.ts    # REST mercado + noticias (una base URL, §6)
│
├── presentation/              # Capa de Presentación (UI, estado, navegación)
│   ├── navigation/
│   │   ├── AppNavigator.tsx   # Stack raíz + tabs (ver §15)
│   │   └── types.ts           # Tipado de parámetros de navegación
│   ├── screens/
│   │   ├── HomeScreen/        # «Mercados» en UI Stitch
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── components/
│   │   │   │   ├── CryptoCard.tsx
│   │   │   │   ├── CryptoCardSkeleton.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── FilterBar.tsx
│   │   │   └── hooks/
│   │   │       └── useAssetsQuery.ts
│   │   └── DetailScreen/
│   │       ├── DetailScreen.tsx
│   │       ├── components/
│   │       │   ├── PriceChart.tsx
│   │       │   ├── MetricsCard.tsx
│   │       │   └── DetailSkeleton.tsx
│   │       └── hooks/
│   │           └── useAssetDetail.ts
│   │   ├── FavoritesScreen/   # UI Stitch «Favoritos» (fase posterior si aplica)
│   │   ├── NewsScreen/
│   │   │   ├── NewsScreen.tsx
│   │   │   ├── NewsDetailScreen.tsx
│   │   │   └── hooks/
│   │   │       └── useNewsInfiniteQuery.ts
│   │   └── AlertsScreen/      # UI Stitch «Alertas»
│   ├── store/                 # Redux Toolkit
│   │   ├── index.ts           # configureStore
│   │   └── slices/
│   │       └── filtersSlice.ts
│   ├── hooks/                 # Hooks globales reutilizables
│   │   ├── useWebSocket.ts
│   │   ├── useNetworkStatus.ts
│   │   └── useQueryClient.ts
│   └── components/            # Componentes genéricos/shared
│       ├── ErrorBoundary.tsx
│       ├── OfflineBanner.tsx
│       ├── ErrorFallback.tsx
│       └── NetworkToast.tsx
│
├── config/
│   ├── queryClient.ts         # Configuración global de TanStack Query
│   ├── axiosInstance.ts       # Instancia Axios con interceptores
│   └── constants.ts           # Base URL CryptoCompare, keys de AsyncStorage, caché
│
└── __tests__/
    ├── unit/
    │   ├── mappers/
    │   └── store/slices/
    └── integration/
        └── hooks/
```

### 3.1 Principios SOLID Aplicados

| Principio | Aplicación concreta |
|---|---|
| **S** — Single Responsibility | Cada mapper tiene una única responsabilidad: transformar un DTO específico |
| **O** — Open/Closed | Los repositorios implementan una interfaz; se puede agregar un nuevo datasource sin modificar código existente |
| **L** — Liskov Substitution | `AssetRepository` implementa `IAssetRepository`; puede ser reemplazado por un mock en tests |
| **I** — Interface Segregation | `IAssetRepository` define solo los métodos necesarios; no hay métodos vacíos forzados |
| **D** — Dependency Inversion | Los hooks dependen de `IAssetRepository`, no de `AssetRepository` directamente |

---

## 4. Gestión de Estado: Estrategia Híbrida

Se aplica una separación estricta por tipo de estado para evitar over-engineering y re-renders innecesarios:

```
┌─────────────────────────────────────────────────────────────┐
│                    TIPOS DE ESTADO                          │
├─────────────────┬───────────────────────────────────────────┤
│ Estado Servidor │ TanStack Query v5                         │
│ (Server State)  │ • Lista de assets (REST)                  │
│                 │ • Detalle del asset                       │
│                 │ • Histórico de precios (gráfico)          │
│                 │ • Polling de respaldo (60s)               │
├─────────────────┼───────────────────────────────────────────┤
│ Estado Global   │ Redux Toolkit                             │
│ (Client State)  │ • searchTerm: string                      │
│                 │ • activeFilters: FilterType[]             │
│                 │ • sortBy: SortField                       │
│                 │ • sortOrder: 'asc' | 'desc'               │
├─────────────────┼───────────────────────────────────────────┤
│ Tiempo Real     │ WebSocket Nativo (NO pasa por Redux)      │
│ (Real-Time)     │ • Mutación directa de caché TanStack Query│
│                 │ • queryClient.setQueryData()              │
│                 │ • Sin re-render de la lista completa      │
├─────────────────┼───────────────────────────────────────────┤
│ Estado Local    │ useState / useReducer                     │
│ (Local State)   │ • Estado de modales                       │
│                 │ • Valores de inputs no confirmados        │
│                 │ • Animaciones locales                     │
└─────────────────┴───────────────────────────────────────────┘
```

### Por qué NO Zustand / Context para estado global:
RTK fue elegido sobre Zustand para demostrar manejo avanzado de estado con DevTools, selectores memoizados con `createSelector`, y la capacidad de escalar el store. Context fue descartado por los problemas de re-render en listas de alto volumen.

---

## 5. Implementación WebSocket en React Native

> React Native incluye **WebSocket** globalmente (sin librería extra). El **streaming de precios CryptoCompare** está en la documentación legacy de CoinDesk: [How to connect (WebSockets)](https://developers.coindesk.com/documentation/legacy-websockets/HowToConnect). Ahí se define URL del streamer, mensajes de **suscripción** a pares y, si aplica, uso de **API key**.

### 5.1 Hook `useWebSocket.ts`

```
1. Tras cargar lista REST (top coins), abrir WS según CoinDesk/CryptoCompare.
2. Suscribirse a símbolos relevantes (top visibles o lista fija) sin saturar el canal.
3. Parsear mensajes → actualizar precio en TanStack Query (setQueryData por símbolo/fsym).
4. Backoff exponencial (§5.2); al volver la red (NetInfo), reintentar.
5. Cleanup en unmount.
6. No despachar cada tick a Redux.
```

### 5.2 Backoff exponencial

```typescript
const reconnectDelays = [1000, 2000, 4000, 8000, 16000]; // ms — tras ~5 fallos, indicador de error WS.
```

### 5.3 Lista y memo

`React.memo` en `CryptoCard` comparando solo campos que mutan con el stream.

---

## 6. API CryptoCompare / CoinDesk (única fuente)

### 6.0 Variables de entorno (Expo)

- En Expo, variables accesibles en el bundle suelen usar prefijo **`EXPO_PUBLIC_`** (ver [Environment variables](https://docs.expo.dev/guides/environment-variables/)).
- Ejemplo: **`EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY`** en archivo **`.env`** local (no commiteado). Plantilla vacía en **`.env.example`**.
- **Seguridad:** cualquier key en el cliente es **visible** en el binario; para producción serio usar **proxy**. Si una key se filtró (chat, screenshot), **revocarla** en el panel y crear otra.

### 6.1 REST — base y autenticación

| Base URL | `https://min-api.cryptocompare.com` |
|---|---|
| Auth | Query **`api_key`** (nombre exacto `api_key`). |

**Comportamiento verificado (curl, 2026):**

| Endpoint | `api_key` |
|---|---|
| `GET /data/top/mktcapfull` | Opcional en prueba — respondió **`Message":"Success"`**, `Type: 100` |
| `GET /data/v2/histoday` | Opcional en prueba — **`Response":"Success"`**, `Type: 100` |
| `GET /data/v2/news/` | **Obligatoria** — sin key: error *"You need a valid auth key or api key"* |

Recomendación de implementación: **añadir siempre `api_key`** en el cliente de Axios para todos los GET si tu cuenta lo exige en producción.

### 6.2 Mercado — `GET /data/top/mktcapfull`

**Query params:** `tsym` (obligatorio p. ej. `USD`), `limit`, `page`.

**Envelope típico:**

```json
{ "Message": "Success", "Type": 100, "MetaData": { "Count": <number> }, "Data": [ ... ] }
```

**Cada ítem `Data[]`** incluye:

- **`CoinInfo`:** `Id`, `Name`, `FullName`, **`Internal`** (ticker corto, usar como **`fsym`** junto con `RAW.USD.FROMSYMBOL`), **`ImageUrl`** (ruta relativa, ver §6.7).
- **`RAW.USD`:** `PRICE`, `CHANGEPCT24HOUR`, `MKTCAP`, `VOLUME24HOUR`, `SUPPLY`, etc.
- **`DISPLAY`:** mismos datos formateados para UI si se prefiere string ya localizado.

**Ranking:** el orden del array es el ranking por market cap para ese `tsym`.

**Infinite scroll:** incrementar **`page`** (`useInfiniteQuery`); concatenar páginas en el cliente.

### 6.3 Histórico de precios — `GET /data/v2/histoday` / `histohour`

**Params:** `fsym`, `tsym` (ej. `USD`), `limit` (número de velas).

**Envelope:** `Response":"Success"`, `Data`: objeto con array **`Data`** de velas: `time` (Unix seg), `open`, `high`, `low`, `close`, `volumefrom`, `volumeto`.

- **7D:** `histoday` con `limit=7`.
- **~1M:** `histohour` con `limit` alto o `histoday` con `limit` ~30 según diseño.

### 6.4 Noticias — `GET /data/v2/news/`

**Params:**

| Param | Uso |
|---|---|
| `api_key` | **Requerido** |
| `lang` | Ej. `ES` — en prueba hubo titulares en español |
| `limit` | Tamaño deseado por página (ver §6.6 sobre comportamiento) |
| **`lTs`** | Unix **segundos** del último `published_on` de la página anterior → artículos **anteriores** a ese instante (paginación hacia el pasado). Primera página **sin** `lTs`. |

**Envelope verificado:**

```json
{ "Type": 100, "Message": "News list successfully returned", "Data": [ ... ] }
```

**Cada noticia en `Data[]`:**

| Campo | Tipo | Uso UI |
|---|---|---|
| `id` | string | Id estable |
| `guid` | string | Opcional / permalink proveedor |
| `published_on` | number | Unix seg — orden y **`lTs`** siguiente |
| `imageurl` | string | Thumbnail |
| `title` | string | Titular |
| `url` | string | Abrir en navegador |
| `body` | string | Texto largo / resumen detalle in-app |
| `source` | string | Nombre fuente corto |

**Infinite scroll:** `fetchNextPage` con `lTs = último published_on` del batch actual (el más antiguo de la página si vienen ordenados desc por fecha).

### 6.5 DTO TypeScript (alinear con respuesta real)

```typescript
interface TopMktCapFullResponseDTO {
  Message: string;
  Type: number;
  MetaData?: { Count?: number };
  Data: TopCoinEntryDTO[];
}

interface TopCoinEntryDTO {
  CoinInfo: {
    Id: string;
    Name: string;
    FullName: string;
    Internal: string;
    ImageUrl?: string;
  };
  RAW: { USD: Record<string, unknown> }; // PRICE, CHANGEPCT24HOUR, MKTCAP, ...
}

interface HistodayResponseDTO {
  Response: string;
  Type: number;
  Data: {
    Data: Array<{
      time: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volumefrom: number;
      volumeto: number;
    }>;
  };
}

interface NewsV2ResponseDTO {
  Type: number;
  Message: string;
  Data: NewsArticleDTO[];
}

interface NewsArticleDTO {
  id: string;
  guid?: string;
  published_on: number;
  imageurl?: string;
  title: string;
  url: string;
  body?: string;
  source: string;
}
```

**Dominio `NewsArticle`:** mapear `summary` desde primeros caracteres de `body` o campo dedicado si aparece.

### 6.6 Verificación práctica (`curl`) — comportamiento observado

- **`limit` en `/data/v2/news/`:** en una petición con `limit` bajo, la API puede devolver **más ítems de los solicitados**. Mitigación: usar **`data.slice(0, pageSize)`** en cliente tras el fetch, o reconfirmar con la documentación vigente del plan.
- **Paginación `lTs`:** probado: segunda página con `lTs = published_on` del último ítem de la primera devuelve artículos más antiguos (timestamps coherentes).
- **Noticias sin key:** falla de auth — la app debe fallar con mensaje claro si falta `EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY`.

### 6.7 Imágenes de monedas

`CoinInfo.ImageUrl` suele ser ruta relativa (ej. `/media/.../usdc.png`). Construir URL absoluta típica: **`https://www.cryptocompare.com`** + `ImageUrl` (validar en runtime si algún ítem ya viene absoluto).

### 6.8 Otras APIs (descartadas)

**CoinCap**, **NewsData.io**, **cryptonews-api.com** — fuera de alcance v1; proveedor único **CryptoCompare**.

### 6.9 Resumen operativo — parámetros, paginación y límites

Referencia rápida alineada con las pruebas `curl` y el comportamiento descrito en §6.1–§6.7.

| Recurso | Método y ruta | Parámetros relevantes | Paginación / ventana | `api_key` (2026, pruebas) |
|---|---|---|---|---|
| Ranking market cap | `GET /data/top/mktcapfull` | `tsym` (ej. `USD`), `limit` (ítems por página), `page` | Infinite scroll: **`page`** siguiente; concatenar `Data[]` | Opcional en prueba |
| Histórico diario | `GET /data/v2/histoday` | `fsym`, `tsym`, **`limit`** (= número de velas diarias) | Sin paginación; §7.2 **7D** → típ. `limit=7` | Opcional en prueba |
| Histórico por hora | `GET /data/v2/histohour` | `fsym`, `tsym`, **`limit`** (= número de velas horarias) | §7.2 **~1M:** subir `limit` o combinar con `histoday` según diseño | Opcional en prueba |
| Noticias | `GET /data/v2/news/` | `lang` (ej. `ES`), **`limit`** (objetivo por página), **`lTs`** (Unix seg del último `published_on` de la página previa) | Infinite: página 1 **sin** `lTs`; siguientes con **`lTs`** del ítem más antiguo del batch actual | **Obligatoria** |

**Límites y APIs:**

- **`limit` en noticias:** la API puede devolver **más artículos que `limit`** → acotar en cliente con **`slice(0, pageSize)`** (§6.6).
- **`limit` en top:** usar como tamaño de página acordado en producto (p. ej. 20–50); **`page`** para páginas siguientes.
- **`limit` en histoday/histohour:** número de velas; máximos efectivos dependen del plan CryptoCompare — si la respuesta trunca, ajustar UI o trocear requests según documentación vigente.

---

## 7. Requerimientos Funcionales por Pantalla

### 7.1 Pantalla Home — «Mercados» (listado principal)

La implementación funcional es lista virtualizada + datos **CryptoCompare** (`top/mktcapfull`, §6.2); la **jerarquía visual** sigue Stitch / `DESIGN.md`; **top bar** solo marca **argenBit** (sin menú ni sensors).

#### 7.1.1 Lista virtualizada con FlashList
- Top coins por market cap en USD (orden natural del endpoint).
- `useInfiniteQuery` + **`onEndReached`** ~80 % → siguiente **`page`** (§6.2).
- `estimatedItemSize` calibrado para tarjeta tipo Stitch.

#### 7.1.1b Estrella en la barra / acceso Favoritos

- El ícono **estrella** en la zona superior de **Mercados** (según diseño Stitch en carpeta de export) **no** marca favoritos en cada fila: **lleva al usuario al tab Favoritos** (`navigation.navigate` / `jumpTo` al tab correspondiente).
- **Marcar favorito:** solo desde **detalle del activo** (estrella en app bar) y desde la lista **Favoritos** / sugerencias según mockup.

#### 7.1.2 CryptoCard — Componente por ítem
Cada ítem es una **tarjeta** (no una fila plana con separador): fondo `surface-container-lowest` (#FFFFFF), borde 1px `outline-variant`, **radio 16px**, sombra suave `0 4px 20px rgba(0,0,0,0.02)`, padding **16px**, separación vertical entre tarjetas **16px** (gap), alineada al mockup Stitch.

Cada tarjeta debe mostrar:
- Columna de **rank**: número centrado, tipografía `caption` (12px / 500), color `outline` (#717880), ancho fijo ~24px (equivalente a la columna del HTML).
- Logo del asset: URL desde **`ImageUrl`** del objeto CryptoCompare si existe; si no, placeholder con iniciales del símbolo (`fsym`).
- Nombre (`label-md` / semibold) y símbolo (`caption`, `on-surface-variant`, mayúsculas).
- Precio alineado a la derecha: `headline-md` (24px) peso visual de precio; en RN puede usarse `20–24px` según ajuste de interlineado para evitar saltos de layout.
- Variación 24h como **badge** pill:
  - **Positivo:** texto `primary` (#236391) sobre fondo `primary-container` al ~20% opacidad (`#74acdf` / 0.2).
  - **Negativo:** texto `error` (#ba1a1a) sobre fondo `error-container` al ~30% opacidad.
  - **Neutro (~0%):** texto `on-surface-variant` sobre `surface-container-low`.
- Iconografía de tendencia: Material `trending_up` / `trending_down` opcional junto al porcentaje (como en Favoritos / Detalle Stitch).

**Optimización obligatoria:**
```typescript
// CryptoCard debe ser React.memo con comparador personalizado:
export const CryptoCard = React.memo(({ asset }: Props) => {
  // ...
}, (prev, next) => prev.asset.priceUsd === next.asset.priceUsd &&
                    prev.asset.changePercent24Hr === next.asset.changePercent24Hr);
```

#### 7.1.3 Animación de precio (Reanimated v3)
Al recibir un update de precio vía WS:
- Flash si el precio subió o bajó: usar la misma semántica cromática que los badges — **alza:** tinte `primary-container` muy suave + texto `primary`; **baja:** tinte `error-container` suave + texto `error`. Alternativa acorde al detalle Stitch: alza con `#059669` / `#05966910`.
- Implementar con `useSharedValue` + `useAnimatedStyle` en el UI thread (worklet).
- Duración: ~400ms fade in/out. No bloquea el JS thread.

#### 7.1.4 Skeleton Loaders
- Durante `isLoading` de TanStack Query: renderizar una lista de `CryptoCardSkeleton` (mínimo 10 ítems).
- El skeleton debe tener animación de shimmer (pulse) implementada con Reanimated.
- No usar spinner genérico (`ActivityIndicator`) como reemplazo.

#### 7.1.5 Filtros y Búsqueda (Redux Toolkit)
Debajo del título de pantalla **«Mercados»** (`headline-lg`), el buscador replica el campo del mockup: placeholder **«Buscar criptomonedas…»**, ícono `search` a la izquierda, fondo `surface-bright`, borde `outline-variant`, foco con anillo/borde `primary`.

**Chips horizontales** (scroll sin barra visible), alineados a Stitch:
| Chip visual | Estado RTK / comportamiento |
|---|---|
| «Todos» | Reset de filtros de categoría o vista por defecto (equivalente a sin filtro de lista) |
| «Rango» (dropdown / sheet futuro) | Puede mapearse a orden por rank o a agrupación; MVP: orden `sortBy: rank` |
| «Precio» | `sortBy: priceUsd` + `sortOrder` |
| «Cambio (24h)» | `sortBy: changePercent24Hr` + `sortOrder` |

| Control | Estado | Comportamiento |
|---|---|---|
| Input de búsqueda | `RTK: searchTerm` | Debounce de 300ms antes de filtrar |
| Selector de orden | `RTK: sortBy` | `rank`, `priceUsd`, `changePercent24Hr`, `marketCapUsd` |
| Toggle ASC/DESC | `RTK: sortOrder` | Invierte el orden actual; indicar con ícono `swap_vert` en el chip activo |

> **Nota:** El filtrado/ordenamiento se aplica sobre los datos ya cargados en caché (no llama nuevamente a la API).

Los selectores de Redux deben usar `createSelector` (Reselect) para memoizar el resultado filtrado.

---

### 7.2 Pantalla de Detalle del Activo (Crypto Detail)

Referencia visual: `stitch_argenbit_mobile_app_design/argenbit_detalle_de_bitcoin_claro/code.html`. En esta pantalla **no** se muestra el bottom tab bar (flujo centrado en el activo), como en el mockup.

#### Navegación
```typescript
// Tipado de parámetros en types.ts (ejemplo; ajustar a tabs + stacks reales)
type RootStackParamList = {
  MainTabs: undefined;
  Detail: { fsym: string; displayName?: string }; // ej. fsym BTC — CryptoCompare
  NewsDetail: { articleId: string }; // o payload serializable según §7.5
};
```

#### Contenido de la pantalla
1. **Top bar:** botón atrás (`arrow_back`), marca **argenBit** centrada o a la derecha del back en `headline-lg` / `headline-md` color `primary`, acción trailing **estrella** (`star`) para favorito (hook / persistencia en fase posterior).
2. **Hero card:** contenedor blanco (`surface-container-lowest`), radio 16px, borde suave, sombra ligera; fila con logo 48×48 (o ícono Material `currency_bitcoin` en placeholder), nombre en `headline-md`, símbolo en `body-md` / variante; precio principal en **`display-lg`** (48px / 700); variación 24h con ícono `trending_up` / `trending_down`, color **éxito** `#059669` y fondo `#059669` al 10% para alza; para bajas usar `error` / `error-container` coherentes con lista.
3. **Sección «Rendimiento»:** título en desktop; toggle **7D / 1M** en contenedor `surface-container-low`, pill interno: segmento activo `primary` + texto `on-primary`, inactivo `on-surface-variant`.
4. **Gráfico de precios interactivo:**
   - `victory-native` + Skia; línea color **`primary` (#236391)**, stroke ~2.5px; área bajo curva con gradiente desde `primary-container` (~20% opacidad).
   - Histórico **7 días** por defecto; `1M` cambia el `interval` del endpoint.
   - Cursor / crosshair con tooltip (precio + fecha).
5. **Métricas (grid bento 2×2):** cards con íconos Material (`pie_chart`, `bar_chart`, `all_inclusive`, `lock`), labels `label-md` + valores `headline-md` / `body-lg` — Market Cap, Volumen 24h, Circulating supply, Max supply (mismos datos DTO que ya define el documento; **VWAP** puede mostrarse como quinta métrica o línea secundaria si cabe).
6. **Skeleton Loader** coherente con bloques anteriores.

> **No** incluir botones «Comprar» / «Vender» ni ningún CTA de trading: la app es informativa (precios y contexto), no exchange.

---

### 7.3 Resiliencia, Modo Offline y Manejo de Errores

#### 7.3.1 Detección de red: `useNetworkStatus`
- Usar `@react-native-community/netinfo`.
- Hook personalizado que expone: `isConnected: boolean`, `isInternetReachable: boolean`.

#### 7.3.2 Modo Sin Conexión
- Mostrar un **banner persistente** (`OfflineBanner`) cuando `isConnected === false`.
- TanStack Query debe seguir sirviendo datos desde caché (`staleTime` configurado adecuadamente).
- La conexión WS debe intentar reconectar cuando `isConnected` vuelva a `true`.
- Cerrar el banner con animación cuando se recupere la conexión.

#### 7.3.3 Error Boundaries
```typescript
// Envolver la navegación principal:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <AppNavigator />
</ErrorBoundary>
```
- `ErrorFallback`: Componente visual con mensaje descriptivo + botón "Reintentar" (que llama a `resetErrorBoundary`).

#### 7.3.4 Fallback de API (Error de servidor)
- Si TanStack Query recibe error 5xx o supera los reintentos: mostrar componente `ErrorFallback` específico de la pantalla.
- El botón "Reintentar" debe llamar al `refetch()` de TanStack Query.
- Configuración de reintentos: `retry: 3` con backoff exponencial (`retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000)`).

---

### 7.4 Pantalla «Noticias» (listado)

- **Datos:** `useNewsInfiniteQuery` → `/data/v2/news/` con **`lTs`** (§6.4).
- **UI Stitch:** bento / cards; **`onEndReached`** carga más artículos (scroll infinito “invisible”).
- **Tap card:** navegar a **§7.5** (no abrir navegador desde la lista).

### 7.5 Pantalla «Detalle de noticia» (in-app)

- **Referencia visual:** export Stitch `stitch_argenbit_mobile_app_design (1)/code.html` — hero imagen 16:9, badges, titular `headline-lg`, fuente + fecha, **varios párrafos** de cuerpo, CTA principal **«Ver nota completa»** con ícono `open_in_new` → `Linking.openURL(articleUrl)`.
- **Texto mostrado:** hasta **~1200–1800 caracteres** del `body` / resumen (~3 párrafos cortos); si el texto supera el tope, truncar con «…» y el usuario usa **Ver nota completa**. Ajustable tras prueba de contenido real.
- **Parámetros:** `articleId` + lectura desde caché de infinite query, o payload serializable.

### 7.6 Favoritos — persistencia

- **AsyncStorage**, clave exacta: **`argenbit-favorites`** — valor: JSON **`string[]`** de **`fsym`** (ej. `["BTC","ETH"]`). **Sin límite** de cantidad.
- Estrella en **detalle** agrega/quita; pantalla **Favoritos** lista en base a esa clave.
- **«Agregar monedas»** → tab **Mercados**.

### 7.7 Alertas — UI, reglas, modal y evaluación

**Qué significa “solo UI” vs “evaluar”:**

| Modo | Qué hace |
|---|---|
| **Solo UI + guardar** | El usuario crea alertas en pantalla y quedan guardadas en AsyncStorage; **no** hay comprobación automática — solo sirve para demostrar formulario y lista. |
| **Evaluar al usar la app** | Cada vez que la app está **abierta** (primer plano) o el usuario **vuelve** desde fondo, se comparan precios actuales (Query + WS) con las reglas y, si hay disparo, **toast / banner in-app** y opcionalmente **notificación local**. |

**Decisión MVP:** **evaluar con app abierta / al volver al foreground** + persistencia en **`argenbit-alerts`** (nombre sugerido junto a favoritos). Notificación **local** opcional cuando el disparo ocurre en ese momento.

**Tipos de condición (todas en v1):**

- **Precio:** cruza **por encima de X** USD o **por debajo de X** USD (respecto al último precio conocido del `fsym`).
- **Variación % 24h:** sube más de **Y %** o baja más de **Y %** (usar `CHANGEPCT24HOUR` del último snapshot CryptoCompare).

**Crear alerta:** **modal** (sheet o Modal RN) con campos: **moneda** (picker/lista por `fsym`), **tipo** (precio arriba/abajo / % arriba/abajo), **umbral** numérico, **única vez vs recurrente**, guardar → AsyncStorage.

**Limitación:** sin servidor ni background fetch agresivo no hay garantía de aviso con la app **cerrada** horas; documentar en copy de Alertas.

### 7.8 Deep links vs enlace web

| Concepto | Uso |
|---|---|
| **Enlace web** | Botón «Ver nota completa» → navegador del sistema (`articleUrl`). |
| **Deep link** (`argenbit://…`) | Opcional en v1; distinto del navegador — sirve para abrir una pantalla interna (p. ej. tras tocar notificación local). |

### 7.9 Navegación — cuatro tabs con stack propio

- **`BottomTabNavigator`** con 4 pestañas; **cada tab** tiene su **`NativeStackNavigator`** (patrón recomendado para que el historial de “atrás” sea por sección).
- **Mercados:** lista → `AssetDetail` (`fsym`).
- **Favoritos:** lista favoritos → mismo `AssetDetail` (compartido o duplicado en stack).
- **Noticias:** lista → `NewsDetail`.
- **Alertas:** lista; **«Crear alerta»** abre **modal** (no pantalla full obligatoria).
- **Íconos tabs:** `@expo/vector-icons` (**MaterialCommunityIcons** u **Ionicons**): `chart-line`, `star`, `newspaper`, `bell` (o equivalentes del mockup).

### 7.10 Permisos — notificaciones locales (`expo-notifications`)

- **iOS:** configurar texto de uso en plugin `expo-notifications` / `infoPlist` — mensaje sugerido (ES): *«argenBit envía avisos cuando se cumple una alerta de precio o variación que configuraste.»*
- **Android 13+:** permiso `POST_NOTIFICATIONS`; mismo mensaje en `permissions` del plugin si aplica.
- Solicitar permiso la **primera vez** que el usuario activa una alerta con “notificar” o en un flujo de onboarding de alertas.

---

## 8. Configuración Global de TanStack Query

```typescript
// config/queryClient.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,          // 30 segundos de frescura
      gcTime: 5 * 60_000,         // 5 minutos en caché inactiva
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
      refetchOnWindowFocus: false, // Evitar refetch en cambio de foco en mobile
      refetchOnReconnect: true,    // Refetch automático al reconectar
    },
  },
});
```

**Query Keys estrategia:**
```typescript
['topCoins', { page, tsym }]              // infinite top/mktcapfull
['topCoins', 'filtered', { search, sortBy, sortOrder }] // RTK + datos cacheados
['coin', fsym]                            // pricemultifull / refresco
['coin', fsym, 'history', kind]           // histoday | histohour + limit
['news', { lang, lTs }]                   // infinite noticias — lTs undefined en página 1
```

---

## 9. Configuración del Store Redux Toolkit

```typescript
// store/slices/filtersSlice.ts
interface FiltersState {
  searchTerm: string;
  sortBy: 'rank' | 'priceUsd' | 'changePercent24Hr' | 'marketCapUsd';
  sortOrder: 'asc' | 'desc';
}
```

**Selectores memoizados (createSelector):**
```typescript
// Combinar la lista de TanStack Query con los filtros de RTK
// El selector recibe assets[] del hook de query + state de filtros
// Retorna la lista ya filtrada y ordenada
const selectFilteredAssets = createSelector(
  [selectAllAssets, selectFilters],
  (assets, filters) => { /* lógica de filtrado/ordenamiento */ }
);
```

---

## 10. Testing Estratégico

> No se busca 100% de coverage. Se buscan tests que aporten valor real al comportamiento crítico.

### 10.1 Tests Unitarios — Mappers
```
__tests__/unit/mappers/assetMapper.test.ts
• Dado un AssetDTO con valores string, el mapper retorna el Model con priceUsd como number.
• Dado changePercent24Hr negativo en string, el mapper retorna number negativo.
• Dado maxSupply null, el mapper lo propaga correctamente como null.
• Dado un DTO con campos faltantes, el mapper no lanza excepciones (valores por defecto).
```

### 10.2 Tests Unitarios — Redux Slice
```
__tests__/unit/store/filtersSlice.test.ts
• setSearchTerm actualiza correctamente el estado.
• setSortBy cambia el campo de orden.
• toggleSortOrder invierte 'asc' → 'desc' y viceversa.
• resetFilters devuelve el estado inicial.
```

### 10.3 Tests de Integración — Custom Hooks
```
__tests__/integration/hooks/useAssetsQuery.test.ts
• Con MSW mockeando GET /assets, el hook retorna isLoading → isSuccess.
• Con MSW mockeando error 500, el hook expone isError = true.
• El hook expone los datos mapeados (Domain Models, no DTOs).
```

### 10.4 Tests de Componentes (RNTL)
```
__tests__/unit/components/CryptoCard.test.tsx
• Renderiza nombre, símbolo y precio correctamente.
• Aplica estilo de badge positivo (primary / primary-container) al porcentaje > 0.
• Aplica estilo de badge negativo (error / error-container) al porcentaje < 0.
• No se re-renderiza si el precio no cambió (React.memo).
```

### 10.5 Herramientas de Testing
```json
{
  "devDependencies": {
    "jest": "^29.x",
    "@testing-library/react-native": "^12.x",
    "@types/jest": "^29.x",
    "msw": "^2.x",
    "jest-expo": "latest"
  }
}
```

---

## 11. Listado Completo de Dependencias

> ⚠️ **Versiones fijadas para:** Expo `~54.0.33` · React `19.1.0` · React Native `0.81.5`
> Verificar compatibilidad con `npx expo install --check` tras la instalación.

### 11.1 Producción (`dependencies`)

```json
{
  "expo": "~54.0.33",
  "expo-status-bar": "~3.0.9",
  "react": "19.1.0",
  "react-native": "0.81.5",

  "@react-navigation/native": "^7.0.14",
  "@react-navigation/native-stack": "^7.2.0",
  "@react-navigation/bottom-tabs": "^7.2.0",
  "react-native-screens": "~4.4.0",
  "react-native-safe-area-context": "4.12.0",

  "@tanstack/react-query": "^5.62.0",
  "@reduxjs/toolkit": "^2.3.0",
  "react-redux": "^9.1.0",
  "axios": "^1.7.9",

  "@shopify/flash-list": "^1.7.2",
  "expo-image": "~2.0.1",
  "react-native-reanimated": "~3.16.1",

  "@shopify/react-native-skia": "~1.5.0",
  "victory-native": "^41.6.0",

  "@react-native-community/netinfo": "^11.4.1",

  "@react-native-async-storage/async-storage": "^2.1.0",

  "dayjs": "^1.11.13",

  "@expo-google-fonts/hanken-grotesk": "^0.4.0",
  "@expo-google-fonts/manrope": "^0.4.0"
}
```

> Tipografías: añadir **`expo-font`** con la versión que fije el SDK (`npx expo install expo-font`). Cargar Hanken Grotesk + Manrope antes del primer render (`useFonts`, splash) para cumplir §15.2.

> Notificaciones locales (§7.7): `npx expo install expo-notifications` y configurar permisos según documentación Expo.

### 11.2 Desarrollo (`devDependencies`)

```json
{
  "@types/react": "~19.1.0",
  "typescript": "~5.9.2",

  "jest": "^29.7.0",
  "jest-expo": "~54.0.0",
  "@testing-library/react-native": "^13.1.0",
  "@types/jest": "^29.5.14",
  "msw": "^2.6.4",
  "babel-plugin-module-resolver": "^5.0.2"
}
```

### 11.3 Comando de instalación sugerido

```bash
# Dependencias de producción
npx expo install expo-font \
  @react-navigation/native@^7.0.14 \
  @react-navigation/native-stack@^7.2.0 \
  @react-navigation/bottom-tabs@^7.2.0 \
  react-native-screens \
  react-native-safe-area-context \
  @tanstack/react-query \
  @reduxjs/toolkit \
  react-redux \
  axios \
  @shopify/flash-list \
  expo-image \
  react-native-reanimated \
  @shopify/react-native-skia \
  victory-native \
  @react-native-community/netinfo \
  dayjs

npm install @react-native-async-storage/async-storage @expo-google-fonts/hanken-grotesk @expo-google-fonts/manrope

npx expo install expo-notifications

# Dependencias de desarrollo
npm install --save-dev \
  jest@^29.7.0 \
  jest-expo \
  @testing-library/react-native@^13.1.0 \
  @types/jest@^29.5.14 \
  msw@^2.6.4 \
  babel-plugin-module-resolver@^5.0.2
```

> **Nota sobre WebSocket:** React Native expone `WebSocket` como API global. No se instala ninguna librería adicional. `new WebSocket('wss://...')` funciona out-of-the-box tanto en Expo Go como en builds nativos (EAS).

> **Nota sobre Estilos:** Se utiliza exclusivamente `StyleSheet` nativo de React Native. No se instala NativeWind ni ninguna capa de CSS-in-JS. Esto elimina overhead de parseo en runtime y maximiza el rendimiento en listas de alta frecuencia de actualización.

---

## 12. Optimizaciones de Rendimiento Obligatorias

| Optimización | Implementación | Impacto |
|---|---|---|
| `React.memo` + comparador | En `CryptoCard`, comparar solo `priceUsd` y `changePercent24Hr` | Evita re-render de 99 ítems cuando cambia 1 |
| `useCallback` en handlers | Handlers de `onPress`, `onEndReached`, `keyExtractor` | Referencia estable entre renders del padre |
| `useMemo` en selectores | Resultado del selector filtrado de RTK | No recalcular en renders sin cambios de filtros |
| Worklets Reanimated | Animación de flash de precio en UI thread | Sin bloqueo del JS thread |
| `expo-image` priority | `priority="high"` para primeras 10 imágenes visibles | Carga percibida más rápida |
| `FlashList` estimatedItemSize | Calcular altura real del ítem | Evita layout recalculation |
| WS → setQueryData | Actualización directa de caché sin Redux | Mínimo re-render scope |
| `keyExtractor` estable | Usar `asset.id` (string estable, no índice) | Evita re-mounts de FlashList |
| Debounce en búsqueda | 300ms antes de aplicar `searchTerm` | Evita filtrados en cada keystroke |

---

## 13. Manejo de Errores: Taxonomía Completa

```
Tipos de error y su manejo:

ERROR DE RED (sin conexión)
  → OfflineBanner (persiste mientras no hay red)
  → TanStack Query sirve desde caché
  → WS intenta reconexión con backoff

ERROR DE API (4xx, 5xx)
  → TanStack Query reintenta 3 veces
  → Si agota reintentos → ErrorFallback con botón "Reintentar"
  → Toast con mensaje descriptivo del error

ERROR DE RENDERIZADO (crash en componente)
  → ErrorBoundary captura el error
  → Muestra ErrorFallback global con opción de "Reiniciar"
  → No propaga el crash a toda la app

ERROR DE WEBSOCKET (conexión caída)
  → onclose/onerror dispara reconexión automática
  → Backoff exponencial: 1s → 2s → 4s → 8s → 16s
  → Indicador sutil de "actualizaciones en pausa" en UI
  → Al superar 5 intentos fallidos: mostrar aviso al usuario
```

---

## 14. Estructura del README del Proyecto

El `README.md` del repositorio debe incluir obligatoriamente:

### 14.1 Quick Start
```markdown
## Instalación y ejecución local

1. Clonar el repositorio
2. `npm install` o `yarn install`
3. `npx expo start`
4. Escanear QR con Expo Go o ejecutar en simulador
```

### 14.2 Decisiones de Arquitectura

> Este es el texto real a incluir en el README del repositorio.

---

## 🏗️ Decisiones de Arquitectura

### ¿Por qué Clean Architecture y no un enfoque más simple?

Honestamente, cuando uno tiene poco tiempo, la tentación de meter todo en un hook gigante y llamarlo "funcional" es real. Pero elegí Clean Architecture no para hacerme el interesante, sino porque la separación de responsabilidades me ayuda a moverme más rápido en la práctica: si CryptoCompare cambia la forma de su respuesta JSON mañana, toco un único mapper y listo —el resto de la app no se entera. La capa de Dominio (modelos puros) también hace que los tests sean escribibles de verdad, sin tener que mockear medio universo.

La clave fue no sobrediseñarla. Tres capas claras —Dominio, Datos, Presentación— con reglas simples de dependencia. No hay magia, solo carpetas con responsabilidades bien definidas.

### ¿Por qué TanStack Query en lugar de Context + useEffect?

Estuve en proyectos donde el "server state" vivía en un Context con `useState` y `useEffect`. La cantidad de bugs sutiles que eso genera —condiciones de carrera, estados de carga inconsistentes, no saber cuándo refetchear— no vale la pena cuando TanStack Query ya resuelve todo eso. Con una sola línea tenés caché automática, reintentos con backoff, estado de error separado del estado de carga, y refetch al volver al foco. Es una de esas librerías que, una vez que la usás, no entendés cómo viviste sin ella.

### ¿Por qué Redux Toolkit en lugar de Zustand o Context?

Zustand hubiera funcionado perfectamente para el scope de este proyecto, y en una situación normal probablemente lo elegiría por su simplicidad. Preferí RTK porque quería mostrar que puedo trabajar con `createSlice`, `createSelector` (Reselect) y el patrón de DevTools sin fricciones. Además, si la app crece hacia un portfolio personal, alertas de precio o sincronización offline, RTK escala más ordenadamente que Zustand para estados globales complejos. Context fue descartado directamente por el problema de re-renders en componentes de lista de alta frecuencia.

### ¿Por qué FlashList en lugar de FlatList?

FlatList tiene un problema conocido en listas de más de 50 items con actualizaciones frecuentes: mide cada celda individualmente y sus re-renders no están tan optimizados. Con precios de crypto actualizándose vía WebSocket, FlatList sufre visiblemente en dispositivos mid-range. FlashList recicla instancias de componentes de forma más agresiva y, con un `estimatedItemSize` bien calculado, la diferencia de fluidez es notable —especialmente al hacer scroll rápido mientras los precios se actualizan.

### ¿Por qué las actualizaciones del WebSocket no pasan por Redux?

Si cada mensaje del WebSocket disparara una acción de Redux, estaríamos ejecutando reducers y notificando a todos los suscriptores del store potencialmente varias veces por segundo. Eso puede generar re-renders en partes de la UI que no cambiaron en nada. Al mutar directamente la caché de TanStack Query con `queryClient.setQueryData`, solo se re-renderiza el componente exacto cuyo precio recibió una actualización —y gracias a `React.memo` con comparador personalizado en `CryptoCard`, eso se acota a un único ítem de la lista. Es la diferencia entre mover un alfil en el ajedrez versus revolver todas las piezas.

---

### 14.3 Trade-offs y mejoras futuras

> Este es el texto real a incluir en el README del repositorio.

---

## ⚖️ Trade-offs y qué haría diferente

### Con más tiempo haría...

**Tests más completos.** Cubrí los casos críticos —mappers, slice de Redux, hook principal— pero hay edge cases en el WebSocket que merecen sus propios tests: ¿qué pasa si llega un mensaje malformado? ¿Qué pasa si la reconexión falla cinco veces seguidas en background? Con el tiempo disponible, el testing quedó en lo funcional y estratégico, no en lo exhaustivo.

**Transiciones entre pantallas más pulidas.** Hoy la navegación entre el listado y el detalle es funcional pero genérica. Con más tiempo implementaría Shared Element Transitions con Reanimated 3 para que el logo y el nombre del asset "vuelen" desde la tarjeta hacia la pantalla de detalle. Ese tipo de detalle hace la diferencia en la percepción de calidad.

**Manejo de errores más granular.** Hoy el `ErrorFallback` es relativamente genérico. En producción separaría claramente "sin internet", "servidor caído", "timeout" y "error de datos" —con mensajes y acciones de recuperación distintas para cada caso.

### Features que quedaron fuera del scope

- **Favoritos:** UI completa en Stitch (`argenbit_favoritos/code.html`); persistencia con `expo-secure-store` o `AsyncStorage` cuando se implemente.
- **Alertas de precio:** UI en Stitch (`argenbit_alertas/code.html`); notificaciones push quedan fuera hasta definir backend.
- **Noticias:** UI en Stitch (`argenbit_noticias/code.html`); contenido puede ser estático/MVP o API futura.
- **Modo oscuro:** Los HTML incluyen clases `dark:` puntuales; el MVP sigue en **light**; toggle global opcional en roadmap.
- **Comparación de assets:** Mostrar dos líneas en el mismo gráfico del detalle.
- **Soporte multi-moneda:** Ver precios en EUR o BTC además de USD.
- **Portfolio personal:** Registrar tenencias y ver P&L en tiempo real.

### Optimizaciones que aplicaría después

- Analizar el bundle con `expo-bundle-analyzer` para detectar dependencias pesadas que se puedan lazy-loadear.
- Investigar el rendimiento en la Nueva Arquitectura (JSI / Fabric) de RN 0.81, que ya está disponible, para eliminar el bridge en animaciones críticas.
- Agregar persistencia de caché entre sesiones con `createAsyncStoragePersister` de TanStack Query, para que al abrir la app no haya ni un frame de loading si los datos son recientes.
- Implementar un `PerformanceObserver` en desarrollo para medir el tiempo real de renders en FlashList y detectar regresos de performance antes de que sean visibles.

---

### 14.4 Decisiones técnicas documentadas (inline)

> Convención de comentarios a aplicar en el código durante la implementación.

---

```typescript
// Convención de comentarios inline obligatorios:

// 1. En cada Custom Hook — bloque de encabezado
/**
 * useAssetsQuery
 * Responsabilidad: Fetching paginado (infinite) de la lista de assets.
 * Estado que maneja: Server State (TanStack Query).
 * Por qué infinite query: Carga progresiva de 100 assets en batches de 20
 * sin bloquear la UI inicial.
 */

// 2. En React.memo con comparador personalizado
// Comparamos solo priceUsd y changePercent24Hr porque son los únicos
// campos que mutan en tiempo real vía WebSocket. Comparar el objeto
// completo causaría re-renders innecesarios en cada actualización.
export const CryptoCard = React.memo(({ asset }: Props) => { ... },
  (prev, next) =>
    prev.asset.priceUsd === next.asset.priceUsd &&
    prev.asset.changePercent24Hr === next.asset.changePercent24Hr
);

// 3. En setQueryData del WebSocket
// Mutamos la caché de TanStack Query directamente en lugar de
// despachar una acción de Redux para evitar notificar a todos
// los suscriptores del store. Solo el CryptoCard con este id
// va a recibir la notificación de cambio y re-renderizarse.
queryClient.setQueryData(['topCoins', …], updaterFn); // actualizar precio del fsym afectado dentro del infinite data

// 4. En worklets de Reanimated
// Este bloque corre en el UI thread gracias al pragma 'worklet'.
// No bloquea el JS thread durante la animación de flash de precio.
const flashAnimation = () => {
  'worklet';
  backgroundColor.value = withSequence(...);
};

// 5. En backoff exponencial del WebSocket
// Aumentamos el delay entre reintentos para no saturar el servidor
// ni agotar la batería del dispositivo en caso de fallo prolongado.
const delay = Math.min(BASE_DELAY * 2 ** attempt, MAX_DELAY);
```

---

## 15. Diseño UX/UI — Sistema «argenBit Light & Professional» (Stitch)

> **Fuente de verdad visual:** exportaciones **Google Stitch** (p. ej. carpeta local `stitch_argenbit_mobile_app_design/`). Cada pantalla tiene un `code.html` con Tailwind y tokens; el documento normativo de marca está en `argenbit_light_professional/DESIGN.md`. La implementación en React Native usa **StyleSheet** mapeando estos valores a constantes TypeScript (sin Tailwind en runtime).

### 15.0 Principios de marca (resumen `DESIGN.md`)

- **Personalidad:** confiable, optimista, moderna; estética *clean corporate* argentina (**Albiceleste**), no “dark hacker”.
- **Celeste principal (`primary` #236391):** acciones primarias, estados activos, marca, líneas de gráfico.
- **Sol de Mayo / amarillo (`secondary-container` #febb1b, `secondary` #7b5800):** acento secundario — tabs activos, destacados “nuevo”, celebración; **no** como fondo global.
- **Blanco / superficies claras:** máxima legibilidad; fondos `background` / `surface` #f9f9fc y tarjetas `surface-container-lowest` #ffffff.
- **Texto en español** en toda la UI. Iconografía tipo **Material Symbols Outlined** donde aplique. **No** usar botón menú hamburguesa ni ícono de señal/sensores en la app bar (decisión de producto; los HTML de Stitch pueden conservarlos como referencia histórica).

---

### 15.1 Tokens de color (Material 3 / Stitch)

Mapeo recomendado para código RN (nombres semánticos → hex):

| Token semántico | Hex | Uso |
|---|---|---|
| `background` | `#f9f9fc` | Fondo general de pantalla |
| `surface` | `#f9f9fc` | Top bars, superficies al mismo tono que fondo en mockups |
| `surface-bright` | `#f9f9fc` | Área de input “clara” |
| `surface-container-low` | `#f3f3f6` | Fondos de toggles, secciones suaves |
| `surface-container-lowest` | `#ffffff` | Tarjetas elevadas, hero cards |
| `surface-container` / `surface-container-high` | `#eeeef0` / `#e8e8ea` | Placeholders, iconos en círculo |
| `surface-variant` | `#e2e2e5` | Bordes alrededor de avatares |
| `primary` | `#236391` | Botones primarios, títulos de marca, gráfico, chips activos |
| `on-primary` | `#ffffff` | Texto sobre botón primario |
| `primary-container` | `#74acdf` | Tintes, fondos de badge alcista (baja opacidad) |
| `on-primary-container` | `#003f65` | Texto sobre `primary-container` sólido |
| `secondary` | `#7b5800` | Énfasis oscuro del acento ámbar |
| `secondary-container` | `#febb1b` | Tab bar **activo** (fondo pill amarillo), highlights |
| `on-secondary-container` | `#6c4d00` | Texto/icon sobre tab activo |
| `on-surface` | `#1a1c1e` | Títulos y precios principales |
| `on-surface-variant` | `#41474f` | Subtítulos, tickers, metadata |
| `outline` | `#717880` | Iconos secundarios, rank |
| `outline-variant` | `#c1c7d0` | Bordes de cards e inputs |
| `error` | `#ba1a1a` | Variación negativa, destructivo |
| `error-container` | `#ffdad6` | Fondo badge / flash bajista |
| `on-error-container` | `#93000a` | Texto sobre error-container |
| `primary-fixed` / `on-primary-fixed` | `#cee5ff` / `#001d32` | Chips de estado en alertas (“Única vez”) |

**Variación alcista en hero de detalle (Stitch):** texto `#059669` con fondo `#059669` al 10% (éxito legible sobre blanco; coherente con `trending_up`).

---

### 15.2 Tipografía

| Escala | Familia | Tamaño / peso | Uso |
|---|---|---|---|
| `display-lg` | Hanken Grotesk | 48px / 700, lh 56, letterSpacing -0.02em | Precio hero en detalle |
| `headline-lg` | Hanken Grotesk | 32px / 700, lh 40 | Títulos de pantalla (“Mercados”, “Mis Favoritos”) |
| `headline-md` | Hanken Grotesk | 24px / 600, lh 32 | Precios en lista, subtítulos de sección |
| `body-lg` | Manrope | 18px / 400, lh 28 | Cuerpo destacado |
| `body-md` | Manrope | 16px / 400, lh 24 | Descripciones, símbolos en hero |
| `label-md` | Manrope | 14px / 600, lh 20 | Botones, labels de métricas, badges |
| `caption` | Manrope | 12px / 500, lh 16 | Rank, timestamps, meta |

---

### 15.3 Espaciado, radios y elevación

- **Baseline:** 4px; unidad estructural **16px** en padding de cards; **24px** entre secciones.
- **Márgenes horizontales de pantalla:** **20px** (`container-margin` Stitch).
- **Radios:** cards y botones principales **16px**; chips / small tags **8px**; inputs **12px**; pills **full**.
- **Sombras:** muy suaves — ej. `0 4px 20px rgba(0,0,0,0.02)` en cards; hover conceptual `0 8px 30px rgba(0,0,0,0.06)` (en RN: feedback con `opacity` / scale).
- **Bordes:** 1px `outline-variant` en tarjetas; barra superior `border-outline-variant` + `shadow-sm`.

---

### 15.4 Navegación global — Bottom tabs (móvil)

Cuatro destinos fijos, orden Stitch:

| Tab | Icono Material | Estado activo | Estado inactivo |
|---|---|---|---|
| Mercados | `bar_chart` (filled cuando activo) | Fondo pill `secondary-container`, texto/icon `on-secondary-container` | `on-surface-variant`; press → tint `primary` |
| Favoritos | `star` | Igual | Igual |
| Noticias | `newspaper` | Igual | Igual |
| Alertas | `notifications` | Igual | Igual |

Contenedor: fijo abajo, `bg-surface`, sombra superior `0 -4px 20px rgba(0,0,0,0.05)`, esquinas superiores redondeadas (`rounded-t-xl` ~12–16px), safe area inferior. **Pantalla de detalle de activo:** ocultar tabs (stack modal / pantalla a pantalla completa).

---

### 15.5 Pantalla «Mercados» (`argenbit_mercados/code.html`)

**Top app bar (fija, 64px):** fondo `surface`, borde inferior `outline-variant`, `shadow-sm`. **Solo** logotipo texto **argenBit** centrado en `headline-md` color `primary` (bold), sin leading ni trailing en tabs principales (Mercados, Favoritos, Noticias). El estado **WebSocket** no usa ícono «sensors»; si se muestra feedback de conexión, que sea **discreto** (p. ej. punto o texto bajo el título, o solo comportamiento silencioso en lista).

**Contenido principal** (padding horizontal 20px, padding inferior reservado al tab bar ~104px):

1. **Título** `headline-lg`: «Mercados».
2. **Buscador:** ancho completo, ícono `search`, placeholder «Buscar criptomonedas…», estilos §7.1.5.
3. **Fila de chips** scroll horizontal sin scrollbar: «Todos» (relleno `primary` + `on-primary`), resto outlined `surface-container-lowest` + borde `outline-variant` + `on-surface-variant`, con chevrons/dropdown donde aplique.
4. **Lista:** en HTML es grid responsive; en RN mantener **FlashList** vertical con **gap 16px** entre tarjetas tipo §7.1.2.

**Indicador WebSocket (opcional):** punto o leyenda pequeña fuera de la app bar, o sin indicador visual (solo actualización de precios). Colores: conectado = `primary` o éxito; reconectando = `error` tenue.

---

### 15.6 Pantalla «Detalle» (`argenbit_detalle_de_bitcoin_claro/code.html`)

Ver §7.2. Resumen visual: top bar con back + marca + favorito; hero; bloque «Rendimiento» con toggle 7D/1M; gráfico ~200px alto con gradiente bajo la curva; grid 2×2 de métricas con íconos. **Sin** CTAs de compra/venta.

---

### 15.7 Pantalla «Favoritos» (`argenbit_favoritos/code.html`)

- Misma top bar que Mercados (solo **argenBit** centrado).
- Título `headline-lg`: «Mis Favoritos».
- **Empty state:** card centrada radio 16px, ilustración circular, título `headline-md`, texto `body-md`, CTA primario «Agregar Monedas» con ícono `add_circle`.
- **Lista sugerida:** cards 16px con ícono en círculo `surface-container`, fila de precio + variación `primary` + `trending_up`, botón `star` outline.

---

### 15.8 Pantalla «Noticias» (`argenbit_noticias/code.html`)

- Top bar solo **argenBit** centrado (sin menú ni sensors); en desktop el HTML de referencia puede mostrar pivotes — en móvil bastan tabs inferiores.
- Título principal `headline-lg` color `primary`: «El Pulso del Mercado»; subtítulo `body-md` `on-surface-variant`.
- **Layout bento:** card destacada grande (imagen + chip «Tendencia» con `primary/10` + tiempo + titular `headline-md` + fuente con avatar), cards secundarias con misma línea visual (bordes `surface-variant`, sombras suaves, hover scale opcional en RN).
- **Datos reales:** mapear campos desde §6.4 / DTO `NewsArticleDTO` → dominio `NewsArticle` (imagen, título, fuente, `published_on`, resumen/`body`, URL al artículo).
- **Tap en card:** navegar a **pantalla detalle de noticia** (§7.5): resumen in-app + acción «Abrir en el navegador».

---

### 15.9 Pantalla «Alertas» (`argenbit_alertas/code.html`)

- Título `headline-lg` `primary`: «Mis Alertas»; descripción `body-md`.
- CTA **«Crear Nueva Alerta»** (`add_alert`) — botón `primary`, radio 16px.
- **Lista:** cards 16px borde `#E2E8F0` (equiv. `outline-variant`), fila con avatar moneda, nombre `headline-md` ~20px, badge ticker, copy de condición (`Precio sube de…` / `baja de…`).
- Chips de tipo: «Única vez» (`primary-fixed` / `on-primary-fixed`), «Recurrente» (`surface-container-high`).
- **Switch** iOS/Android nativo estilizado: track `primary` activo; trailing `delete` con hover `error`.

---

### 15.10 Estados de error y offline

#### Error Fallback (pantalla completa)

- Fondo `background` / `surface-bright`.
- Ícono en círculo con fondo `error-container` suave; color de glifo `error`.
- Botón primario «Reintentar» — `primary`, texto `on-primary`, altura ~52px, radio 16px.
- Botón secundario outline en detalle: borde `outline-variant`, texto `on-surface-variant`.

#### OfflineBanner

- Posición inferior flotante sobre contenido.
- Fondo acorde a marca: **amarillo suave** tipo `secondary-fixed` (#ffdea6) o `secondary-container` a baja opacidad, borde superior `secondary`; texto `on-secondary-container` o `secondary` para buen contraste.
- Copy: «Sin conexión · Mostrando datos en caché» + ícono `wifi_off`.

#### Toast de reconexión

- Fondo `primary` o verde `#059669`, texto blanco, breve, desde arriba.

---

### 15.11 Skeletons y microinteracciones

- Shimmer entre `surface-container-high` y `surface-container-lowest` (o pares definidos en §7).
- Flash de precio WS: §7.1.3.
- Footer infinite scroll: indicador `primary`.

---

### 15.12 Diagrama de flujo de navegación

```
Tabs: [ Mercados | Favoritos | Noticias | Alertas ]
         │
         ├─ tap crypto ──► Asset Detail (stack, sin tabs)
         └─ tap noticia ──► News Detail (stack) ──► opción «Abrir en navegador»
                  │
                  └─ error irrecuperable ──► ErrorFallback
```

---

### 15.13 Matriz de estados UI

| Estado | Pantalla | Tratamiento |
|---|---|---|
| `isLoading` inicial | Mercados | Lista de skeletons en forma de tarjetas |
| `isFetchingNextPage` | Mercados | Footer spinner `primary` |
| Sin resultados búsqueda | Mercados | Empty state textual + ícono |
| `isLoading` | Detalle | Hero + gráfico + métricas en skeleton |
| Sin conexión | Global | OfflineBanner + datos caché |
| Error API | Por pantalla | ErrorFallback / retry |
| WS alza/baja | Mercados | Flash coherente con badges |

---

### 15.14 Criterios de aceptación UX/UI

#### Mercados

- [ ] Top bar y tabs coinciden con jerarquía Stitch (espaciado 20px, tipografías definidas).
- [ ] Tarjetas son entidades visuales independientes (radio 16px, sombra ligera), no lista dividida estilo iOS Settings.
- [ ] Chips reflejan estado activo/inactivo con `primary` vs outlined.
- [ ] Variación % usa badge (positivo / negativo / neutro) como en HTML.
- [ ] 60fps con WS + FlashList.

#### Detalle

- [ ] Precio hero en `display-lg`; variación con ícono de tendencia y color correcto.
- [ ] Toggle 7D/1M estilado como pastilla `surface-container-low`.
- [ ] Gráfico usa `primary` para la línea y gradiente bajo la curva.

#### Favoritos / Noticias / Alertas

- [ ] Estructura y copy alineados a los HTML de referencia (títulos, empty states, CTAs).
- [ ] Componentes táctiles mínimo 44×44pt.

#### Accesibilidad

- [ ] Variación no depende solo del color (badge + ícono o texto explícito).
- [ ] Contraste AA sobre fondos claros.
- [ ] `accessibilityLabel` en buscador: «Buscar criptomonedas».

---

## 16. Bonus: EAS Build / Expo Go

- Configurar `eas.json` con profile `preview` para generar un APK de prueba.
- Alternativamente, publicar a Expo Go y adjuntar el QR en el README.
- El build debe funcionar correctamente con el WebSocket nativo.

---

## 17. Instrucciones para la IA Generadora

Al iniciar la implementación, respetar este orden estricto:

```
ORDEN DE IMPLEMENTACIÓN:

FASE 1 — Infraestructura base
  1. Configurar proyecto Expo con TypeScript estricto
  2. Instalar y configurar todas las dependencias (incl. `expo-font` + `@expo-google-fonts/hanken-grotesk` + `@expo-google-fonts/manrope` para paridad Stitch)
  3. Definir módulo de tema (`colors`, `typography`, `spacing`) según §15
  4. Configurar path aliases en tsconfig.json y babel.config.js

FASE 2 — Capa de Dominio
  5. Definir Domain Models (interfaces puras), incl. `NewsArticle`
  6. Definir contratos `IAssetRepository` e `INewsRepository`

FASE 3 — Capa de Datos
  7. Definir DTOs (Asset*, AssetHistory, NewsArticle + envelope CryptoCompare)
  8. Implementar Mappers con tests unitarios
  9. Configurar Axios / params CryptoCompare (`EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY`)
  10. Implementar `AssetRepository` y `NewsRepository`

FASE 4 — Estado Global
  11. Configurar QueryClient (TanStack Query)
  12. Configurar Redux Store + filtersSlice
  13. Crear selectores memoizados

FASE 5 — Hooks de Presentación
  14. useAssetsQuery (TanStack Query + Infinite)
  15. useWebSocket (WS nativo + setQueryData)
  16. useNetworkStatus (netinfo)
  17. useAssetDetail
  18. useNewsInfiniteQuery (CryptoCompare §6.4–§6.9)

FASE 6 — Navegación y Pantallas
  19. AppNavigator: **4 tabs**, cada uno con **stack propio** (§7.9)
  20. HomeScreen (Mercados): app bar solo marca + FlashList de tarjetas + chips + skeletons
  21. DetailScreen: hero, rendimiento, gráfico, métricas — **sin** comprar/vender
  22. NewsScreen + NewsDetailScreen (§7.4–7.5); feed `/data/v2/news/` + paginación `lTs` (§6.4)
  23. FavoritesScreen con AsyncStorage (§7.6); AlertsScreen UI + evaluación + opcional `expo-notifications` (§7.7)

FASE 7 — Resiliencia
  24. ErrorBoundary global
  25. OfflineBanner (estilo §15.10)
  26. ErrorFallback components

FASE 8 — Testing
  27. Tests unitarios de mappers (assets + news)
  28. Tests unitarios del slice de Redux
  29. Tests de integración del hook principal

FASE 9 — README y documentación
  30. Redactar README.md completo (variables `EXPO_PUBLIC_CRYPTOCOMPARE_API_KEY`, etc.)
```

---

*Documento generado para uso técnico interno — Proyecto argenBit v2.8 — Expo 54 / React 19 / RN 0.81.5 — CryptoCompare único (REST + WS + noticias)*
