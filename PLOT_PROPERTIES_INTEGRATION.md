# Plot Properties Integration

## 📍 **Where to Find the Plot Properties**

The Plot Properties are now integrated into your existing graph interface! Here's where to find them:

### **Location:**
```
Graph View → Properties Panel → "Plot Properties" Accordion Item
```

### **Navigation Path:**
1. Open your graph view
2. Look at the **Properties Panel** on the left side
3. Find the **"Plot Properties"** accordion item (2nd item)
4. Click to expand it
5. You'll see the Plot Properties controls!

## 🎨 **What You'll See:**

### **Scatter Points Section:**
- Point Size slider (2-20px)
- Border Width slider (0-5px) 
- Border Color picker
- Opacity slider (10-100%)
- Color Mode (Multi-color for categories vs Single color)
- Point Color picker (when single color mode)

### **Regression Lines Section** (when regression is enabled):
- Line Color picker
- Line Width slider (1-8px)
- Line Style dropdown (Solid, Dashed, Dotted, Dash-Dot)
- Opacity slider (10-100%)
- Show R² in legend checkbox

### **Error Bars Section** (when error bars are present):
- Error Bar Color picker
- Error Bar Width slider (0.5-5px)
- Cap Size slider (2-10px)
- Opacity slider (10-100%)
- Show in legend checkbox

## 🔄 **How It Works:**

1. **Real-time Updates**: All changes apply immediately to the plot
2. **Smart Visibility**: Only shows relevant sections based on your graph type
3. **Category Support**: Automatically detects category plots and shows multi-color options
4. **Reset Function**: "Reset to Defaults" button to restore original settings

## 🎯 **Integration Flow:**

```
GraphBodyRender (manages state)
    ↓
GraphProperty (passes props)
    ↓
GraphProperties (accordion container)
    ↓
PlotPropertiesPanel (the actual controls)
    ↓
GraphCanvas (receives liveProps and applies styling)
```

## 🚀 **Try It Now:**

1. Create a scatter plot with categories
2. Set subType to "Multiple Scatter Regression" 
3. Look for "Plot Properties" in the left panel
4. Adjust point size, colors, regression line styles
5. See changes apply instantly!

The Plot Properties are now fully integrated and ready to use! 🎉
