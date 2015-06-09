var d_dna = 2.2; // 2.2 nm diameter dsDNA
var d_dna_sq = Math.pow(d_dna, 2);
var sigma = 10.8; // KCl conductivity in nS/nm at 23 deg C
var pi = Math.PI;

function G_o(t, d) {
  d_sq = Math.pow(d, 2);
  denominator = 4. * t / (pi * d_sq) + 1. / d;
  return sigma / denominator;
}

function G_blocked(t, d) {
  if (d <= d_dna) {
    return 0;
  }
  d_sq = Math.pow(d, 2);
  d_eff_sq = d_sq - d_dna_sq;
  d_eff = Math.sqrt(d_eff_sq); // effective diameter of blocked pore
  denominator = 4. * t / (pi * d_eff_sq) + 1. / (d_eff);
  return sigma / denominator;
}

function Delta_G(t, d) {
  return G_o(t, d) - G_blocked(t, d);
}

/**
 * t = thickness in nm
 * start = diameter of pore you want to start the isoline at.
 * end = diameter of pore you want to end the isoline at.
 */
function generate_thickness_isoline(t, start, end) {
  data = [];

  var n = 10;
  var step = (end - start) / n;

  for (i = 0; i < n; i++) {
    x = start + i * step;
    new_point = [G_o(t, x), Delta_G(t, x)];
    data.push(new_point);
  }
  return data;
}

var t_0nm_data = generate_thickness_isoline(0, 2.5, 4.167);
var t_1nm_data = generate_thickness_isoline(1, d_dna, 5.636); // DeltaG = 45 nS for t = 1nm and d = 5.19 nm
var t_2nm_data = generate_thickness_isoline(2, d_dna, 5.950);

var bibtex;

function refresh_bib() {
  if (bibtex == null) {
    return
  }
  var cited = [];
  var count = 0;
  var citations = $('[class^=bib-]').each(function(i) {
    var citation = $(this);
    citation.empty();
    var classN = citation[0].className.replace("bib-", "");
    var index = cited.indexOf(classN);
    if (index < 0) {
      citation.append(count + 1);
      cited.push(classN);
      count++;
    } else {
      citation.append(index + 1);
    }
  });
}


$(document).ready(function() {

  // Set the highcharts plot options
  var options = {
    title: {
      text: 'dsDNA Conductance Comparison',
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
    },
    tooltip: {
      valueSuffix: ' nS'
    },
    legend: {
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'bottom',
      padding: 3,
      borderWidth: 0
    },
    series: [{
      type: 'spline',
      name: 'DG = Go',
      color: '#000000',
      lineWidth: 2,
      dashStyle: 'dash',
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
      color: '#555555',
      dashStyle: 'dot',
      name: 't = 0 nm',
      marker: {
        enabled: false
      },
      enableMouseTracking: false,
      data: t_0nm_data
    }, {
      type: 'spline',
      name: 't = 1 nm',
      lineWidth: 1,
      color: '#555555',
      dashStyle: 'dash',
      marker: {
        enabled: false
      },
      enableMouseTracking: false,
      data: t_1nm_data
    }, {
      type: 'spline',
      lineWidth: 1,
      color: '#555555',
      dashStyle: 'longdash',
      name: 't = 2 nm',
      marker: {
        enabled: false
      },
      enableMouseTracking: false,
      data: t_2nm_data
    }]
  };

  // Grab the json data
  $.getJSON('data/data.json', function(series) {
    var tableStuff = [];
    var temp;

    // Format the highcharts options as well as the dataTables data
    for (var i = 0; i < series.length; i++) {
      temp = series[i];
      temp.type = 'scatter';
      temp.marker = {
        radius: 8
      }; // Set the marker radius. There must be a global way of doing this.
      options.series.push(series[i]);

      // Create the table row. TODO remove if/else, should not need once all the data is collected.
      var t = [];
      t.push(series[i].name);
      // push max, should be first datapoint
      t.push(series[i].data[0][1]);
      // push link if exists, otherwise blank
      if (series[i].hasOwnProperty('link')) {
        t.push(series[i].link);
      } else {
        t.push("");
      }
      // push bib if exists, otherwise blank
      if (series[i].hasOwnProperty('bib')) {
        t.push(series[i].bib);
      } else {
        t.push('');
      }
      tableStuff.push(t);
    }

    // Plot the highcharts chart
    $('#ds-plot').highcharts(options);

    // Add the datatable
    $('#ds-table').dataTable({
      "data": tableStuff,
      "order": [
        [1, "desc"]
      ],
      "columns": [{
        "title": "Name",
        // linkify if the link is available
        "render": function(data, type, row) {
          var ret = '';
          if (row[3].length > 0)
           ret += '<sup class="bib-' + row[3] + '"></sup>';
          if (row[2].length > 0)
            return ret + '<a href="' + row[2] + '">' + data + '</a>';
          return data;
        },
      }, {
        "title": "&Delta;G"
      }, {
        "title": "Link",
        "visible": false
      }, {
        "title": "Cite",
        "visible": false
      }]
    });

  }).fail(function(jqxhr, textStatus, error) {
    var err = textStatus + ", " + error;
    console.log("Request Failed: " + err);
  });

  // Load the bibliography
  $.ajax({
    url: "assets/bib.bib",
    dataType: "text",
    success: function(data) {
      bibtex = bibtexParse.toJSON(data);
      refresh_bib();
    }
  });

});
