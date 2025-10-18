# 3D Mesh Plot Feature

This feature provides comprehensive 3D mesh plot functionality for the Stat Pro Graphs application.

## Features

- **Multiple Data Formats**:
  - XYZ Triplet: Each row contains X, Y, and Z values
  - Many Z Variables: Multiple Z variables with default scales
  - XY + Many Z Variables: Selected X/Y with multiple Z variables

- **Interactive Configuration**:
  - Variable selection with validation
  - Mesh appearance customization
  - Color scale selection
  - Lighting and shading options

- **SigmaPlot Compatibility**:
  - Default scales (10,20,30... and 1,2,3...)
  - First/last Z averaging for single surface
  - Proper axis orientation

## Components

### Main Components
- `MeshPlotModal`: Main modal dialog for creating mesh plots
- `MeshPlotForm`: Configuration form with all sections

### Configuration Components
- `ProjectAndType`: Project and plot type selection
- `DataFormatSection`: Data format selection with descriptions
- `VariableSelection`: Variable selection with format-specific validation
- `MeshConfiguration`: Mesh appearance and behavior settings

## Hooks

- `useMeshPlotStore`: Zustand store for mesh plot state
- `useProjectVariables`: Fetch and manage project variables
- `useAvailableFormats`: Manage supported data formats
- `useVariableManagement`: Variable selection and validation

## Utils

- `validationTest`: Comprehensive validation testing
- `validationDebug`: Debug utilities for validation
- `dataFormatHelpers`: Data format compatibility helpers
- `formatRequirements`: Format-specific requirements

## Usage

```tsx
import { MeshPlotModal } from '@features/graphs/3d/mesh';

function App() {
  const handleMeshPlotCreated = (config) => {
    console.log('Mesh plot created:', config);
  };

  return (
    <MeshPlotModal 
      trigger={<Button>Create 3D Mesh Plot</Button>}
      onSuccess={handleMeshPlotCreated}
    />
  );
}
```

## Data Formats

### XYZ Triplet
- **Requirements**: Exactly 1 X, 1 Y, 1 Z variable
- **Use Case**: Standard 3D data where each row has X, Y, Z coordinates
- **Example**: Temperature data with X=longitude, Y=latitude, Z=temperature

### Many Z Variables
- **Requirements**: At least 2 Z variables, optional X/Y
- **Use Case**: Multiple measurements with default spatial scales
- **Example**: Multiple sensor readings with default grid positions

### XY + Many Z Variables  
- **Requirements**: Exactly 1 X, 1 Y, at least 2 Z variables
- **Use Case**: Custom spatial coordinates with multiple measurements
- **Example**: Custom grid with multiple time series measurements

## Validation

The feature includes comprehensive validation:
- Format-specific requirements
- Variable selection validation
- Mesh configuration validation
- Real-time error reporting

## Styling

All components use Fluent UI styling with custom hooks:
- `useMeshPlotFormStyles`
- `useVariableSelectionStyles`
- `useMeshConfigurationStyles`
- And more...

## Integration

This feature integrates with:
- Main graph rendering system
- Project management
- Database access
- Plotly.js rendering