export const INITIAL_GRAPH_LAYOUT = {
  layout: {
    showlegend: true,
    autosize: true,

    margin: {
      b: 0,
      l: 20,
      r: 20,
      t: 20,
    },
    legend: {
      orientation: 'h',
    },
  },

  config: {
    displayModeBar: false,
    responsive: true,
    editable: false,
  },
  annotation: {
    clicktoshow: 'onoff',
    captureevents: true,
    xref: 'x',
    yref: 'y',
    showarrow: true,
    arrowhead: 10,
    ax: 0,
    ay: -60,
  },
};
