# BuildFlow — Refined System Architecture v2.0

> **Principal Architect Review — Full Architecture Refinement**
> Incorporates 11 structural improvements. No implementation code. Architecture only.

---

## Table of Contents

1. [Complete Updated Folder Structure](#1-complete-updated-folder-structure)
2. [Layer Map & Dependency Rules](#2-layer-map--dependency-rules)
3. [Module-by-Module Architecture Review](#3-module-by-module-architecture-review)
   - [core/geometry](#31-coregeometry)
   - [core/elements](#32-coreelements)
   - [core/measurements ⭐ NEW](#33-coremeasurements--new)
   - [core/snapping ⭐ NEW](#34-coresnapping--new)
   - [core/constraints ⭐ NEW](#35-coreconstraints--new)
   - [core/scene](#36-corescene)
   - [core/history](#37-corehistory)
   - [core/bim ⭐ NEW](#38-corebim--new)
   - [core/templates](#39-coretemplates)
   - [core/serialization](#310-coreserialization)
   - [engines/](#311-engines)
   - [store/](#312-store)
   - [hooks/](#313-hooks)
   - [features/canvas](#314-featurescanvas)
   - [features/roofs ⭐ NEW](#315-featuresroofs--new)
   - [features/terrain ⭐ NEW](#316-featuresterrain--new)
   - [features/ (remaining)](#317-features-remaining)
   - [templates/ ⭐ EXPANDED](#318-templates--expanded)
   - [ai/ ⭐ NEW](#319-ai--new)
   - [assets/ ⭐ NEW](#320-assets--new)
   - [exports/ ⭐ NEW](#321-exports--new)
   - [services/](#322-services)
   - [ui/](#323-ui)
   - [types/](#324-types)
   - [utils/](#325-utils)
   - [shared/](#326-shared)
   - [server/](#327-server)
4. [Data Flow Architecture](#4-data-flow-architecture)
5. [State Management Architecture](#5-state-management-architecture)
6. [Scalability Recommendations](#6-scalability-recommendations)
7. [Future Roadmap Considerations](#7-future-roadmap-considerations)

---

## 1. Complete Updated Folder Structure

```
buildflow/
│
├── public/
│   ├── assets/
│   │   ├── textures/                 # PBR material textures
│   │   └── models/                   # Bundled GLTF/GLB primitives
│   └── templates/                    # Bundled built-in template JSON files
│
├── src/
│   │
│   ├── app/
│   │   ├── App.tsx
│   │   ├── routes.tsx
│   │   └── providers.tsx
│   │
│   ├── core/                         # ← PURE DOMAIN LAYER. Zero external dependencies.
│   │   │
│   │   ├── geometry/                 # Primitive geometry math
│   │   │   ├── primitives/
│   │   │   │   ├── Point.ts
│   │   │   │   ├── Vector2.ts
│   │   │   │   ├── Vector3.ts
│   │   │   │   ├── Line.ts
│   │   │   │   ├── Segment.ts
│   │   │   │   └── Polygon.ts
│   │   │   ├── operations/
│   │   │   │   ├── Offset.ts
│   │   │   │   ├── Intersect.ts
│   │   │   │   ├── Union.ts
│   │   │   │   ├── Difference.ts
│   │   │   │   └── BoundingBox.ts
│   │   │   ├── graph/
│   │   │   │   ├── SpatialGraph.ts
│   │   │   │   ├── FaceDetector.ts   # Room topology detection
│   │   │   │   └── AdjacencyMap.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── elements/                 # Architectural domain models (data only)
│   │   │   ├── Wall.ts
│   │   │   ├── Door.ts
│   │   │   ├── Window.ts
│   │   │   ├── Room.ts
│   │   │   ├── Slab.ts
│   │   │   ├── Stair.ts
│   │   │   ├── Column.ts
│   │   │   ├── Beam.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── measurements/             # ⭐ NEW — Dedicated measurement engine
│   │   │   ├── AreaCalculator.ts
│   │   │   ├── PerimeterCalculator.ts
│   │   │   ├── WallLengthCalculator.ts
│   │   │   ├── RoomMetrics.ts
│   │   │   ├── UnitConverter.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── snapping/                 # ⭐ NEW — Engine-independent snap system
│   │   │   ├── GridSnap.ts
│   │   │   ├── WallSnap.ts
│   │   │   ├── AngleSnap.ts
│   │   │   ├── GuideSnap.ts
│   │   │   ├── IntersectionSnap.ts
│   │   │   ├── SnapManager.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── constraints/              # ⭐ NEW — Geometric constraint solver
│   │   │   ├── Constraint.ts
│   │   │   ├── ParallelConstraint.ts
│   │   │   ├── PerpendicularConstraint.ts
│   │   │   ├── EqualLengthConstraint.ts
│   │   │   ├── AlignmentConstraint.ts
│   │   │   ├── ConstraintSolver.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── scene/
│   │   │   ├── SceneGraph.ts
│   │   │   ├── SceneNode.ts
│   │   │   ├── Layer.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── history/
│   │   │   ├── CommandBus.ts
│   │   │   ├── Command.ts
│   │   │   └── commands/
│   │   │       ├── AddWallCommand.ts
│   │   │       ├── MoveNodeCommand.ts
│   │   │       ├── DeleteNodeCommand.ts
│   │   │       ├── AddDoorCommand.ts
│   │   │       └── BatchCommand.ts
│   │   │
│   │   ├── bim/                      # ⭐ NEW — BIM preparation layer
│   │   │   ├── ElementMetadata.ts
│   │   │   ├── MaterialMetadata.ts
│   │   │   ├── BuildingMetadata.ts
│   │   │   ├── SpaceMetadata.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── templates/                # Template registry (core logic only)
│   │   │   ├── TemplateRegistry.ts
│   │   │   ├── TemplateSchema.ts
│   │   │   └── index.ts
│   │   │
│   │   └── serialization/
│   │       ├── ProjectSerializer.ts
│   │       ├── ProjectDeserializer.ts
│   │       └── schema/
│   │           ├── v1.schema.json
│   │           └── migrations/
│   │
│   ├── engines/
│   │   ├── IRenderEngine.ts          # Shared contract
│   │   ├── engine2d/                 # Konva.js adapter
│   │   │   ├── Konva2DEngine.ts
│   │   │   ├── renderers/
│   │   │   │   ├── WallRenderer2D.ts
│   │   │   │   ├── DoorRenderer2D.ts
│   │   │   │   ├── WindowRenderer2D.ts
│   │   │   │   ├── RoomRenderer2D.ts
│   │   │   │   └── StairRenderer2D.ts
│   │   │   └── interactions/
│   │   │       ├── DrawTool.ts
│   │   │       ├── SelectTool.ts
│   │   │       └── PanZoomTool.ts
│   │   │
│   │   └── engine3d/                 # React Three Fiber adapter
│   │       ├── R3F3DEngine.ts
│   │       ├── renderers/
│   │       │   ├── WallRenderer3D.ts
│   │       │   ├── DoorRenderer3D.ts
│   │       │   ├── WindowRenderer3D.ts
│   │       │   └── RoofRenderer3D.ts
│   │       ├── lighting/
│   │       │   ├── DaylightPreset.ts
│   │       │   └── ArtificialPreset.ts
│   │       ├── materials/
│   │       │   └── PBRMaterialRegistry.ts
│   │       └── camera/
│   │           ├── OrbitCamera.ts
│   │           └── WalkthroughCamera.ts
│   │
│   ├── store/
│   │   ├── useProjectStore.ts
│   │   ├── useSceneStore.ts
│   │   ├── useSelectionStore.ts
│   │   ├── useToolStore.ts
│   │   ├── useViewStore.ts
│   │   ├── useHistoryStore.ts
│   │   ├── useCollaborationStore.ts
│   │   ├── useMeasurementStore.ts    # ⭐ NEW — Active measurements & annotations
│   │   ├── useSnapStore.ts           # ⭐ NEW — Snap settings & active snap state
│   │   ├── useAIStore.ts             # ⭐ NEW — AI task queue, generation state
│   │   └── useUIStore.ts
│   │
│   ├── hooks/
│   │   ├── useEngine.ts
│   │   ├── useCommand.ts
│   │   ├── useSnap.ts                # Consumes core/snapping via SnapManager
│   │   ├── useMeasure.ts             # Consumes core/measurements
│   │   ├── useConstraints.ts         # Consumes core/constraints
│   │   ├── useSelection.ts
│   │   ├── useShortcuts.ts
│   │   ├── useRealtime.ts
│   │   └── useAI.ts                  # ⭐ NEW — AI generation hooks
│   │
│   ├── features/
│   │   ├── canvas/
│   │   │   ├── Canvas2D.tsx
│   │   │   ├── Canvas3D.tsx
│   │   │   ├── CanvasSwitcher.tsx
│   │   │   └── CanvasOverlay.tsx
│   │   │
│   │   ├── toolbar/
│   │   │   ├── ToolbarPanel.tsx
│   │   │   ├── DrawingTools.tsx
│   │   │   └── SelectionTools.tsx
│   │   │
│   │   ├── properties/
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── WallProperties.tsx
│   │   │   ├── DoorProperties.tsx
│   │   │   ├── WindowProperties.tsx
│   │   │   ├── RoomProperties.tsx
│   │   │   └── MeasurementOverlay.tsx  # ⭐ NEW
│   │   │
│   │   ├── layers/
│   │   │   ├── LayersPanel.tsx
│   │   │   └── LayerItem.tsx
│   │   │
│   │   ├── templates/
│   │   │   ├── TemplateLibrary.tsx
│   │   │   ├── TemplateCard.tsx
│   │   │   └── TemplateSearch.tsx
│   │   │
│   │   ├── collaboration/
│   │   │   ├── AvatarStack.tsx
│   │   │   ├── RemoteCursor.tsx
│   │   │   └── ConflictBanner.tsx
│   │   │
│   │   ├── roofs/                    # ⭐ NEW — Roof modeling feature
│   │   │   ├── GableRoof.ts
│   │   │   ├── HipRoof.ts
│   │   │   ├── FlatRoof.ts
│   │   │   ├── ShedRoof.ts
│   │   │   └── RoofGenerator.ts
│   │   │
│   │   ├── terrain/                  # ⭐ NEW — Terrain & site modeling
│   │   │   ├── TerrainSurface.ts
│   │   │   ├── TerrainEditor.ts
│   │   │   ├── RoadGenerator.ts
│   │   │   ├── SlopeGenerator.ts
│   │   │   └── TerrainRenderer.ts
│   │   │
│   │   ├── ai/                       # ⭐ NEW — AI generation UI
│   │   │   ├── AIPanel.tsx
│   │   │   ├── GenerationPrompt.tsx
│   │   │   └── GenerationPreview.tsx
│   │   │
│   │   ├── export/
│   │   │   ├── ExportPanel.tsx
│   │   │   └── ExportProgress.tsx
│   │   │
│   │   └── project/
│   │       ├── ProjectDashboard.tsx
│   │       ├── FloorPlanManager.tsx
│   │       └── ProjectSettings.tsx
│   │
│   ├── templates/                    # ⭐ EXPANDED — Structured template library
│   │   ├── residential/
│   │   │   ├── bungalow/
│   │   │   │   ├── 2bed-bungalow.json
│   │   │   │   └── 3bed-bungalow.json
│   │   │   ├── duplex/
│   │   │   ├── apartment/
│   │   │   └── townhouse/
│   │   │
│   │   ├── commercial/
│   │   │   ├── office/
│   │   │   ├── hotel/
│   │   │   ├── restaurant/
│   │   │   └── retail/
│   │   │
│   │   ├── public/
│   │   │   ├── school/
│   │   │   ├── hospital/
│   │   │   ├── church/
│   │   │   └── mosque/
│   │   │
│   │   ├── interiors/
│   │   │   ├── kitchen/
│   │   │   ├── bedroom/
│   │   │   ├── living-room/
│   │   │   └── office/
│   │   │
│   │   └── metadata/
│   │       ├── categories.json
│   │       ├── tags.json
│   │       └── index.json            # Search index for all templates
│   │
│   ├── ai/                           # ⭐ NEW — AI generation system
│   │   ├── generators/
│   │   │   ├── floorplans/
│   │   │   │   ├── DuplexGenerator.ts
│   │   │   │   ├── BungalowGenerator.ts
│   │   │   │   └── ApartmentGenerator.ts
│   │   │   ├── elevations/
│   │   │   │   ├── FrontElevationGenerator.ts
│   │   │   │   ├── SideElevationGenerator.ts
│   │   │   │   └── RearElevationGenerator.ts
│   │   │   └── furniture/
│   │   │       ├── BedroomLayoutGenerator.ts
│   │   │       ├── KitchenLayoutGenerator.ts
│   │   │       └── LivingRoomLayoutGenerator.ts
│   │   │
│   │   ├── prompts/
│   │   │   ├── floorplans/
│   │   │   │   ├── base.prompt.txt
│   │   │   │   └── constraints.prompt.txt
│   │   │   ├── elevations/
│   │   │   └── furniture/
│   │   │
│   │   ├── providers/
│   │   │   ├── AIProvider.ts         # Abstract base interface
│   │   │   ├── OpenAIProvider.ts
│   │   │   ├── AnthropicProvider.ts
│   │   │   └── GeminiProvider.ts
│   │   │
│   │   ├── schemas/
│   │   │   ├── FloorPlanSchema.ts    # Zod-validated AI output shape
│   │   │   ├── ElevationSchema.ts
│   │   │   └── FurnitureSchema.ts
│   │   │
│   │   └── orchestration/
│   │       ├── AITaskRunner.ts
│   │       ├── PromptBuilder.ts
│   │       └── ResponseParser.ts
│   │
│   ├── assets/                       # ⭐ NEW — Asset library system
│   │   ├── furniture/
│   │   │   ├── seating/
│   │   │   ├── tables/
│   │   │   └── storage/
│   │   ├── materials/
│   │   │   ├── concrete/
│   │   │   ├── wood/
│   │   │   └── glass/
│   │   ├── doors/
│   │   │   ├── single/
│   │   │   └── double/
│   │   ├── windows/
│   │   │   ├── casement/
│   │   │   └── sliding/
│   │   ├── roofs/
│   │   ├── stairs/
│   │   ├── landscaping/
│   │   │   ├── trees/
│   │   │   └── ground-cover/
│   │   └── metadata/
│   │       ├── categories.json
│   │       └── index.json            # Asset search index
│   │
│   ├── exports/                      # ⭐ NEW — Unified export system
│   │   ├── pdf/
│   │   │   ├── PDFExporter.ts
│   │   │   └── PrintLayout.ts
│   │   ├── png/
│   │   │   └── PNGExporter.ts
│   │   ├── svg/
│   │   │   └── SVGExporter.ts
│   │   ├── obj/
│   │   │   └── OBJExporter.ts
│   │   ├── glb/
│   │   │   └── GLBExporter.ts
│   │   ├── fbx/
│   │   │   └── FBXExporter.ts
│   │   ├── stl/
│   │   │   └── STLExporter.ts
│   │   └── export-manager/
│   │       ├── ExportManager.ts      # Unified orchestrator
│   │       ├── ExportJob.ts          # Job queue entry
│   │       └── SheetGenerator.ts     # Drawing sheet layouts
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── projectApi.ts
│   │   │   ├── templateApi.ts
│   │   │   ├── assetApi.ts           # ⭐ NEW
│   │   │   ├── aiApi.ts              # ⭐ NEW — AI provider proxy calls
│   │   │   └── userApi.ts
│   │   ├── realtime/
│   │   │   ├── RealtimeClient.ts
│   │   │   └── CRDTAdapter.ts
│   │   └── storage/
│   │       └── LocalStorageService.ts
│   │
│   ├── ui/
│   │   ├── components/
│   │   ├── icons/
│   │   └── theme/
│   │
│   ├── types/
│   │   ├── geometry.types.ts
│   │   ├── element.types.ts
│   │   ├── project.types.ts
│   │   ├── scene.types.ts
│   │   ├── measurement.types.ts      # ⭐ NEW
│   │   ├── snap.types.ts             # ⭐ NEW
│   │   ├── ai.types.ts               # ⭐ NEW
│   │   ├── asset.types.ts            # ⭐ NEW
│   │   ├── export.types.ts           # ⭐ NEW
│   │   ├── bim.types.ts              # ⭐ NEW
│   │   └── api.types.ts
│   │
│   └── utils/
│       ├── math.ts
│       ├── units.ts
│       ├── colors.ts
│       └── id.ts
│
├── server/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── projects.ts
│   │   │   ├── templates.ts
│   │   │   ├── assets.ts             # ⭐ NEW
│   │   │   ├── ai.ts                 # ⭐ NEW — AI provider proxy
│   │   │   └── users.ts
│   │   └── middleware/
│   │       ├── auth.ts
│   │       └── rateLimiter.ts
│   ├── models/
│   │   ├── Project.ts
│   │   ├── Template.ts
│   │   ├── Asset.ts                  # ⭐ NEW
│   │   └── User.ts
│   ├── services/
│   │   ├── CollaborationService.ts
│   │   ├── ExportService.ts          # Server-side heavy exports (IFC, PDF)
│   │   ├── AIProxyService.ts         # ⭐ NEW — Secure AI API key proxy
│   │   └── StorageService.ts
│   └── index.ts
│
└── shared/
    ├── constants.ts
    ├── validators.ts
    └── crdt/
```

---

## 2. Layer Map & Dependency Rules

```
┌──────────────────────────────────────────────────────────┐
│                        server/                            │
│              (Express, Socket.io, MongoDB)                │
└─────────────────────────┬────────────────────────────────┘
                          │ HTTP / WebSocket
┌─────────────────────────▼────────────────────────────────┐
│                       services/                           │
│            (API clients, RealtimeClient, Storage)         │
└──────┬──────────────────────────────────────┬────────────┘
       │                                      │
┌──────▼──────────┐                ┌──────────▼───────────┐
│    store/        │                │       exports/        │
│  (Zustand slices)│                │  (Export pipeline)    │
└──────┬──────────┘                └──────────────────────-┘
       │
┌──────▼──────────────────────────────────────────────────┐
│                      hooks/                              │
│  (React bridge: useSnap, useMeasure, useAI, useCommand)  │
└──────┬──────────────────────────────────────────────────┘
       │
┌──────▼────────────────────────────────────────────────┐
│                   features/   ui/   ai/                │
│       (React UI components, AI panel, canvas UI)       │
└──────┬────────────────────────────────────────────────┘
       │  reads only
┌──────▼────────────────────────────────────────────────┐
│                    engines/                            │
│       (Konva 2D adapter, React Three Fiber 3D)         │
└──────┬────────────────────────────────────────────────┘
       │  reads only
┌──────▼────────────────────────────────────────────────┐
│                      core/                             │
│  geometry │ elements │ measurements │ snapping         │
│  constraints │ scene │ history │ bim │ serialization   │
└──────┬────────────────────────────────────────────────┘
       │
┌──────▼────────────────────────────────────────────────┐
│               types/  │  utils/  │  shared/            │
│            (Zero logic, pure definitions)               │
└───────────────────────────────────────────────────────┘
```

### Hard Dependency Rules

| Rule | Rationale |
|---|---|
| `core/` MUST NOT import from `engines/`, `store/`, `features/`, `ai/`, or any React API | Core is the testable domain layer. Framework-agnostic by design. |
| `engines/` MUST NOT import from `store/` or `features/` | Engines are stateless adapters. They receive data; they do not subscribe to it. |
| `ai/` MUST NOT import from `core/` geometry engine | AI generators produce structured JSON. The CommandBus translates that JSON into domain commands. AI never writes to the SceneGraph directly. |
| `exports/` MUST NOT import from `store/` | Exporters receive a serialized snapshot passed to them. They are pure data transformers. |
| `features/` MUST NOT import directly from `engines/` | Features use the active engine only through `useEngine()` hook. |
| `store/` MUST NOT mutate `SceneGraph` directly | All mutations go through `CommandBus`. Stores are observers. |
| `templates/` (data directory) MUST NOT contain TypeScript | Template data is JSON only. Logic lives in `core/templates/TemplateRegistry.ts`. |
| `assets/` (data directory) contains only static files | Runtime querying via `assetApi.ts`. No business logic in the asset directory. |
| `shared/` MUST NOT import from any `src/` subdirectory | Shared code must be isomorphic (browser + Node.js). |

---

## 3. Module-by-Module Architecture Review

---

### 3.1 `core/geometry/`

**Responsibility**: The foundational math layer. Defines immutable geometric primitives and pure operations over them. Handles spatial topology: room face detection, wall intersection, polygon Boolean operations.

**Boundaries**:
- Knows about: `types/geometry.types.ts`, `utils/math.ts`
- Does NOT know about: elements, rendering, React, Zustand, AI

**Key Sub-modules**:
- `primitives/` — Immutable value objects. Every other module builds on these.
- `operations/` — Pure functions. Input primitives → output primitives. No side effects.
- `graph/` — `FaceDetector` runs after every wall mutation and surfaces closed polygon regions as room candidates. This is the algorithm that makes rooms emerge from walls.

**Why it exists**: Centralizing geometry math prevents logic duplication across engine renderers. Both 2D and 3D engines call the same operations. The Web Worker can also run this layer without any changes.

---

### 3.2 `core/elements/`

**Responsibility**: Defines the canonical data shape of every architectural object in the system. These are TypeScript interfaces/value objects — not classes with behaviour.

**Boundaries**:
- Imports from: `types/element.types.ts`, `core/geometry/primitives/`
- Does NOT know about: rendering, measurements, AI

**Key Design Decision**: Elements store only the minimum data needed to define their geometry. Derived data (area, perimeter, adjacency) is computed on demand by `core/measurements/` and `core/geometry/graph/`. This prevents stale cached values.

**Hosted Element Pattern**: `Door` and `Window` carry a `hostWallId` field. The CommandBus validator rejects any command that attempts to place a door or window without a valid host wall. This mirrors IFC conventions and makes BIM export structurally sound.

---

### 3.3 `core/measurements/` ⭐ NEW

**Responsibility**: A dedicated pure-math engine for all spatial measurement operations. Completely decoupled from rendering and UI.

**Boundaries**:
- Imports from: `core/geometry/primitives/`, `core/elements/`, `types/measurement.types.ts`
- Does NOT know about: Konva, Three.js, React, Zustand

**Sub-module Breakdown**:

| File | Responsibility |
|---|---|
| `AreaCalculator.ts` | Shoelace formula over room polygon vertices. Handles non-convex polygons. |
| `PerimeterCalculator.ts` | Sum of wall segment lengths for a given room boundary. |
| `WallLengthCalculator.ts` | Individual wall segment length, accounting for openings (doors/windows subtract from net length). |
| `RoomMetrics.ts` | Aggregates area, perimeter, program type label, occupancy estimate for a single room. |
| `UnitConverter.ts` | Metric ↔ Imperial conversion table. Single source of truth for all unit formatting across the application. |

**Future Quantity Takeoffs**: When a QTO feature is added, it will consume `RoomMetrics` and `WallLengthCalculator` directly. No architectural change required.

**Why separated from `core/geometry/`**: Geometry deals with *shape math* (intersections, offsets, topology). Measurements deal with *architectural meaning* (area in m², wall net length in mm). Different concerns, different vocabularies.

---

### 3.4 `core/snapping/` ⭐ NEW

**Responsibility**: A rendering-engine-independent snap resolution system. Given a raw cursor position and the current scene state, returns the snapped candidate point and snap type.

**Boundaries**:
- Imports from: `core/geometry/primitives/`, `core/elements/`, `types/snap.types.ts`
- Does NOT know about: Konva, Three.js, React, DOM events

**Sub-module Breakdown**:

| File | Responsibility |
|---|---|
| `GridSnap.ts` | Rounds input point to nearest grid vertex. Configurable grid size. |
| `WallSnap.ts` | Finds nearest wall endpoint or midpoint within snap radius. |
| `AngleSnap.ts` | Constrains drawn angle to 0°, 45°, 90°, 135° increments when near-threshold. |
| `GuideSnap.ts` | Snaps to user-placed guide lines and their intersections. |
| `IntersectionSnap.ts` | Detects and snaps to wall-wall and guide-wall intersections. |
| `SnapManager.ts` | Priority-ordered snap resolver. Runs all snap candidates and returns the highest-priority valid snap. |

**Integration**: The `DrawTool` in `engines/engine2d/interactions/` calls `SnapManager.resolve(rawPoint, sceneGraph, snapSettings)` on every mouse move. The `useSnap` hook exposes snap settings from `useSnapStore` to the interaction layer.

**Why engine-independent**: Snap logic is pure math. Moving it into core means it can be unit-tested without a canvas, can be reused by a future CLI or server-side export, and is not duplicated between 2D and 3D interaction handlers.

---

### 3.5 `core/constraints/` ⭐ NEW

**Responsibility**: A constraint network that maintains geometric relationships between scene elements. After any mutation, the solver propagates changes through the constraint graph to keep related elements consistent.

**Boundaries**:
- Imports from: `core/geometry/primitives/`, `core/elements/`
- Does NOT know about: rendering, React, Zustand, AI

**Sub-module Breakdown**:

| File | Responsibility |
|---|---|
| `Constraint.ts` | Abstract base interface: `solve(nodes): Mutation[]` |
| `ParallelConstraint.ts` | Keeps two wall segments parallel when either is moved. |
| `PerpendicularConstraint.ts` | Maintains 90° relationship between connected walls. |
| `EqualLengthConstraint.ts` | Locks two segments to the same length. |
| `AlignmentConstraint.ts` | Keeps a set of elements aligned to a common axis. |
| `ConstraintSolver.ts` | Iterative solver. Runs constraint graph after each CommandBus mutation. Emits a `ScenePatch` of derived changes. |

**Solver Flow**:
```
CommandBus.dispatch(MoveWallCommand)
    → SceneGraph updates directly affected node
    → ConstraintSolver.solve(affectedNodeId)
    → Propagates changes to constrained neighbours
    → ScenePatch emitted back to SceneGraph
    → Engines re-render with fully consistent geometry
```

**Why it exists**: Without a constraint solver, moving one wall breaks adjacency with connected walls. Users would have to manually fix every connected joint. The solver makes the scene self-healing.

**Relationship to Snapping**: Snapping prevents bad input from being dispatched. Constraints fix the geometry after dispatch. They are complementary, not overlapping.

---

### 3.6 `core/scene/`

**Responsibility**: Maintains the authoritative in-memory tree of all scene nodes: walls, rooms, doors, windows, slabs, furniture, etc. The single source of truth for what exists in the model at any moment.

**Boundaries**:
- Imports from: `core/geometry/`, `core/elements/`, `core/constraints/`
- Does NOT know about: rendering engines, Zustand, React

**Key Design**: `SceneGraph` is a mutable class instance, not an immutable Redux-style atom. This is intentional — during complex operations (dragging with constraints active), the graph may go through 10+ intermediate states before settling. Making each intermediate state a new Zustand state would cause 10+ re-renders. Instead, the graph emits a single `settled` event, and Zustand reacts once.

---

### 3.7 `core/history/`

**Responsibility**: Implements the Command pattern for all scene mutations. Every change to the SceneGraph is represented as a reversible `Command` object. The `CommandBus` is the only legal write path into the SceneGraph.

**Boundaries**:
- Imports from: `core/scene/`, `core/elements/`, `core/geometry/`
- Does NOT know about: React, Zustand, engines

**Command Lifecycle**:
```
Command object created (factories in features/ or ai/)
    → CommandBus validates command
    → CommandBus executes command (mutates SceneGraph)
    → CommandBus pushes to undo stack
    → SceneGraph emits change
    → Zustand store notified
    → CRDT op encoded for collaboration sync
```

**BatchCommand**: Multiple commands can be wrapped in a `BatchCommand` so that template insertion (which places 50+ nodes) is a single undoable step.

---

### 3.8 `core/bim/` ⭐ NEW

**Responsibility**: A metadata preparation layer that enriches architectural elements with BIM-ready properties. Does not implement BIM export yet — it establishes the data schema that a future IFC exporter will consume.

**Boundaries**:
- Imports from: `core/elements/`, `types/bim.types.ts`
- Does NOT know about: rendering, AI, exports

**Sub-module Breakdown**:

| File | Responsibility |
|---|---|
| `ElementMetadata.ts` | Structural type, fire rating, acoustic rating, thermal properties per element. |
| `MaterialMetadata.ts` | Material name, density, cost per unit, sustainability rating, finish type. |
| `BuildingMetadata.ts` | Building name, address, gross floor area, number of floors, occupancy class. |
| `SpaceMetadata.ts` | Program type (bedroom, office, lobby), occupancy load, HVAC zone, fire compartment. |

**Why it exists now**: BIM metadata must be designed in advance. Retrofitting BIM fields onto existing element models after implementation is highly disruptive. Establishing the schema now costs nothing and prevents a painful future migration.

**IFC Alignment**: Field names intentionally mirror IFC4 property set conventions so future IFC export is a mapping exercise, not a redesign.

---

### 3.9 `core/templates/`

**Responsibility**: Registry and runtime logic for the template system. Knows how to load, validate, search, and instantiate templates. Works with the `templates/` data directory but never imports from it directly — templates are loaded via the API or bundled JSON.

**Boundaries**:
- Imports from: `core/elements/`, `core/scene/`, `core/history/`, `types/`
- Does NOT know about: React, engines, AI

**Template Instantiation Flow**:
```
User selects template → TemplateRegistry.instantiate(id, origin)
    → Returns BatchCommand[]
    → CommandBus.dispatch(BatchCommand)
    → All template nodes appear in SceneGraph in one undoable step
```

---

### 3.10 `core/serialization/`

**Responsibility**: Converts the in-memory `SceneGraph` to a versioned JSON document (for MongoDB and export) and reconstructs it on load.

**Boundaries**:
- Imports from: `core/scene/`, `core/elements/`, `core/bim/`
- Does NOT know about: React, engines, AI

**Schema Versioning**: Each saved project carries a `schemaVersion` field. On load, `ProjectDeserializer` runs the appropriate migration chain from `schema/migrations/` before reconstructing the graph. This means old saved projects always open correctly.

---

### 3.11 `engines/`

**Responsibility**: Rendering adapters that translate the SceneGraph into visual output. Each engine implements the shared `IRenderEngine` interface and operates as a stateless renderer.

**`IRenderEngine` Contract**: Both engines implement `mount`, `unmount`, `syncScene`, `applyPatch`, `hitTest`, and `dispose`. This makes the canvas switcher trivial — unmount engine A, mount engine B, call `syncScene`.

**`engine2d/` (Konva.js)**:
- Renders floor plan linework, annotations, room fills, dimension strings
- Hosts all drawing interaction tools: `DrawTool`, `SelectTool`, `PanZoomTool`
- Calls `SnapManager.resolve()` on every mouse-move event to feed snapped coordinates to drawing tools
- Translates Konva mouse events → Commands → CommandBus

**`engine3d/` (React Three Fiber)**:
- Reads the same SceneGraph
- Extrudes 2D wall polygons into 3D meshes using element `height` property
- Applies PBR materials from `assets/materials/`
- Hosts camera rigs (orbit, walkthrough)
- Does NOT host drawing tools — all drawing happens in 2D

**Boundary Rule**: Engines are consumers, never producers, of scene data. They call `engine.applyPatch(patch)` to receive incremental updates rather than re-syncing the full scene on every change.

---

### 3.12 `store/`

**Responsibility**: Zustand state slices that expose reactive, UI-ready views of core domain state.

**New Stores**:

| Store | Owns |
|---|---|
| `useMeasurementStore` | Active measurement display mode (auto/manual), annotation visibility, unit preference (metric/imperial) |
| `useSnapStore` | Snap enabled/disabled per type, snap radius, grid size, guide list |
| `useAIStore` | Active generation task, progress state, last AI result, error state |

**Architecture Rule**: No Zustand store contains geometry data or runs geometry calculations. Stores hold references and UI state only. Heavy computation lives in `core/` and is invoked via hooks.

---

### 3.13 `hooks/`

**Responsibility**: React-specific bridge layer connecting Zustand stores and core services to UI components.

**New Hooks**:

| Hook | Bridges |
|---|---|
| `useMeasure` | `useSceneStore` + `core/measurements/` → room area and wall lengths as reactive values |
| `useConstraints` | `useSceneStore` + `core/constraints/` → exposes solver trigger and constraint list |
| `useAI` | `useAIStore` + `services/api/aiApi.ts` → generation dispatch, polling, result injection |

---

### 3.14 `features/canvas/`

**Responsibility**: Hosts the active rendering engine inside a React component. Manages the engine lifecycle and forwards scene patches to it.

**Does NOT**: Run geometry, manipulate the scene, or contain business logic.

**`CanvasOverlay`**: A transparent DOM layer on top of the Konva canvas that renders: ruler tick marks, snap indicators, dimension annotations, smart guide lines. These are DOM elements, not Konva shapes — they update without triggering canvas re-renders.

---

### 3.15 `features/roofs/` ⭐ NEW

**Responsibility**: Roof type domain models and a generator that computes roof geometry from a room footprint. Lives in `features/` not `core/` because roof geometry is non-trivial and evolves separately from core wall logic.

**Boundaries**:
- Imports from: `core/geometry/`, `core/elements/`
- Does NOT import from: engines, store (roof data is passed into engines by the scene graph)

**Sub-module Breakdown**:

| File | Responsibility |
|---|---|
| `GableRoof.ts` | Defines gable ridge geometry from a rectangular footprint. |
| `HipRoof.ts` | Computes hip roof planes from a polygon footprint. |
| `FlatRoof.ts` | Offset the perimeter and extrude minimal height. |
| `ShedRoof.ts` | Single-plane roof with configurable pitch direction. |
| `RoofGenerator.ts` | Strategy pattern. Selects the correct roof type from element properties and generates the roof `SceneNode`. |

**3D Only**: Roof geometry is meaningful only in 3D. The 2D engine renders roofs as a simple outline at the eave line.

---

### 3.16 `features/terrain/` ⭐ NEW

**Responsibility**: Site modeling — topographic surfaces, roads, and slope visualization. A future feature module that does not affect core wall/room logic.

**Boundaries**:
- Imports from: `core/geometry/`, `engines/engine3d/`
- Does NOT affect: `core/elements/`, `core/history/` (terrain is a separate scene layer)

**Sub-module Breakdown**:

| File | Responsibility |
|---|---|
| `TerrainSurface.ts` | Height-map grid representation. Controls mesh resolution. |
| `TerrainEditor.ts` | Sculpting operations: raise, lower, smooth, flatten. |
| `RoadGenerator.ts` | Procedural road mesh from a path spline. |
| `SlopeGenerator.ts` | Calculates slope angles and highlights steep areas. |
| `TerrainRenderer.ts` | Three.js mesh builder specifically for terrain — uses subdivision geometry, not standard prism extrusion. |

**Isolation**: Terrain operates on a separate `SceneGraph` layer. Building elements and terrain elements do not share the same node hierarchy. This prevents terrain edits from triggering building constraint propagation.

---

### 3.17 `features/` (remaining)

| Feature | Responsibility |
|---|---|
| `toolbar/` | Left tool palette. Reads `useToolStore`. Dispatches tool changes. No geometry logic. |
| `properties/` | Right inspector panel. Reads selected element from `useSelectionStore`. Dispatches property-change Commands. |
| `layers/` | Layer visibility and lock state. Purely UI driven from `useSceneStore.layers`. |
| `collaboration/` | Presence awareness UI. Reads `useCollaborationStore`. Renders remote cursors and user avatars. |
| `export/` | Export dialog. Calls `ExportManager` from `exports/`. Shows progress. Does not know about file formats. |
| `ai/` (UI) | Prompt input, generation preview, one-click "insert to canvas" button. Reads `useAIStore`. |

---

### 3.18 `templates/` ⭐ EXPANDED

**Responsibility**: Static data directory containing template definitions as JSON files. This is not code — it is content.

**Structure**:
- Templates are organized into five categories: `residential/`, `commercial/`, `public/`, `interiors/`
- Each template JSON file contains: element definitions (relative coordinates), category, tags, version, thumbnail URL, and required minimum room dimensions
- `metadata/index.json` is a pre-built search index over all templates, enabling fast client-side fuzzy search

**Template JSON Schema** (conceptual, not code):
```
{
  id, name, version, category, tags,
  thumbnail, minWidth, minHeight,
  nodes: [{ type, relativePosition, properties }],
  author: "system" | userId
}
```

**User Templates**: User-created templates are stored in MongoDB, fetched via `templateApi.ts`, and merged into the registry at runtime. They follow the same schema as built-in templates.

**Versioning**: Templates carry a `version` field. When the element schema changes, a migration script upgrades all template JSON files in bulk.

**Why `src/templates/` not `public/templates/`**: Templates that ship with the app are bundled at build time. `public/` is for runtime-loaded assets. Bundled templates are tree-shaken — only categories the user has permission to access are included.

---

### 3.19 `ai/` ⭐ NEW

**Responsibility**: The AI generation system. Orchestrates calls to AI providers, builds structured prompts, parses AI responses into validated JSON, and converts that JSON into CommandBus commands.

**Boundaries**:
- `generators/` and `orchestration/` import from: `core/history/commands/`, `types/ai.types.ts`
- `providers/` call external AI APIs via `services/api/aiApi.ts` — never directly from the browser
- Does NOT directly mutate `SceneGraph`

**Architecture Decision — AI Never Touches the Scene Directly**:
```
AI Response (JSON) → ResponseParser → validated FloorPlanSchema
    → Generator converts schema to Command[]
    → CommandBus.dispatch(BatchCommand)
    → SceneGraph updated via standard write path
    → Full undo support: user can Ctrl+Z the entire AI generation
```

This means AI-generated content is indistinguishable from hand-drawn content in the undo stack, the collaboration protocol, and the export pipeline.

**Provider Abstraction**:
All AI calls go through `AIProvider` interface. Switching from OpenAI to Gemini requires only changing the active provider — no generator or orchestration code changes. Provider selection is a user/project-level setting stored in the database.

**Server Proxy (Critical Security Decision)**:
AI API keys are NEVER exposed to the browser. All AI calls route through `server/api/routes/ai.ts` → `server/services/AIProxyService.ts`. The server holds API keys in environment variables. The client sends a structured request; the server calls the AI provider and returns the response.

**Sub-module Breakdown**:

| Directory | Responsibility |
|---|---|
| `generators/floorplans/` | Type-specific floor plan generators. Each knows the spatial rules for that building type (e.g., duplex must have two mirrored units). |
| `generators/elevations/` | Generates elevation drawings from 3D scene data. Orthographic projection logic. |
| `generators/furniture/` | Furniture arrangement suggestions for a given room polygon and program type. |
| `prompts/` | Prompt template files (`.txt` or `.md`). Loaded by `PromptBuilder`, not hardcoded. Allows prompt updates without code deploys. |
| `schemas/` | Zod-validated shapes for all AI output types. If the AI returns invalid JSON, `ResponseParser` rejects it and retries. |
| `orchestration/` | `AITaskRunner` manages async generation with progress callbacks. `PromptBuilder` combines base prompt + user inputs + site constraints. `ResponseParser` validates and normalises AI output. |

---

### 3.20 `assets/` ⭐ NEW

**Responsibility**: Static asset library for furniture, materials, architectural components, and landscaping elements. Pure data — no logic.

**Boundaries**:
- Contains only static files: GLTF/GLB models, PNG thumbnails, JSON metadata
- Business logic (search, category filtering, insertion) lives in `services/api/assetApi.ts` and `core/templates/TemplateRegistry.ts`
- Runtime queried via search index in `metadata/index.json`

**Asset JSON Schema** (conceptual):
```
{
  id, name, category, tags,
  thumbnail, modelUrl, dimensions,
  polygonCount, license, version
}
```

**Categories**:
- `furniture/` — 3D models for chairs, tables, beds, storage units
- `materials/` — PBR texture sets (albedo, normal, roughness, metallic)
- `doors/` — Parametric door families (single, double, sliding, bi-fold)
- `windows/` — Parametric window families (casement, sliding, fixed)
- `roofs/` — Roof tile and roofing material textures
- `stairs/` — Stair type geometries (straight, spiral, L-shaped)
- `landscaping/` — Trees, shrubs, ground cover, paving textures

**Future Asset Marketplace**: The schema already carries a `license` field. A marketplace would add `authorId`, `price`, and `downloadCount` to the metadata and expose them through a new API route. No architectural change required.

---

### 3.21 `exports/` ⭐ NEW

**Responsibility**: A unified, pluggable export pipeline. Each format is an independent adapter. `ExportManager` orchestrates the pipeline: takes a scene snapshot, routes it to the correct adapter, and returns a file blob.

**Boundaries**:
- Imports from: `core/serialization/`, `core/measurements/`, `types/export.types.ts`
- Does NOT import from: `store/`, `engines/`, React
- Exporters receive a serialized `ProjectSnapshot`, not a live `SceneGraph`

**Why a Snapshot?**: Exporters are pure data transformers. Giving them a snapshot instead of the live scene means exports are reproducible, cacheable, and can run in a Web Worker or on the server without state concerns.

**Format Adapter Breakdown**:

| Format | Engine Used | Context |
|---|---|---|
| `PDFExporter` | jsPDF or Puppeteer (server) | Print-ready floor plan drawings with title blocks |
| `PNGExporter` | Canvas `toDataURL()` | Quick visual export of current view |
| `SVGExporter` | Custom path serializer | Scalable line drawings for CAD import |
| `OBJExporter` | Three.js `OBJExporter` | Interchange with Blender, Maya, etc. |
| `GLBExporter` | Three.js `GLTFExporter` | Web-ready 3D format, AR/VR pipelines |
| `FBXExporter` | Server-side (FBX SDK) | Interop with Autodesk products |
| `STLExporter` | Three.js `STLExporter` | 3D printing |

**`SheetGenerator`**: Composes multiple floor plan views, elevations, title block, and scale bar into a single print sheet layout. Output is handed to `PDFExporter`.

**Heavy Exports (FBX, IFC) on the Server**: FBX and future IFC exports require native SDKs not available in the browser. These route through `server/services/ExportService.ts`. The client submits an export job and polls for completion.

---

### 3.22 `services/`

**Responsibility**: All external I/O. The only layer that makes network requests or writes to persistent storage.

**Sub-modules**:
- `api/` — Typed fetch wrappers for every REST endpoint. No business logic — just HTTP.
- `realtime/` — WebSocket connection management and CRDT operation encoding/decoding.
- `storage/` — IndexedDB auto-save. Stores the serialized project snapshot every 30 seconds as an offline fallback.

**New additions**:
- `api/assetApi.ts` — Paginated asset search, download, and metadata fetch.
- `api/aiApi.ts` — Sends generation requests to the server AI proxy. Handles streaming responses if the provider supports it.

---

### 3.23 `ui/`

**Responsibility**: The design system. Purely visual, purely dumb. Components here have zero knowledge of architectural domain objects.

**Boundary Rule**: A `ui/` component must be replaceable with a third-party component library equivalent without breaking any feature.

---

### 3.24 `types/`

**Responsibility**: All shared TypeScript interface definitions. No implementations, no runtime code.

**Rule**: Every module that needs to share data shapes imports from `types/`. Types never import from domain modules — this would create circular dependencies.

**New type files**: `measurement.types.ts`, `snap.types.ts`, `ai.types.ts`, `asset.types.ts`, `export.types.ts`, `bim.types.ts`.

---

### 3.25 `utils/`

**Responsibility**: Stateless, pure helper functions that do not belong to any specific domain module.

`units.ts` is the single source of truth for all unit conversions. It is called by `core/measurements/UnitConverter.ts`, not duplicated.

---

### 3.26 `shared/`

**Responsibility**: Isomorphic code that runs identically in both the browser and Node.js. Must contain zero browser APIs, zero Node.js APIs.

**Contents**: Shared constants, Zod validators for API request/response shapes, and CRDT operation type definitions.

---

### 3.27 `server/`

**Responsibility**: A thin persistence and relay layer. Does not contain business logic that belongs in `core/`.

**New additions**:
- `api/routes/ai.ts` — Receives AI generation requests. Calls `AIProxyService`. Returns parsed results.
- `api/routes/assets.ts` — Asset metadata search and CDN URL generation.
- `models/Asset.ts` — Mongoose schema for user-uploaded and marketplace assets.
- `services/AIProxyService.ts` — Holds API keys in environment variables. Makes calls to OpenAI/Anthropic/Gemini. Rate-limits per user.

**Socket.io rooms**: Each project has a Socket.io room. When a client dispatches a CRDT operation, the server broadcasts it to all other room members. The server does not interpret or merge the CRDT ops — this is the client's job.

---

## 4. Data Flow Architecture

### Primary Write Path (User Gesture → Scene → Render)

```
User gesture (click, drag, keyboard)
    │
    ▼
Engine Interaction Handler (engine2d/interactions/ or engine3d/)
    │  Raw coords → SnapManager.resolve() → snapped point
    ▼
Command Factory
    │  Snapped point + user intent → immutable Command object
    ▼
CommandBus.validate(command)
    │  Rejects hosted element without host, rejects out-of-bounds, etc.
    ▼
CommandBus.execute(command)
    │  Mutates SceneGraph (direct field assignment, no copy)
    ▼
ConstraintSolver.solve(affectedNodeId)
    │  Propagates constraint changes, emits ScenePatch
    ▼
SceneGraph.emit('settled')
    │  Stable state reached
    ▼
useSceneStore subscriber fires
    │  Zustand notifies React of change
    ▼
Engine.applyPatch(patch)
    │  Konva or R3F redraws only changed shapes
    ▼
(Async branch) CRDTAdapter.encodeOp(command)
    │
    ▼
WebSocket → Server → broadcast to peers
    │
    ▼
Remote client: CRDTAdapter.merge(op) → SceneGraph update → render
```

### AI Generation Write Path

```
User types prompt in AIPanel → useAI.generate(prompt, type)
    │
    ▼
aiApi.generate(request) → Server AIProxyService → AI Provider API
    │  (streaming response if supported)
    ▼
ResponseParser.parse(rawResponse) → validated against FloorPlanSchema
    │  (retry on validation failure, up to 3 attempts)
    ▼
Generator.toCommands(validatedPlan) → BatchCommand[]
    │
    ▼
CommandBus.dispatch(BatchCommand)
    │  Identical to hand-drawn write path from here
    ▼
Full undo support, collaboration sync, serialization
```

### Export Path

```
User clicks Export → ExportPanel
    │
    ▼
ProjectSerializer.serialize(sceneGraph) → ProjectSnapshot (JSON)
    │
    ▼
ExportManager.export(snapshot, format, options)
    │
    ▼
Format Adapter (e.g., PDFExporter)
    │  Pure data transformation
    ▼
File blob → browser download or server-side job (for heavy formats)
```

---

## 5. State Management Architecture

### Slice Ownership (Updated)

| Store | Owns | Does Not Own |
|---|---|---|
| `useProjectStore` | Project name, floor list, schema version | Element geometry |
| `useSceneStore` | SceneGraph reference, layer list, node count | Rendering state |
| `useSelectionStore` | Selected node IDs, hover ID, selection box | Element data |
| `useToolStore` | Active tool enum, tool options, cursor mode | Canvas position |
| `useViewStore` | Viewport mode (2D/3D), zoom level, pan offset | Scene data |
| `useHistoryStore` | Undo stack depth, can-undo, can-redo booleans | Command data |
| `useCollaborationStore` | Peer list, remote cursor positions, conflict flags | Project content |
| `useMeasurementStore` | Unit system, display mode, annotation visibility | Geometry values |
| `useSnapStore` | Snap types enabled, snap radius, grid spacing, guide list | Snap candidates |
| `useAIStore` | Active task, progress %, last result, error message | Domain geometry |
| `useUIStore` | Panel open/closed, modal state, active sidebar tab | All domain data |

### Mutation Invariant

The system maintains one inviolable rule: **every scene mutation flows through `CommandBus.dispatch()`**. No Zustand `set()` call modifies the SceneGraph. This invariant ensures:
- Every change is undoable
- Every change is encoded as a CRDT operation for collaboration
- Every change is auditable in the undo stack
- AI-generated content behaves identically to user-drawn content

---

## 6. Scalability Recommendations

### Performance

| Concern | Solution |
|---|---|
| Constraint solving on large plans (500+ walls) | Offload `ConstraintSolver` to Web Worker. `core/constraints/` has no browser dependencies, so it runs unchanged in a Worker. |
| Room detection on mutation | Debounce `FaceDetector` — run at most 10× per second, not on every frame. |
| Large template libraries (1000+ templates) | Pre-built `metadata/index.json` search index. Load template data lazily on selection. |
| Asset library browsing | Virtualized list. Paginated API. CDN for thumbnails. |
| AI generation latency | Server-sent events (SSE) for streaming progress. Show partial results while generation continues. |
| 3D scene complexity | LOD (Level of Detail) for furniture assets. Instanced meshes for repeated elements (windows, doors). |
| PDF export of complex plans | Run in a Node.js worker process via server-side `ExportService`. Return a download URL. |

### Code Splitting

| Bundle Split | Rationale |
|---|---|
| `engine3d/` lazy-loaded | Not needed until user enters 3D view. Saves ~500KB initial bundle. |
| `ai/` lazy-loaded | Not needed until user opens AI panel. |
| `exports/` lazy-loaded | Not needed until user opens export dialog. |
| Template categories lazy-loaded | Load only the selected category's JSON files on demand. |

### Multi-Floor Projects

- Each floor is a separate `SceneGraph` instance managed by `useProjectStore.floors[]`
- Floors share the same `LayerRegistry` (can link layers across floors for structural columns)
- 3D engine stacks floor meshes with configurable floor-to-floor height

### Team Scale

- Zustand's `devtools` middleware in development for time-travel debugging
- CRDT document per project per session. Merged to MongoDB on session close.
- Per-user presence aware of which floor they are on (multi-floor collaboration support)

---

## 7. Future Roadmap Considerations

### Near-Term (Phase 2)

| Feature | Architectural impact |
|---|---|
| IFC export | Add `src/exports/ifc/IFCExporter.ts`. Consumes `core/bim/` metadata. No core changes. |
| Quantity Takeoff (QTO) | New `src/features/qto/` consuming `core/measurements/`. Adds `useQTOStore`. |
| Schedule sheets | New `src/features/schedules/`. Door, window, and room schedules from element metadata. |
| Structural grid | New `core/elements/StructuralGrid.ts`. Constraint integration with `ParallelConstraint`. |

### Mid-Term (Phase 3)

| Feature | Architectural impact |
|---|---|
| Asset marketplace | Extend `assets/metadata/` schema. New `server/models/MarketplaceAsset.ts`. Payment service integration in `server/services/`. |
| Custom AI fine-tuning | New `ai/training/` directory for fine-tuned model configuration. `AIProvider` interface accommodates custom endpoints. |
| Plugin/Extension API | New `src/plugins/` with a `PluginRegistry`. Plugins can register new tools, element types, and export formats via declared extension points. |
| AR/VR export | `exports/usdz/` for Apple AR Quick Look. Reuses the 3D scene graph. |

### Long-Term (Phase 4)

| Feature | Architectural impact |
|---|---|
| Full BIM (IFC round-trip) | Promote `core/bim/` to a full BIM engine. Add `core/bim/ifc/`. Structural analysis integration. |
| Parametric design | `core/parameters/` — parametric family system similar to Revit families. Elements become parametric instances. |
| Cloud rendering | Dedicated `server/services/RenderService.ts`. Submit 3D scene for photorealistic render, return image URL. |
| Native desktop app | `core/` is already Electron/Tauri-compatible. Add platform adapters in `services/storage/` for local file system access. |

### Architectural Flexibility Built In

The architecture is designed so that each of these roadmap items can be delivered as an additive change — new files and new modules — without requiring modifications to the core domain layer. This is the primary test of a well-designed system: new features are additions, not surgeries.

---

## 8. Summary: Architectural Principles

| Principle | Expression in BuildFlow |
|---|---|
| **Separation of Concerns** | geometry ≠ measurement ≠ snapping ≠ constraints ≠ rendering |
| **Dependency Inversion** | Engines and UI depend on `core/`, never the reverse |
| **Single Write Path** | All mutations → `CommandBus` → `SceneGraph` |
| **Domain Isolation** | `core/` has zero React, zero Konva, zero Three.js imports |
| **Adapter Pattern** | `IRenderEngine` decouples scene from renderer |
| **Command Pattern** | Every user action is a reversible, serializable Command |
| **Schema-First BIM** | BIM metadata designed now, implemented later |
| **Derived State** | Rooms, areas, adjacency are computed — never stored |
| **Security by Default** | AI API keys never reach the browser |
| **Additive Roadmap** | New features are new modules, not modifications to core |
```
