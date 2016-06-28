/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for graphics in GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2014 - 2016 Greenbone Networks GmbH
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 */

(function(global, window, document, gsa, d3, $, console) {
  'use strict';
  if (!gsa.is_defined(gsa.charts)) {
    gsa.charts = {};
  }
  var gch = gsa.charts;

  gch.BaseChartGenerator = BaseChartGenerator;

  /* Base class for chart generators */

  /**
   * Constructor for a chart gererator.
   *
   * @param name  Name of the generator.
   */
  function BaseChartGenerator(name) {
    this.csv_url = null;

    this.html_table_data = null;
    this.html_table_url = null;

    this.svg_url = null;
    this.svg = null;

    this.setDataTransformFunc(gch.data_raw);
    this.setName(name);

    this.init();
  }

  /**
   * Initializes a chart generator.
   */
  BaseChartGenerator.prototype.init = function() {
  };

  /**
   * Gets the name of a chart generator.
   */
  BaseChartGenerator.prototype.getName = function() {
    return this.name;
  };

  /**
   * Sets the name of a chart generator.
   *
   * @param value   The new name.
   */
  BaseChartGenerator.prototype.setName = function(value) {
    this.name = value;
    return this;
  };

  /**
   * Generates a title for the chart.
   *
   * @param data  The current data.
   */
  BaseChartGenerator.prototype.getTitle = function(data) {
    return this.title_generator(data);
  };

  /**
   * Sets the title generator for a chart generator.
   */
  BaseChartGenerator.prototype.setTitleGenerator = function(value) {
    this.title_generator = value;
    return this;
  };

  /**
   * Sets the data transformation function of a chart generator.
   *
   * @param value   The new data transformation function.
   */
  BaseChartGenerator.prototype.setDataTransformFunc = function(value) {
    this.data_transform_func = value;
    if (!gsa.is_defined(value)) {
      console.warn('undefined setDataTransformFunc');
    }
    return this;
  };

  /**
   * Applies the data transformation function of a chart generator.
   *
   * @param original_data   The original data.
   * @param gen_params      Generator parameters.
   *
   * @return The transformed data.
   */
  BaseChartGenerator.prototype.transformData = function(original_data,
      gen_params) {
    return this.data_transform_func(original_data, gen_params);
  };

  /**
   * Generates the chart from data, drawing it in a given display.
   *
   * @param display   The display to draw in.
   * @param data      The data to generate a chart for.
   */
  BaseChartGenerator.prototype.generate = function(display, data) {
  };

  BaseChartGenerator.prototype.generateData = function(controller,
      original_data, gen_params) {
    return null;
  };

  BaseChartGenerator.prototype.generateCsvData = function(controller, data) {
    return null;
  };

  BaseChartGenerator.prototype.generateHtmlTableData = function(controller,
      data) {
    return null;
  };

  BaseChartGenerator.prototype.addMenuItems = function(controller, data) {
    this.addDetachedChartMenuItem(controller);

    // Generate CSV
    var csv_data = this.generateCsvData(controller, data);
    this.addCsvDownloadMenuItem(controller, csv_data);
    this.addHtmlTableMenuItem(controller);

    // Generate HTML table
    var html_table_data = this.generateHtmlTableData(controller, data);
    this.addHtmlTableMenuItem(controller, html_table_data);

    this.addSvgMenuItems(controller);
    return this;
  };

  BaseChartGenerator.prototype.addDetachedChartMenuItem = function(controller) {
    // Create detach menu item
    controller.display.createOrGetMenuItem('detach')
      .attr('href', 'javascript:void(0);')
      .on('click', function() {
        gch.open_detached(controller.getDetachedUrl());
      })
      .text(gsa._('Show detached chart window'));
    return this;
  };

  BaseChartGenerator.prototype.addCsvDownloadMenuItem = function(controller,
      csv_data) {
    if (this.csv_url !== null) {
      URL.revokeObjectURL(this.csv_url);
    }

    var csv_blob = new Blob([csv_data], {type: 'text/csv'});
    this.csv_url = URL.createObjectURL(csv_blob);

    controller.display.createOrGetMenuItem('csv_dl')
      .attr('href', this.csv_url)
      .attr('download', 'gsa_' + this.getName() + '_chart-' +
          new Date().getTime() + '.csv')
      .text(gsa._('Download CSV'));
    return this;
  };

  BaseChartGenerator.prototype.addHtmlTableMenuItem = function(controller,
      html_table_data) {
    var self = this;

    if (this.html_table_url !== null) {
      URL.revokeObjectURL(this.html_table_url);
      this.html_table_url = null;
    }

    var html_table_blob = new Blob([html_table_data],
        {type: 'text/html'});
    this.html_table_url = URL.createObjectURL(html_table_blob);

    controller.display.createOrGetMenuItem('html_table')
      .attr('href', '#')
      .on('click', function() {
        window.open(self.html_table_url);
        return true;
      })
      .text(gsa._('Show HTML table'));
    return this;
  };

  BaseChartGenerator.prototype.addSvgMenuItems = function(controller) {
    var self = this;
    var display = controller.display;

    function create_svg_url() {
      var svg_data = gch.svg_from_elem(display.svg, display.getTitle());

      if (self.svg_url !== null) {
        URL.revokeObjectURL(self.svg_url);
      }
      var svg_blob = new Blob([svg_data], {type: 'image/svg+xml'});
      self.svg_url = URL.createObjectURL(svg_blob);
      return self.svg_url;
    }

    display.createOrGetMenuItem('svg_window')
      .attr('href', 'javascript:void(0)')
      .on('click', function() {
        gch.blob_img_window(create_svg_url());
      })
      .text(gsa._('Show copyable SVG'));

    display.createOrGetMenuItem('svg_dl', true /* Last. */)
      .attr('download', 'gsa_' + self.getName() + '_chart-' +
          new Date().getTime() + '.svg')
      .on('click', function() {
        $(this).attr('href', create_svg_url());
      })
      .text(gsa._('Download SVG'));
    return this;
  };

  BaseChartGenerator.prototype.setBarStyle = function(value) {
    this.bar_style = value;
    return this;
  };

  BaseChartGenerator.prototype.setColorScale = function(value) {
    this.color_scale = value;
    return this;
  };

  BaseChartGenerator.prototype.scaleColor = function(value) {
    var color = this.color_scale(value);
    if (color === '#NaNNaNNaN') {
      return undefined;
    } else {
      return color;
    }
  };

  BaseChartGenerator.prototype.evaluateParams = function(gen_params) {
    if (gsa.is_defined(gen_params.no_chart_links)) {
      this.no_chart_links = gen_params.no_chart_links;
    }

    if (gen_params.chart_template === 'resource_type_counts') {
      this.setDataTransformFunc(gch.resource_type_counts);
    }
    else if (gen_params.chart_template === 'qod_type_counts') {
      this.setDataTransformFunc(gch.qod_type_counts);
    }
    else if (gen_params.chart_template === 'percentage_counts') {
      this.setDataTransformFunc(gch.percentage_counts);
    }
    else if (gen_params.chart_template === 'info_by_class' ||
        gen_params.chart_template === 'recent_info_by_class') {
      this.setDataTransformFunc(gch.data_severity_level_counts);
    }
    else if (gen_params.chart_template === 'info_by_cvss' ||
        gen_params.chart_template === 'recent_info_by_cvss') {
      this.setDataTransformFunc(gch.data_severity_histogram);
    }
  };

  BaseChartGenerator.prototype.createGenerateLinkFunc = function(column, type,
      filter_info) {
    var self = this;
    return function(d, i) {
      if (self.no_chart_links !== true) {
        return self.generateLink(d, i, column, type, filter_info);
      }
    };
  };

  BaseChartGenerator.prototype.generateLink = function(d, i, column, type,
      filter_info) {
  };

})(window, window, window.document, window.gsa, window.d3, window.$,
  window.console);

// vim: set ts=2 sw=2 tw=80:
