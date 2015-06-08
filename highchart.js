var d_dna = 2.2; // 2.2 nm diameter dsDNA
var d_dna_sq = Math.pow(d_dna, 2);
var sigma = 10.8; // KCl conductivity in nS/nm at 23 deg C
var pi = Math.PI;

function G_o(t, d){
  d_sq = Math.pow(d, 2);
  denominator = 4.*t/(pi*d_sq) + 1./d;
  return sigma / denominator;
}

function G_blocked(t, d){
  if(d <= d_dna){
    return 0;
  }
  d_sq = Math.pow(d, 2);
  d_eff_sq = d_sq - d_dna_sq;
  d_eff = Math.sqrt(d_eff_sq); // effective diameter of blocked pore
  denominator = 4.*t/(pi*d_eff_sq) + 1./(d_eff);
  return sigma / denominator;
}

function Delta_G(t, d){
  return G_o(t, d) - G_blocked(t, d);
}

/**
* t = thickness in nm
* start = diameter of pore you want to start the isoline at.
* end = diameter of pore you want to end the isoline at.
*/
function generate_thickness_isoline(t, start, end){
  data = [];
  
  var n = 10;
  var step = (end - start) / n;

  for(i=0; i<n; i++){
    x = start + i*step;
    new_point = [G_o(t, x), Delta_G(t, x)];
    data.push(new_point);
  }
  return data;
}

var t_0nm_data = generate_thickness_isoline(0, 2.5, 4.167);
var t_1nm_data = generate_thickness_isoline(1, d_dna, 5.636); // DeltaG = 45 nS for t = 1nm and d = 5.19 nm
var t_2nm_data = generate_thickness_isoline(2, d_dna, 5.950);


$('#ds_plot').highcharts({
  title: {
    text: 'Pore Conductance Comparison',
    x: -20 //center
  },
  xAxis: {
    title: {
      text: 'Go (nS)'
    }
  },
  yAxis: {
    title: {
      text: '&Delta;G (nS)',
      useHTML: true
    },
    plotLines: [{
      value: 0,
      width: 1,
      color: '#808080'
    }]
  },
  tooltip: {
    valueSuffix: ' nS'
  },
  legend: {
    layout: 'vertical',
    align: 'right',
    verticalAlign: 'top',
    borderWidth: 0
  },
  series: [{
    type: 'spline',
    name: 'DG = Go',
    marker: {
      enabled: false
    },
    enableMouseTracking: false,
    data: [
      [2, 2],
      [15, 15],
    ]
  }, {
    type: 'spline',
    lineWidth: 1,
    name: 't = 0 nm',
    marker: {
      enabled: false
    },
    enableMouseTracking: false,
    data: t_0nm_data
  }, {
    type: 'spline',
    name: 't = 1 nm',
    marker: {
      enabled: false
    },
    enableMouseTracking: false,
    data: t_1nm_data
  }, {
    type: 'spline',
    lineWidth: 1,
    name: 't = 2 nm',
    marker: {
      enabled: false
    },
    enableMouseTracking: false,
    data: t_2nm_data
  }, {
    type: 'scatter',
    name: 'Rodriguez-Manzo & Puster (a-Si)',
    data: [[7.9, 6.8], [20.8, 4.7], [10.3, 7.4], [5.9, 3.4], [12.4, 7.9], [5.1, 3.6], [18.7, 6.6], [25.8, 6.5], [9.0, 7.3], [16.8, 9.7], [12.8, 9.4], [22.0, 9.1]]
  }]
});
