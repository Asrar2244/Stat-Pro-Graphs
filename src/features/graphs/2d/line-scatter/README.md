# Line-Scatter Plot Feature

## 📁 Directory Structure

```
LineScatterPlot/
├── 📂 components/              # UI Components
│   ├── Header.tsx                      (25 lines)
│   ├── ProjectAndType.tsx              (66 lines)
│   ├── DataFormatSection.tsx           (45 lines)
│   ├── ErrorBarsConfiguration.tsx      (120 lines)
│   └── VariableSelection.tsx           (200 lines)
│
├── 📂 hooks/                   # Custom React Hooks
│   ├── index.ts                        (3 lines)
│   ├── useAvailableFormats.ts          (25 lines)
│   ├── useProjectVariables.ts          (60 lines)
│   └── useVariableManagement.ts        (180 lines)
│
├── 📂 utils/                   # Utility Functions
│   ├── index.ts                        (3 lines)
│   ├── dataFormatHelpers.ts            (150 lines)
│   ├── formatRequirements.ts           (120 lines)
│   └── validationUtils.ts              (200 lines)
│
├── 📂 styles-hook/             # Style Hooks (to be added)
│
├── 📄 constants.ts                    (200 lines)
├── 📄 index.ts                        (4 lines)
├── 📄 LineScatterPlotForm.tsx         (150 lines)
├── 📄 LineScatterPlotModal.tsx        (60 lines)
├── 📄 lineScatterPlotSlice.ts         (250 lines)
└── 📄 types.ts                        (50 lines)
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
- Fetches variables from the selected project
- Handles loading states and error management
- Provides retry functionality

#### `useVariableManagement(dataFormat, subType, variables)`
- Manages variable selection and organization
- Handles moving variables between lists (X, Y, Error Bar, Category)
- Provides validation helpers for different data formats

#### `useAvailableFormats(subType)`
- Returns available data formats for the selected sub-type
- Provides symbol value options for error bar configurations

### **Utils** (`/utils`)
Utility functions for validation, formatting, and data processing.

- `dataFormatHelpers.ts` - Data format validation and compatibility checks
- `formatRequirements.ts` - Format-specific requirements and validation
- `validationUtils.ts` - Comprehensive validation for plot configuration

## 📊 Supported Plot Types

### A) Simple Straight Line & Scatter
Plots a single set of XY pairs connecting symbols with straight lines.
- **Data Formats**: XY Pairs, Single X, Single Y

### B) Multiple Straight Lines & Scatter
Plots multiple sets of XY pairs connecting symbols with straight lines.
- **Data Formats**: XY Pairs, Many X, Many Y, X Many Y, Y Many X, X Category, Y Category

### C) Simple Spline Curve Line & Scatter
Plots a single set of XY pairs connecting symbols with a spline curve.
- **Data Formats**: XY Pairs, Single X, Single Y

### D) Multiple Spline Curves Lines and Scatter
Plots multiple sets of XY pairs connecting symbols with spline curves.
- **Data Formats**: XY Pairs, Many X, Many Y, X Many Y, Y Many X, X Category, Y Category

### E) Simple Line & Scatter - Error Bars
Plots XY pairs as symbols with error bars connected with straight lines.
- **Data Formats**: XY Pairs, Single Y
- **Symbol Value**: Worksheet, Asymmetric Error Bar Column

### F) Multiple Line & Scatter - Error Bars
Plots multiple sets of XY pairs with error bars connected with straight lines.
- **Data Formats**: X Many Y, Many Y, XY Pairs
- **Symbol Value**: Worksheet, Asymmetric Error Bar Column

### G) Simple Vertical Step Plot
Plots a single set of XY pairs connecting symbols with vertical and horizontal lines, starting with vertical.
- **Data Formats**: XY Pairs, Single X, Single Y

### H) Simple Vertical Midpoint Step Plot
Plots a single set of XY pairs connecting symbols with vertical and horizontal lines at midpoints.
- **Data Formats**: XY Pairs, Single X, Single Y

### I) Multiple Vertical Step Plot
Plots multiple sets of XY pairs connecting symbols with vertical and horizontal lines, starting with vertical.
- **Data Formats**: XY Pairs, Many X, Many Y, X Many Y, Y Many X, X Category, Y Category

### J) Multiple Vertical Midpoint Step Plot
Plots multiple sets of XY pairs connecting symbols with vertical and horizontal lines at midpoints.
- **Data Formats**: XY Pairs, Many X, Many Y, X Many Y, Y Many X, X Category, Y Category

### K) Simple Horizontal Step Plot
Plots a single set of XY pairs connecting symbols with vertical and horizontal lines, starting with horizontal.
- **Data Formats**: XY Pairs, Single X, Single Y

### L) Simple Horizontal Midpoint Step Plot
Plots a single set of XY pairs connecting symbols with vertical and horizontal lines at midpoints, starting with horizontal.
- **Data Formats**: XY Pairs, Single X, Single Y

### M) Multiple Horizontal Step Plot
Plots multiple sets of XY pairs connecting symbols with vertical and horizontal lines, starting with horizontal.
- **Data Formats**: XY Pairs, Many X, Many Y, X Many Y, Y Many X, X Category, Y Category

### N) Multiple Horizontal Midpoint Step Plot
Plots multiple sets of XY pairs connecting symbols with vertical and horizontal lines at midpoints, starting with horizontal.
- **Data Formats**: XY Pairs, Many X, Many Y, X Many Y, Y Many X, X Category, Y Category

### O) Horizontal Error Bars
Plots XY pairs as symbols with horizontal error bars connected with straight lines.
- **Data Formats**: Y Many X, Many X, XY Pairs
- **Symbol Value**: Worksheet, Asymmetric Error Bar Column

### P) Bi-Directional Error Bars
Plots XY pairs as symbols with both horizontal and vertical error bars connected with straight lines.
- **Data Formats**: XY Pairs
- **Symbol Value**: Worksheet, Asymmetric Error Bar Column

## 🔧 Configuration Options

### Error Bar Configuration
- **Symbol Value**: Worksheet, Asymmetric Error Bar Column
- **Error Calculation Methods**: Mean, Median, Standard Deviation, Confidence Intervals, etc.

### Data Format Support
- **Basic**: XY Pairs, Single X, Single Y
- **Multiple**: Many X, Many Y, X Many Y, Y Many X
- **Category**: X Category, Y Category

## 🎯 Usage

```tsx
import { LineScatterPlotModal } from './features/graphs/2d/line-scatter';

// In your component
const [modalOpen, setModalOpen] = useState(false);

const handleCreateGraph = (config) => {
  console.log('Creating line-scatter plot with config:', config);
  // Handle graph creation
};

<LineScatterPlotModal
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  projects={availableProjects}
  onCreateGraph={handleCreateGraph}
/>
```

## 🔄 State Management

The feature uses Zustand for state management with persistence:

- **Project Selection**: Currently selected project
- **Plot Configuration**: Sub-type, data format, variables
- **Error Bar Settings**: Symbol value, calculation methods
- **Variable Management**: X, Y, Error Bar, and Category variables

## ✅ Validation

Comprehensive validation ensures:
- Compatible data formats for each sub-type
- Required variables are selected
- Error bar configuration is complete when needed
- Variable types match their intended usage

## 🎨 Styling

Uses Material-UI components with consistent styling:
- Responsive layout
- Clear visual hierarchy
- Interactive variable selection
- Form validation feedback
