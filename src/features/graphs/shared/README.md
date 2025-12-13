# Shared Graph Components

This folder contains reusable components, hooks, types, and utilities that are shared across **all graph types** (Line, Scatter, Line-Scatter, 3D Mesh, etc.).

## 📁 Folder Structure

```
shared/
├── components/          # Reusable UI components
│   ├── GraphErrorBoundary.tsx
│   ├── ValidationErrorModal.tsx
│   └── index.ts
├── hooks/              # Shared custom hooks
│   └── index.ts
├── types/              # Shared TypeScript types
│   ├── validation.ts
│   └── index.ts
├── utils/              # Shared utility functions
│   └── index.ts
└── README.md          # This file
```

---

## 🎯 Purpose

**Before:** Each graph type (line, scatter, mesh) had **duplicate** components:
- ❌ `line/components/ErrorBoundary.tsx`
- ❌ `scatter/components/ErrorBoundary.tsx`  
- ❌ `mesh/components/ErrorBoundary.tsx`
- ❌ 99% identical code!

**After:** ONE shared component used by ALL graph types:
- ✅ `shared/components/GraphErrorBoundary.tsx`
- ✅ Configured with `graphType` prop
- ✅ DRY (Don't Repeat Yourself)

---

## 📦 Available Components

### 1. **GraphErrorBoundary**

Generic error boundary for all graph types.

**Usage:**
```tsx
import { GraphErrorBoundary } from '@features/graphs/shared/components';

<GraphErrorBoundary graphType="Line Plot">
  <LinePlotForm />
</GraphErrorBoundary>
```

**Props:**
- `graphType?: string` - Name of the graph (e.g., "Line Plot", "3D Mesh")
- `fallback?: ReactNode` - Custom error UI
- `onError?: (error, errorInfo) => void` - Custom error handler

### 2. **ValidationErrorModal**

Generic modal for displaying validation errors.

**Usage:**
```tsx
import { ValidationErrorModal } from '@features/graphs/shared/components';

<ValidationErrorModal
  isOpen={showErrors}
  onClose={() => setShowErrors(false)}
  errors={validationErrors}
  graphType="Scatter Plot"
  onRetry={handleRetry}
/>
```

**Props:**
- `isOpen: boolean` - Show/hide modal
- `onClose: () => void` - Close handler
- `errors: ValidationError[]` - Array of validation errors
- `graphType?: string` - Name of the graph
- `onRetry?: () => void` - Retry button handler
- `title?: string` - Custom title

### 3. **useGraphErrorHandler** Hook

Hook for error handling in functional components.

**Usage:**
```tsx
import { useGraphErrorHandler } from '@features/graphs/shared/components';

const MyComponent = () => {
  const { handleError } = useGraphErrorHandler('Line Plot');
  
  try {
    // ... code that might throw
  } catch (error) {
    handleError(error as Error);
  }
};
```

---

## 🔧 Shared Types

### ValidationError

```typescript
interface ValidationError {
  field?: string;        // Field name (e.g., "X Variable")
  message: string;       // Error message
  severity: 'error' | 'warning' | 'info';
  code?: string;         // Error code (optional)
}
```

### ValidationResult

```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}
```

---

## 🚀 Migration Guide

### Step 1: Update Imports

**Before:**
```tsx
import { LinePlotErrorBoundary } from './components/ErrorBoundary';
import { ValidationErrorModal } from './components/ValidationErrorModal';
```

**After:**
```tsx
import { GraphErrorBoundary, ValidationErrorModal } from '@features/graphs/shared/components';
```

### Step 2: Update Usage

**Before:**
```tsx
<LinePlotErrorBoundary>
  <LinePlotForm />
</LinePlotErrorBoundary>
```

**After:**
```tsx
<GraphErrorBoundary graphType="Line Plot">
  <LinePlotForm />
</GraphErrorBoundary>
```

### Step 3: Update Types

**Before:**
```tsx
import { ValidationError } from '../utils/validationUtils';
```

**After:**
```tsx
import { ValidationError } from '@features/graphs/shared/types';
```

### Step 4: Delete Old Files

After migrating, delete the duplicate files:
```bash
# Delete from each graph type folder:
rm -rf src/features/graphs/2d/line/components/ErrorBoundary.tsx
rm -rf src/features/graphs/2d/line/components/ValidationErrorModal.tsx
# ... repeat for scatter, line-scatter, mesh, etc.
```

---

## ✅ Benefits

1. **DRY (Don't Repeat Yourself)**
   - Write once, use everywhere
   - Consistent behavior across all graphs

2. **Easier Maintenance**
   - Fix bugs in ONE place
   - Add features to ALL graphs at once

3. **Smaller Bundle Size**
   - Less duplicate code
   - Better performance

4. **Type Safety**
   - Shared TypeScript types
   - Consistent interfaces

5. **Testability**
   - Test shared components once
   - All graphs benefit from tests

---

## 📝 TODO: Components to Add

These components can also be made shared:

- [ ] **AdvancedValidationModal** - Advanced validation details
- [ ] **Header** - Modal header component
- [ ] **VariableSelection** - Variable selection UI
- [ ] **DataFormatSection** - Data format configuration
- [ ] **ProjectAndType** - Project and graph type selector

Each of these is currently duplicated across graph types and can be refactored to use a shared component with props for customization.

---

## 🎨 Best Practices

### 1. Keep Components Generic

```tsx
// ✅ Good: Generic with props
<GraphErrorBoundary graphType="Line Plot">

// ❌ Bad: Hardcoded specific type  
<LinePlotErrorBoundary>
```

### 2. Use TypeScript

```tsx
// ✅ Good: Type-safe
interface Props {
  graphType: string;
  onError?: (error: Error) => void;
}

// ❌ Bad: No types
function ErrorBoundary(props) { ... }
```

### 3. Document Props

```tsx
/**
 * @param graphType - Name of the graph type
 * @param onError - Custom error handler
 */
```

### 4. Export from Index

```tsx
// shared/components/index.ts
export { GraphErrorBoundary } from './GraphErrorBoundary';
export { ValidationErrorModal } from './ValidationErrorModal';
```

---

## 🧪 Testing

Shared components should have comprehensive tests since they're used by ALL graph types.

```tsx
// shared/components/__tests__/GraphErrorBoundary.test.tsx
describe('GraphErrorBoundary', () => {
  it('should render children when no error', () => { ... });
  it('should show error UI when error occurs', () => { ... });
  it('should display custom graphType in error message', () => { ... });
});
```

---

## 📚 Additional Resources

- [React Error Boundaries](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Fluent UI React Components](https://react.fluentui.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

## 🤝 Contributing

When adding new shared components:

1. ✅ Make sure it's truly **generic** and reusable
2. ✅ Add proper **TypeScript types**
3. ✅ Document **props** and **usage**
4. ✅ Export from `index.ts`
5. ✅ Update this README
6. ✅ Add **tests**

---

**Questions?** See the implementation in each component file for detailed JSDoc comments and examples.


















