# Data Visualization in Marp Slides

This guide explains how to add Plotly charts and other data visualizations to your Marp presentation.

## Overview

Marp supports HTML blocks (when `html: true` is set), which allows us to embed interactive Plotly charts directly in slides. For static exports (PPTX/PDF), we can generate static images.

## Method 1: Interactive Plotly Charts (HTML Blocks)

For development and HTML preview, use Plotly.js directly in HTML blocks:

```markdown
---

## Performance Metrics

<div id="chart-performance"></div>

<script>
Plotly.newPlot('chart-performance', 
  [{
    x: ['Reflex', 'Learning', 'FSM', 'BT', 'GOAP'],
    y: [85, 92, 78, 88, 75],
    type: 'bar',
    marker: { color: '#4a90e2' }
  }],
  {
    title: 'Agent Performance Comparison',
    xaxis: { title: 'Agent Type' },
    yaxis: { title: 'Score' },
    margin: { t: 60, b: 60, l: 60, r: 40 }
  },
  { staticPlot: true }
);
</script>

<style scoped>
#chart-performance {
  width: 100%;
  height: 500px;
  margin: 1em 0;
}
</style>

---
```

**Note**: You need to include Plotly.js in the slide. Add this to your presentation front matter:

```markdown
---
style: |
  /* ... existing styles ... */
  
  /* Plotly charts */
  section .plotly-chart {
    width: 100%;
    height: 500px;
    margin: 1em 0;
  }
---
```

Or include Plotly.js globally by adding to the front matter:

```markdown
---
html: true
---

<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
```

## Method 2: Static Images (For Export)

For reliable PPTX/PDF export, generate static chart images:

### Step 1: Create Chart Configuration

Define your chart in `scripts/generate-charts.js`:

```javascript
const exampleCharts = {
  'my-chart': {
    data: [{
      x: ['A', 'B', 'C'],
      y: [10, 20, 30],
      type: 'bar'
    }],
    layout: {
      title: 'My Chart'
    }
  }
};
```

### Step 2: Generate Image

```bash
npm run chart:generate my-chart 1200 800
```

This creates `slides/images/charts/my-chart.png`.

### Step 3: Embed in Slide

```markdown
---

## Performance Metrics

![Agent Performance](images/charts/my-chart.png)

---
```

## Method 3: Preprocessing (Automatic)

You can extend `scripts/preprocess-for-pdf.js` to automatically generate charts from special syntax:

```markdown
![Chart:agent-performance](chart:agent-performance)
```

This would be processed to generate and embed the chart image automatically.

## Chart Types Supported

Plotly supports many chart types:

- **Bar charts**: `type: 'bar'`
- **Line charts**: `type: 'scatter'`, `mode: 'lines'`
- **Pie charts**: `type: 'pie'`
- **Scatter plots**: `type: 'scatter'`
- **Heatmaps**: `type: 'heatmap'`
- **3D plots**: `type: 'scatter3d'`, `type: 'surface'`

## Example: Agent Performance Comparison

```markdown
---

## Agent Performance Metrics

<div id="agent-chart"></div>

<script>
const data = [
  {
    x: ['Reflex', 'Learning', 'FSM', 'BT', 'GOAP'],
    y: [85, 92, 78, 88, 75],
    type: 'bar',
    marker: { 
      color: ['#4a90e2', '#50c878', '#ffa500', '#ff6b6b', '#9b59b6']
    }
  }
];

const layout = {
  title: { text: 'Agent Performance Comparison', font: { size: 18 } },
  xaxis: { title: 'Agent Type' },
  yaxis: { title: 'Score (0-100)' },
  margin: { t: 60, b: 60, l: 60, r: 40 },
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(0,0,0,0)'
};

Plotly.newPlot('agent-chart', data, layout, { staticPlot: true });
</script>

<style scoped>
#agent-chart {
  width: 100%;
  height: 450px;
  margin: 0.5em 0;
}
</style>

---
```

## Styling Tips

1. **Match Theme**: Use colors that match your Marp theme
2. **Size**: Keep charts between 400-600px height for slides
3. **Margins**: Adjust Plotly layout margins to fit slide content
4. **Static Mode**: Use `{ staticPlot: true }` to disable interactivity (better for presentations)

## Alternative: Chart.js

If you prefer a lighter alternative to Plotly:

```markdown
---

## Simple Chart

<canvas id="myChart"></canvas>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('myChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['A', 'B', 'C'],
    datasets: [{
      label: 'Values',
      data: [10, 20, 30],
      backgroundColor: '#4a90e2'
    }]
  }
});
</script>

<style scoped>
#myChart {
  max-width: 90%;
  max-height: 400px;
  margin: 1em auto;
}
</style>

---
```

## Best Practices

1. **For Development**: Use interactive HTML charts (Method 1)
2. **For Export**: Use static images (Method 2) for reliable PPTX/PDF
3. **Consistency**: Use the same chart style/colors across slides
4. **Size**: Test charts in actual slide dimensions
5. **Accessibility**: Include alt text for static images

## Troubleshooting

**Charts not rendering in HTML preview:**
- Ensure `html: true` is set in front matter
- Check browser console for JavaScript errors
- Verify Plotly.js CDN is accessible

**Charts not appearing in PPTX/PDF:**
- Use static images instead of HTML blocks
- Generate images with `npm run chart:generate`
- Check image paths are relative to markdown file

**Charts too large/small:**
- Adjust `height` in scoped styles
- Modify Plotly `layout.margin` values
- Use responsive sizing with `max-width`/`max-height`


