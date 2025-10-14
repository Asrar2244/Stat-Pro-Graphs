# Scatter Plot Feature

## 📁 Directory Structure

```
ScatterPlot/
├── 📂 components/              # UI Components
│   ├── DataFormatSection.tsx          (124 lines)
│   ├── ErrorBarsConfiguration.tsx     (193 lines)
│   ├── Header.tsx                     (30 lines)
│   ├── ProjectAndType.tsx             (66 lines)
│   └── VariableSelection.tsx          (409 lines)
│
├── 📂 hooks/                   # Custom React Hooks
│   ├── index.ts                       (7 lines)
│   ├── useAvailableFormats.ts         (33 lines)
│   ├── useProjectVariables.ts         (72 lines)
│   └── useVariableManagement.ts       (256 lines)
│
├── 📂 utils/                   # Utility Functions
│   ├── index.ts                       (6 lines)
│   ├── dataFormatHelpers.ts           (110 lines)
│   └── formatRequirements.ts          (162 lines)
│
├── 📂 styles-hook/             # Style Hooks
│   └── use-scatter-plot-styles.ts     (208 lines)
│
├── 📄 constants.ts                    (241 lines)
├── 📄 index.ts                        (3 lines)
├── 📄 ScatterPlotForm.tsx             (291 lines)
├── 📄 ScatterPlotModal.tsx            (138 lines)
├── 📄 scatterPlotSlice.ts             (221 lines)
└── 📄 VariableList.tsx                (146 lines)
```

## 🏗️ Architecture

### **Components** (`/components`)
UI components with minimal logic, focused on rendering.

- `Header.tsx` - Header section with title and icon
- `ProjectAndType.tsx` - Project and plot type selection
- `DataFormatSection.tsx` - Data format dropdown with descriptions
- `ErrorBarsConfiguration.tsx` - Error bars configuration UI
- `VariableSelection.tsx` - Variable assignment interface

### **Hooks** (`/hooks`)
Custom React hooks encapsulating business logic and state management.

#### `useProjectVariables(selectedProject)`
- Loads variables from project database
- Manages loading and error states
- Returns: `{ variables, isLoading, error }`

#### `useVariableManagement(dataFormat)`
- Manages all variable lists (Available, X, Y, ErrorBar, Category)
- Handles send/remove operations
- Maintains selection states
- Returns: All lists, handlers, and validation flags

#### `useAvailableFormats(subType, symbolValue)`
- Determines available data formats
- Based on subtype and symbol value
- Returns: Array of valid data formats

### **Utils** (`/utils`)
Pure utility functions with no side effects.

#### `dataFormatHelpers.ts`
- `getDataFormatsBySymbolValue()` - Maps symbol values to formats
- `isErrorBarSubType()` - Checks if subtype requires error bars
- `needsErrorBarsConfiguration()` - Checks if config needed
- `getPlotTypeFlags()` - Determines plot characteristics
- `isAsymmetricErrorBar()` - Checks for asymmetric types

#### `formatRequirements.ts`
- `requiresX()` - Checks if X variables required
- `requiresY()` - Checks if Y variables required
- `requiresCategory()` - Checks if category required
- `getMaxXCount()` - Returns max X variable limit
- `getMaxYCount()` - Returns max Y variable limit
- `canSendToX()` - Validates X variable addition
- `canSendToY()` - Validates Y variable addition

### **Core Files**

#### `ScatterPlotForm.tsx`
Main form component that orchestrates all other components and hooks.

#### `ScatterPlotModal.tsx`
Modal wrapper for the scatter plot configuration form.

#### `scatterPlotSlice.ts`
Zustand store for scatter plot state management.

#### `VariableList.tsx`
Reusable component for rendering variable lists with checkboxes.

#### `constants.ts`
Constants, types, and mappings for scatter plots.

## 🎯 Design Principles

### Single Responsibility
Each file has one clear purpose:
- Components → UI rendering
- Hooks → Business logic
- Utils → Pure functions
- Store → State management

### Separation of Concerns
```
UI Layer (Components) 
    ↓
Business Logic (Hooks)
    ↓
Pure Functions (Utils)
    ↓
State Management (Store)
```

### Code Reusability
- Custom hooks can be reused across components
- Utils are pure functions (no side effects)
- Components are composable

## 📝 Usage Example

```typescript
import { ScatterPlotModal } from '@features/graphs/ScatterPlot';

// In your component
<ScatterPlotModal
  projects={projects}
  datasets={datasets}
  onCreateGraph={handleCreateGraph}
  {...modalProps}
/>
```

## 🧪 Testing

### Hooks
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useProjectVariables } from './hooks';

test('loads project variables', async () => {
  const { result, waitFor } = renderHook(() => 
    useProjectVariables('MyProject')
  );
  
  await waitFor(() => expect(result.current.isLoading).toBe(false));
  expect(result.current.variables).toHaveLength(5);
});
```

### Utils
```typescript
import { requiresX, canSendToX } from './utils';

test('requiresX returns true for XY Pair format', () => {
  expect(requiresX('XY Pair')).toBe(true);
});

test('canSendToX validates correctly', () => {
  expect(canSendToX(2, 0, 'X Many Y')).toBe(true);
  expect(canSendToX(2, 1, 'X Many Y')).toBe(false);
});
```

## 📊 Metrics

- **Total Files:** 19
- **Total Lines:** 2,716
- **Largest File:** 409 lines (VariableSelection.tsx)
- **Average File Size:** 143 lines
- **Custom Hooks:** 3
- **Utility Functions:** 8+
- **Components:** 5
- **Linter Errors:** 0 ✅

## 🚀 Performance

- **Optimized with:**
  - `useMemo` for expensive calculations
  - `useCallback` for stable function references
  - Proper dependency arrays
  - Efficient state updates

## 🔄 State Flow

```
User Action
    ↓
Component Event Handler
    ↓
Hook Handler (useVariableManagement)
    ↓
State Update (useState)
    ↓
Store Update (Zustand)
    ↓
UI Re-render
```

## 📚 Documentation

All files include:
- ✅ JSDoc comments
- ✅ Type definitions
- ✅ Parameter documentation
- ✅ Return value descriptions

## 🛠️ Maintenance

### Adding a New Data Format
1. Add to `DataFormat` type in `scatterPlotSlice.ts`
2. Update `DATA_FORMATS` in `constants.ts`
3. Add mapping in `SUB_TYPE_DATA_FORMATS`
4. Update helper functions in `utils/` if needed
5. Update descriptions in `DataFormatSection.tsx`

### Adding a New Subtype
1. Add to `ScatterSubType` type in `scatterPlotSlice.ts`
2. Update `SUB_TYPES` in `constants.ts`
3. Add data format mapping in `SUB_TYPE_DATA_FORMATS`
4. Update helper functions in `utils/dataFormatHelpers.ts`

## ✨ Best Practices

1. **Import from barrel exports:**
   ```typescript
   // ✅ Good
   import { useProjectVariables, useVariableManagement } from './hooks';
   
   // ❌ Avoid
   import { useProjectVariables } from './hooks/useProjectVariables';
   ```

2. **Use TypeScript types:**
   ```typescript
   // ✅ Good
   const format: DataFormat = 'XY Pair';
   
   // ❌ Avoid
   const format = 'XY Pair';
   ```

3. **Keep components focused:**
   - Move logic to hooks
   - Keep render functions clean
   - Use utils for calculations

## 🎉 Result

A **professional**, **maintainable**, and **scalable** scatter plot feature following industry best practices!


