# TypeScript Error Report

## Summary
**Total Errors:** 367 errors across 52 files

## Main Error Categories

### 1. **IGraphRef Type Mismatch** (6 errors)
**Location:** `src/libs/graphs/index.tsx` (lines 27, 28, 30, 31, 56, 57)

**Problem:** Code is trying to access `.style` property on `plotly.current`, but `IGraphRef` is defined as a Plotly data structure, not a DOM element.

**Current Definition:**
```typescript
export interface IGraphRef {
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  // ... no 'style' property
}
```

**Fix Required:** The code should use `GraphCanvasRef` type which has `{ current: HTMLDivElement | null, plotly: any }` structure.

---

### 2. **Fluent UI Option Component** (34 errors)
**Locations:** Multiple files in `src/features/graphs/3d/mesh/components/MeshConfiguration.tsx`

**Problem:** `Option` component requires a `text` prop, but code is only providing `value` and `children`.

**Error Pattern:**
```
Property 'text' is missing in type '{ children: Element; value: string; }'
```

**Fix Required:** Add `text` prop to all `Option` components:
```tsx
<Option value="tab10" text="Tab10">
  {/* children */}
</Option>
```

---

### 3. **CSSProperties Type Errors** (8 errors)
**Locations:** 
- `src/features/graphs/3d/mesh/components/VariableSelection.tsx` (4 errors)
- `src/screens/top-menu/help/help-dropdown-panel.tsx` (2 errors)
- `src/screens/output-render/styles-hook/use-regressions-style.ts` (3 errors)

**Problem:** String values assigned to CSS properties that require specific types.

**Examples:**
- `flexDirection: string` should be `flexDirection: 'row' | 'column' | ...`
- `flexWrap: string` should be `flexWrap: 'nowrap' | 'wrap' | ...`
- `position: 'relative !important'` - `!important` not allowed in TypeScript CSSProperties

**Fix Required:** Use proper TypeScript types or cast to `as const`:
```typescript
flexDirection: 'row' as const,
flexWrap: 'nowrap' as const,
position: 'relative', // Remove !important, use CSS classes instead
```

---

### 4. **Fluent UI Badge Color** (1 error)
**Location:** `src/features/graphs/3d/VariableList.tsx:163`

**Problem:** Invalid color value `"neutral"` for Badge component.

**Valid Colors:** `'brand' | 'danger' | 'important' | 'informative' | 'severe' | 'subtle' | 'success' | 'warning'`

**Fix Required:** Change `"neutral"` to `"subtle"` or another valid color.

---

### 5. **Fluent UI Text Size** (1 error)
**Location:** `src/features/graphs/3d/VariableList.tsx:173`

**Problem:** `size="small"` is not valid. Text component expects numeric sizes.

**Valid Sizes:** `100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000`

**Fix Required:** Change `size="small"` to `size={200}` or `size={300}`.

---

### 6. **Missing Color Palette Tokens** (6 errors)
**Locations:**
- `src/features/graphs/shared/components/ValidationErrorModal.tsx` (4 errors)
- `src/screens/top-menu/advanced/tests/t-test/styles-hook/use-test-styles.ts` (2 errors)

**Problem:** Using non-existent token names:
- `colorPaletteBlueBorder2` → Should be `colorPaletteBlueBorder2` (if exists) or use alternative
- `colorPaletteBlueForeground1` → Should be `colorPaletteBlueForeground2` or alternative

**Fix Required:** Check available tokens and use correct names or alternatives.

---

### 7. **Modal Type Errors** (7 errors)
**Locations:** Multiple regression analysis files

**Problem:** Using `modalType="alert"` but valid types are `'modal' | 'non-modal'`.

**Files:**
- `src/screens/top-menu/analyze/regression/linear/backward-stepwise/backward-stepwise.tsx`
- `src/screens/top-menu/analyze/regression/linear/bayesian/bayesian.tsx`
- `src/screens/top-menu/analyze/regression/linear/best-subset/best-subset.tsx`
- `src/screens/top-menu/analyze/regression/linear/forward-stepwise/forward-stepwise.tsx`
- `src/screens/top-menu/analyze/regression/linear/multiple-linear/multiple-linear.tsx`
- `src/screens/top-menu/analyze/regression/linear/polynomial/polynomial.tsx`
- `src/screens/top-menu/analyze/regression/linear/stepwise/stepwise.tsx`

**Fix Required:** Change `modalType="alert"` to `modalType="non-modal"`.

---

### 8. **Missing Properties in Types** (Multiple errors)
**Locations:** Various files

**Examples:**
- `src/screens/top-menu/advanced/tests/t-test/model.tsx` - Missing `populationMean` property
- `src/screens/graphs-render/index.tsx` - Missing `originalColorScale` property
- `src/screens/top-menu/sample-size/use-save-sample-size.ts` - Missing `businessObjectPath` and `projectName`

**Fix Required:** Add missing properties to type definitions or provide default values.

---

### 9. **Test File Errors** (16 errors)
**Location:** `src/screens/top-menu/index.test.tsx`

**Problem:** Missing `toggleHelp` property in test mocks.

**Fix Required:** Add `toggleHelp: jest.fn()` to all test mock props.

---

### 10. **Backup Folder Errors** (Many errors)
**Location:** `src/screens/graphs-render-backup-20251020_090308/`

**Problem:** Old backup folder contains outdated code with type mismatches.

**Fix Required:** Either:
- Delete the backup folder (recommended if not needed)
- Or fix all errors in backup folder
- Or exclude from TypeScript compilation

---

### 11. **Missing Module Errors** (2 errors)
**Locations:**
- `src/screens/graphs-render/utils/scatter/scatterPlotProperties.ts:5`
- `src/screens/graphs-render-backup-20251020_090308/utils/scatter/scatterPlotProperties.ts:5`

**Problem:** Cannot find module `'../common/commonPlotProperties'`

**Fix Required:** Create the missing module or update import path.

---

### 12. **ProcessedSeries Type Errors** (22 errors)
**Locations:** Multiple files in `src/screens/graphs-render/utils/line-scatter/`

**Problem:** Objects missing required `xv` and `yv` properties from `ProcessedSeries` type.

**Fix Required:** Add `xv` and `yv` properties to all `ProcessedSeries` objects.

---

### 13. **DataValidation Errors** (2 errors)
**Locations:**
- `src/screens/graphs-render/utils/dataValidation.ts:156`
- `src/screens/graphs-render-backup-20251020_090308/utils/dataValidation.ts:156`

**Problem:** `missingValues: 0` should be `missingValues: [0]` (array expected).

**Fix Required:** Change to array format.

---

### 14. **Sample Size Styles Errors** (2 errors)
**Location:** `src/screens/top-menu/sample-size/styles-hook/use-sample-size-styles.ts`

**Problem:** `borderColor` property type mismatch.

**Fix Required:** Check token type and use correct property or cast appropriately.

---

## Priority Fix Order

1. **High Priority:**
   - Fix `IGraphRef` type usage in `src/libs/graphs/index.tsx`
   - Fix Modal type errors (7 files)
   - Fix missing properties in critical types

2. **Medium Priority:**
   - Fix Fluent UI component prop errors (Option, Badge, Text)
   - Fix CSSProperties type errors
   - Fix missing module imports

3. **Low Priority:**
   - Fix test file errors
   - Fix backup folder errors (or delete folder)
   - Fix ProcessedSeries type errors

## Recommended Actions

1. **Delete backup folder** if not needed:
   ```bash
   rm -rf src/screens/graphs-render-backup-20251020_090308
   ```

2. **Fix IGraphRef usage** - Update `src/libs/graphs/index.tsx` to use correct ref type

3. **Batch fix modal types** - Replace all `modalType="alert"` with `modalType="non-modal"`

4. **Fix Fluent UI components** - Add missing props systematically

5. **Update type definitions** - Add missing properties to interfaces

