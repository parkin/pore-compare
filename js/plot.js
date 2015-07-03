/*************** Global Variables ***********/
'use strict';

var bibtex;

// Variaables for DNA calculations
var d_dna = 2.2; // 2.2 nm diameter dsDNA
var d_dna_sq = Math.pow(d_dna, 2);
var sigma = 10.8; // KCl conductivity in nS/nm at 23 deg C
var pi = Math.PI;

/**
 * Sets up all # links to smooth scroll
 */
function smoothScroll() {
  // Sets up smooth scrolling
  $('a[href*=#]:not([href=#])').click(function () {
    if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {

      var target = $(this.hash);
      target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
      if (target.length) {
        $('html,body').animate({
          scrollTop: target.offset().top
        }, 700);
        return false;
      }
    }
  });
}

/**
 * Smooth scroll to an element.
 * smoothScrollTo('#hero');
 */
function smoothScrollTo(target) {
  $('html,body').animate({
    scrollTop: $(target).offset().top
  }, 1000);
}

function G_o(t, d) {
  var d_sq = Math.pow(d, 2);
  var denominator = 4 * t / (pi * d_sq) + 1 / d;
  return sigma / denominator;
}

function G_blocked(t, d) {
  if (d <= d_dna) {
    return 0;
  }
  var d_sq = Math.pow(d, 2);
  var d_eff_sq = d_sq - d_dna_sq;
  var d_eff = Math.sqrt(d_eff_sq); // effective diameter of blocked pore
  var denominator = 4 * t / (pi * d_eff_sq) + 1 / d_eff;
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
  var data = [];

  var n = 10; // will end up with n+1 datapoints
  var step = (end - start) / n;
  var new_point;

  for (var i = 0; i < n + 1; i++) {
    var x = start + i * step;
    new_point = [G_o(t, x), Delta_G(t, x)];
    data.push(new_point);
  }
  return data;
}

/**
 * Returns an array of datapoints for a diameter isoline.
 * The resulting array will be logarithmically spaced.
 */
function generate_diameter_isoline(d, start, end) {
  var data = [];

  // highcarts expects data to be in increasing x, so keep note if we need
  // to reverse the resulting array
  var reverse = false;
  if (start > end) {
    var temp = start;
    start = end;
    end = temp;
    reverse = true;
  }

  var n = 10;
  var new_point;
  // If we start with 0, add the 0 datapoint here. Will not work
  // in for loop with logs
  if (start === 0) {
    new_point = [G_o(0, d), Delta_G(0, d)];
    data.push(new_point);
    start = end / 1000;
    n -= 1;
  }
  // Creates a logarithmic spaced array of x's
  var logMin = Math.log(start);
  var step = (Math.log(end) - Math.log(start)) / n;
  var x = 0;
  var accDelta = 0;
  for (var i = 0; i < n + 1; i++) {
    x = Math.exp(logMin + accDelta);
    new_point = [G_o(x, d), Delta_G(x, d)];
    data.push(new_point);
    accDelta += step;
  }
  return reverse ? data.reverse() : data;
}

/************* Generate the isolines */
var t_0nm_data = generate_thickness_isoline(0, 2.437, 4.167);
var t_1nm_data = generate_thickness_isoline(1, d_dna, 5.189); // DeltaG = 45 nS for t = 1nm and d = 5.19 nm
var t_2nm_data = generate_thickness_isoline(2, d_dna, 5.950);

var d_2p5nm_data = generate_diameter_isoline(2.5, 18.24, 0); // DeltaG = 2 nS for d=2.5nm, t = 18.24nm
var d_3nm_data = generate_diameter_isoline(3, 17.47, 0);
var d_3p5nm_data = generate_diameter_isoline(3.5, 16.76, 0);
var d_4nm_data = generate_diameter_isoline(4, 16.07, 0);

function get_nature_format(citation) {
  var tags = citation.entryTags;
  var authors = tags.author.split(' and ');
  var author = authors[0]; // get first author
  if (authors.length > 1) {
    author += ' <i>et al</i>';
  }
  var result = '<li>';
  result += '<a name="bib-' + citation.citationKey + '"></a>';
  result += author + '.';
  result += ' ' + tags.title + '.';
  result += ' <i>' + tags.journal + '</i>';
  result += ' <b>' + tags.volume + '</b>,';
  result += ' ' + tags.pages;
  result += ' (' + tags.year + ').';
  if (tags.hasOwnProperty('url')) {
    result += ' <a href="' + tags.url + '">(Link)</a>';
  }
  result += '</li>';
  return result;
}

function get_author_from_key(key) {
  var citation = bibtex[key];
  var authors = citation.entryTags.author.split(' and ');
  var author = authors[0]; // get first author
  if (authors.length > 1) {
    author += ' <i>et al.</i>';
  }
  return author;
}

function get_formatted_citation_from_key(key) {
  var citation = bibtex[key];
  return get_nature_format(citation);
}

function get_citation_html(key) {
  return '<sup class="bib-' + key + '"></sup>';
}

/**
Sample row declaration
var t = {
      'bib': series[i].bib,
      'name': get_author_from_key(series[i].bib),
      'material': series[i].material,
      'dna': series[i].dna,
      'electrolyte_concentration': series[i].electrolyte_concentration,
      'electrolyte': series[i].electrolyte,
      'sigma': series[i].sigma,
      'deltaG': series[i].data[0][1]
    };
**/
function format_table_row_array(t) {
  var result = [];
  t.hasOwnProperty('bib') ? result.push(t.bib) : result.push('');
  t.hasOwnProperty('name') ? result.push(t.name) : result.push('');
  t.hasOwnProperty('material') ? result.push(t.material) : result.push('');
  t.hasOwnProperty('dna') ? result.push(t.dna) : result.push('');
  t.hasOwnProperty('electrolyte_concentration') ? result.push(t.electrolyte_concentration) : result.push('');
  t.hasOwnProperty('electrolyte') ? result.push(t.electrolyte) : result.push('');
  t.hasOwnProperty('sigma') ? result.push(t.sigma) : result.push('');
  t.hasOwnProperty('deltaG') ? result.push(t.deltaG) : result.push('');
  return result;
}

function add_point_to_chart(name, g_o, deltaG) {
  var series = {
    type: 'scatter',
    name: name,
    data: [[g_o, deltaG]]
  };
  var chart = $('#ds-plot').highcharts();
  chart.addSeries(series);
}

function add_point_to_table(name, deltaG) {
  var table = $('#ds-table').DataTable();
  var row = format_table_row_array({
    'name': name,
    'deltaG': deltaG
  });
  table.row.add(row).draw();
}

function add_point_to_chart_and_table(name, g_o, deltaG) {
  add_point_to_chart(name, g_o, deltaG);
  add_point_to_table(name, deltaG);
}

// Refreshes the <sup class="bib-*"></sup> with the correct citations.
function refresh_bib() {
  if (bibtex == null) {
    return;
  }
  // empty the references ordered list
  $('#references').empty();

  var cited = [];
  var count = 0;
  var citations = $('[class^=bib-]').each(function (i) {
    var citation = $(this);
    citation.empty();
    var key = citation[0].className.replace('bib-', '');
    var index = cited.indexOf(key);
    if (index < 0) {
      count++;
      citation.append('<a href="#bib-' + key + '">' + count + '</a>');
      cited.push(key);
      // We also add this to the references list
      $('#references').append(get_formatted_citation_from_key(key));
    } else {
      citation.append('<a href="#bib-' + key + '">' + (index + 1) + '</a>');
    }
  });
}

function plotChartAndTable(series) {

  // Set the highcharts plot options
  var options = {
    plotOptions: {
      // This sets the default plot options, they can be overridden
      // in individual series.
      scatter: {
        marker: {
          radius: 9
        }
      },
      spline: {
        type: 'spline',
        lineWidth: 1,
        color: '#555555',
        marker: {
          enabled: false
        },
        enableMouseTracking: false
      }
    },
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
        text: 'ΔG (nS)',
        useHTML: true
      }
    },
    tooltip: {
      useHTML: true,
      formatter: function formatter() {
        var name;
        if (this.series.options.hasOwnProperty('bib')) {
          name = get_author_from_key(this.series.options.bib);
        } else {
          name = this.series.name;
        }
        return name + '<br/>Go: ' + this.x + ' nS' + '<br/>ΔG: ' + this.y + ' nS';
      }
    },
    legend: {
      layout: 'horizontal',
      align: 'left',
      verticalAlign: 'bottom',
      itemMarginTop: 8,
      itemMarginBottom: 8,
      padding: 3,
      borderWidth: 0,
      labelFormatter: function labelFormatter() {
        if (this.options.hasOwnProperty('bib')) {
          return get_author_from_key(this.options.bib) + get_citation_html(this.options.bib);
        } else {
          return this.name;
        }
      },
      useHTML: true
    },
    series: [{
      type: 'spline',
      name: 'ΔG = Go',
      color: '#000000',
      lineWidth: 2,
      dashStyle: 'dash',
      data: [[2, 2], [15, 15]]
    }, {
      type: 'spline',
      name: 't = 0 nm',
      dashStyle: 'dot',
      lineWidth: 2,
      color: '#000000',
      data: t_0nm_data
    }, {
      type: 'spline',
      name: 't = 1 nm',
      dashStyle: 'dash',
      color: '#1b9e77',
      data: t_1nm_data
    }, {
      type: 'spline',
      dashStyle: 'longdash',
      color: '#1b9e77',
      name: 't = 2 nm',
      data: t_2nm_data
    }, {
      type: 'spline',
      color: '#d95f02',
      dashStyle: 'dot',
      name: 'd = 2.5 nm',
      data: d_2p5nm_data
    }, {
      type: 'spline',
      color: '#d95f02',
      dashStyle: 'dash',
      name: 'd = 3 nm',
      data: d_3nm_data
    }, {
      type: 'spline',
      color: '#d95f02',
      dashStyle: 'longdash',
      name: 'd = 3.5 nm',
      data: d_3p5nm_data
    }, {
      type: 'spline',
      color: '#d95f02',
      dashStyle: 'longdashdot',
      name: 'd = 4 nm',
      data: d_4nm_data
    }]
  };

  var tableStuff = [];
  var temp;

  // Format the highcharts options as well as the dataTables data
  for (var i = 0; i < series.length; i++) {
    temp = series[i];
    temp.type = 'scatter';
    options.series.push(temp);

    var t = {
      'bib': series[i].bib,
      'name': get_author_from_key(series[i].bib),
      'material': series[i].material,
      'dna': series[i].dna,
      'electrolyte_concentration': series[i].electrolyte_concentration,
      'electrolyte': series[i].electrolyte,
      'sigma': series[i].sigma,
      'deltaG': series[i].data[0][1]
    };
    tableStuff.push(format_table_row_array(t));
  }

  // Plot the highcharts chart
  $('#ds-plot').highcharts(options);

  // Add the datatable
  var ds_table = $('#ds-table').dataTable({
    'scrollX': true,
    'data': tableStuff,
    'order': [[7, 'desc']],
    'columns': [{
      'title': 'Cite',
      'visible': false
    }, {
      'title': 'Publication',
      // linkify if the link is available
      'render': function render(data, type, row) {
        var ret = '';
        if (row[0].length > 0) {
          ret += get_citation_html(row[0]);
        }
        return data + ret;
      }
    }, {
      'title': 'Material'
    }, {
      'title': 'dsDNA (bp)',
      'className': 'dt-body-right',
      'render': function render(data, type, row) {
        if (type == 'display' && data > 1000) {
          return data / 1000 + ' k';
        }
        return data;
      }
    }, {
      'title': 'Electrolyte',
      'className': 'dt-body-right',
      'render': function render(data, type, row) {
        if (type == 'display') {
          return data + ' M ' + row[5];
        }
        return data;
      }
    }, {
      'title': 'Electrolyte Name',
      'visible': false
    }, {
      'title': 'σ (S/m)',
      'className': 'dt-body-right'
    }, {
      'title': 'ΔG (nS) scaled to <br/>1&nbsp;M&nbsp;KCl @ 23&nbsp;&deg;C (10.8 S/m)',
      'className': 'dt-body-right'
    }]
  });

  // For some reason, need this hack to redraw table after 10 ms so the header
  // and body of table are aligned properly.
  setTimeout(function () {
    ds_table.fnAdjustColumnSizing();
  }, 10);
}
$(document).ready(function () {
  // Grab the json data
  var d1 = $.getJSON('data/data.json');

  // Load the bibliography
  var d2 = $.ajax({
    url: 'assets/bib.bib',
    dataType: 'text'
  });

  // Wait until both the bibliography text and json data are loaded.
  $.when(d1, d2).then(function (result1, result2) {

    // parse the bibtex
    var rawBib = result2[0];
    var bib = bibtexParse.toJSON(rawBib);
    // convert the bibtex array to a key/value object
    bibtex = {};
    for (var i = 0; i < bib.length; i++) {
      bibtex[bib[i].citationKey] = bib[i];
    }

    var series = result1[0];
    plotChartAndTable(series);
    refresh_bib();
  });

  // Set up the add a point form
  $('#form-add-point-submit').click(function () {
    var $form = $('#form-add-point');
    // If the form validates, add the point.
    if ($form.parsley().validate()) {
      var name = $('#form-name').val();
      var g_o = Number($('#form-Go').val());
      var deltaG = Number($('#form-DeltaG').val());
      add_point_to_chart_and_table(name, g_o, deltaG);

      // Wait a little then scroll up to chart
      setTimeout(function () {
        smoothScrollTo('#ds-plot');
        // clear the form
        setTimeout(function () {
          $form.parsley().destroy();
          $form[0].reset();
        }, 800);
      }, 400);
    }
  });

  // Set up smooth scrolling
  smoothScroll();
});