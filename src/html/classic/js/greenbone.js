/*
 * Greenbone Security Assistant
 * $Id$
 * Description: Base JavaScript for GSA.
 *
 * Authors:
 * Timo Pollmeier <timo.pollmeier@greenbone.net>
 * Benoît Allard <benoit.allard@greenbone.net>
 * Björn Ricks <bjoern.ricks@greenbone.net>
 *
 * Copyright:
 * Copyright (C) 2015 - 2016 Greenbone Networks GmbH
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

(function(global, document, $, console, localStorage, location) {
  'use strict';

  // work-around select2 not working inside dialogs from here:
  // https://github.com/select2/select2/issues/1246#issuecomment-17428249
  global.jQuery.ui.dialog.prototype._allowInteraction = function(e) {
    return !!$(e.target).closest(
        '.ui-dialog, .ui-datepicker, .select2-dropdown').length;
  };

  /* A utility function that returns only the text in the current selection */
  global.jQuery.fn.justtext = function() {
    return $(this)
      .clone()
        .children()
          .remove()
        .end()
      .text();
  };

  var DIALOGS = {};

  /*
  * GSA base object
  */
  if (global.gsa === undefined) {
    global.gsa = {};
  }

  var gsa = global.gsa;

  gsa.has_value = has_value;
  gsa.is_date = is_date;
  gsa.is_object = is_object;
  gsa.is_string = is_string;
  gsa.is_defined = is_defined;
  gsa.is_function = is_function;
  gsa.is_array = Array.isArray;
  gsa.array_sum = array_sum;
  gsa.derive = derive;

  function LanguageDetector() {
    global.i18nextBrowserLanguageDetector.call(this);
  }

  gsa.derive(LanguageDetector, global.i18nextBrowserLanguageDetector);

  LanguageDetector.prototype.detect = function() {
    var lang = $('html').attr('lang');

    if (lang) {
      return lang;
    }

    return global.i18nextBrowserLanguageDetector.prototype.detect.call(this);
  };

  LanguageDetector.type = 'languageDetector';

  global.i18next
    .use(global.i18nextXHRBackend) // use ajax backend
    .use(LanguageDetector) // use own detector for language detection
    .init({
      nsSeparator: false, // don't use a namespace seperator in keys
      keySeperator: false, // don't use a key spererator in keys
      fallbackLng: 'en',
      ns: ['gsad'], // use gsad as namespace
      defaultNS: 'gsad',
      fallbackNS: 'gsad',
      backend: {
        loadPath: '/js/locales/{{ns}}-{{lng}}.json', // e.g. /js/locales/gsad-en.json
      },
      detection: {
        /* only use url querystring and browser settings for language detection */
        order: ['querystring', 'navigator'],
        /* use url?lang=de as querystring */
        lookupQuerystring: 'lang',
      },
    }, function(err, t) {
      /* keep quiet if translations have not be found.
       * errors can be debugged here */
    });

  /* Use an own function for translations
   *
   * This may allow to switch the i18n backend easily without having to adjust
   * all function calls.
   * */
  gsa._ = function(key, options) {
    return global.i18next.t(key, options);
  };

  function is_date(value) {
    return is_object(value) && value instanceof Date;
  }

  function is_object(value) {
    return has_value(value) && typeof value === 'object';
  }

  function is_string(value) {
    return has_value(value) && typeof value === 'string';
  }

  function is_function(value) {
    return has_value(value) && typeof value === 'function';
  }

  function has_value(value) {
    return value !== null && is_defined(value);
  }

  function is_defined(value) {
    return value !== undefined;
  }

  function array_sum(array) {
    if (!gsa.is_array(array) || array.length === 0) {
      return 0;
    }

    var sum = 0;
    if (Array.prototype.reduce) {
      sum = array.reduce(function(a, b) {
        return a + b;
      });
    }
    else {
      for (var i in array) {
        sum += array[i];
      }
    }
    return sum;
  }

  function derive(child, base) {
    child.prototype = Object.create(base.prototype);
    child.prototype.constructor = child;
  }

  var RESPONSE_SELECTORS = {
    new_agent:           'create_agent_response',
    new_host:            'create_asset_response',
    new_alert:           'create_alert_response',
    new_config:          'create_config_response',
    new_credential:      'create_credential_response',
    new_filter:          'create_filter_response',
    new_group:           'create_group_response',
    new_note:            'create_note_response',
    new_override:        'create_override_response',
    new_permission:      'create_permission_response',
    new_port_list:       'create_port_list_response',
    new_report_format:   'create_report_format_response',
    new_role:            'create_role_response',
    new_scanner:         'create_scanner_response',
    new_schedule:        'create_schedule_response',
    new_slave:           'create_slave_response',
    new_tag:             'create_tag_response',
    new_target:          'create_target_response',
    new_task:            'create_task_response',
    new_container_task:  'create_task_response',
    new_user:            'create_user_response',
    // ------
    upload_config:       'create_config_response',
    upload_port_list:    'create_port_list_response',
    upload_report:       'create_report_response',
    // ------
    edit_agent:          'modify_agent_response',
    edit_alert:          'modify_alert_response',
    edit_asset:          'modify_asset_response',
    edit_credential:     'modify_credential_response',
    edit_filter:         'modify_filter_response',
    edit_group:          'modify_group_response',
    edit_my_settings:    'modify_setting_response',
    edit_note:           'modify_note_response',
    edit_override:       'modify_override_response',
    edit_permission:     'modify_permission_response',
    edit_port_list:      'modify_port_list_response',
    edit_report_format:  'modify_report_format_response',
    edit_role:           'modify_role_response',
    edit_slave:          'modify_slave_response',
    edit_tag:            'modify_tag_response',
    edit_target:         'modify_target_response',
    edit_task:           'modify_task_response',
    edit_user:           'modify_user_response',
    // ------
    delete_user:         'delete_user_response',
    // ------
    process_bulk:        'commands_response'
  };

  var ENTITY_SELECTORS = {
    new_target: function(doc) {
      return get_entity_from_element(doc.find('get_targets_response > target'));
    },
    new_container_task: function(doc) {
      return get_entity_from_element(
          doc.find('get_tasks_response > task'));
    },
    new_credential: function(doc) {
      return get_entity_from_element(
          doc.find('get_credentials_response > credential'));
    },
    new_port_list: function(doc) {
      return get_entity_from_element(
          doc.find('get_port_lists_response > port_list'));
    },
    new_slave: function(doc) {
      return get_entity_from_element(
          doc.find('get_slaves_response > slave'));
    },
    new_schedule: function(doc) {
      return get_entity_from_element(
          doc.find('get_schedules_response > schedule'));
    },
    new_config: function(doc) {
      return get_entity_from_element(
          doc.find('get_configs_response > config'));
    },
    new_alert: function(doc) {
      return get_entity_from_element(
          doc.find('get_alerts_response > alert'));
    },
  };

  function get_entity_from_element(element) {
    if (!element) {
      return undefined;
    }

    return {
      name: element.children('name').text(),
      id: element.attr('id'),
    };
  }

  function get_entity(cmd, xml) {
    if (cmd in ENTITY_SELECTORS) {
      return ENTITY_SELECTORS[cmd](xml);
    }
    console.warn('No entity selector found for command ', cmd);
    return undefined;
  }

  function Dialog() {
  }

  Dialog.prototype.error = function(message, title, status_code) {
    var displayed_title;
    if (!title) {
      displayed_title = 'Error:';
    }
    else {
      displayed_title = title;
    }

    if (status_code !== undefined && status_code !== '') {
      displayed_title = displayed_title + ' <i>(Status code: ' +
        status_code + ')</i>';
    }

    // Remove previous errors
    this.dialog.find('div.ui-state-error').remove();
    // Insert our error message
    this.dialog.prepend($('<div/>', {
      'class': 'ui-state-error ui-corner-all',
      html: $('<p><strong>' + title + '</strong> ' + message + '</p>'),
    }));
  };

  Dialog.prototype.setErrorFromResponse = function(jqXHR) {
    var self = this;
    var xml = $(jqXHR.responseXML);
    var html = $(jqXHR.responseText);
    var response = xml.find(RESPONSE_SELECTORS[self.command] +
        '[status!="200"][status!="201"][status!="202"]');
    var gsad_msg = xml.find('gsad_msg');
    var action_result = xml.find('action_result');
    var generic_omp_response = xml.find('omp_response');
    var internal_error_html = html.find(
        '.gb_error_dialog .gb_window_part_content_error');
    var top_line_error_html = html.find(
        '.gb_window .gb_window_part_content_error');
    var login_form_html = html.find(
        '.gb_login_dialog .gb_window_part_content');
    var error_title = 'Error:';
    var error = 'Unknown error';
    var error_code = '';

    if (gsad_msg.length) {
      error = gsad_msg.attr('status_text');
      if (is_string(gsad_msg.justtext()) && gsad_msg.justtext() !== '') {
        error = error + '<br/>' + gsad_msg.justtext();
      }
      error_code = gsad_msg.attr('status_code');
    }
    else if (response.length) {
      var parent = response.parent();
      if (parent[0].nodeName === 'save_setting') {
        var id = parent.attr('id');
        var name = parent.attr('name');
        if (!gsa.is_defined(name)) {
          var name_elem = xml.find('setting[id="' + id + '"] name');
          if (gsa.is_defined(name_elem)) {
            name = name_elem.justtext();
          }
          else {
            name = id;
          }
        }
        error_title = 'Error modifying setting "' + name + '":';
      }
      error = response.attr('status_text');
      error_code = response.attr('status');
    }
    else if (generic_omp_response.length) {
      error = generic_omp_response.attr('status_text');
      error_code = generic_omp_response.attr('status');
    }
    else if (action_result.length) {
      error_title = 'Operation \'' + action_result.find('action').text() +
        '\' failed';
      error = '<br/>' + action_result.find('message').text();
      error_code = action_result.find('status').text();
    }
    else if (internal_error_html.length) {
      error_title = internal_error_html.find('span div').text();
      if (!error_title) {
        error_title = 'Internal Error';
      }
      error = internal_error_html.find('span').text();
    }
    else if (top_line_error_html.length) {
      error_title = 'Operation \'' +
        top_line_error_html.find('#operation').text() + '\' failed';
      error = '<br/>' + top_line_error_html.find('#message').text();
    }
    else if (login_form_html.length) {
      error = login_form_html.find('.error_message').text();
    }

    self.error(error, error_title, error_code);
    return self;
  };

  Dialog.prototype.waiting = function() {
    // I believe there have to be a better way to find this.
    var buttons = this.dialog.closest('.ui-dialog').find('button.ui-button');
    buttons.each(function() {
      var button = $(this);
      if (button.button('option', 'label') !== 'Close') {
        this.label = button.button('option', 'label');
        if (this.label !== 'OK') {
          button.button('option', 'label', this.label.substring(
                0, this.label.length - 1) + 'ing ...');
        }
        button.button('option', 'icons', {primary: 'ui-icon-waiting'});
        button.button('disable');
      }
    });
    return this;
  };

  /**
   * command is the name of the gsa command that has to be send initialy
   * done is the select that will get the value of the newly created resource or true if a global reload is to be triggered.
   * params are extra parameters to send to the initial GET request.
   * show_method specifies the method to send the initial request instead of GET.
  **/
  function OMPDialog(options) {
    this.command = options.cmd;
    this.success_reload = options.success_reload || {};
    this.close_reload = options.close_reload || {};
    this.height = is_defined(options.height) ? options.height : 500;
    this.dialog_id = options.dialog_id;

    if (options.params === undefined) {
      this.params = {};
    } else {
      this.params = options.params;
    }
    if (options.show_method === undefined) {
      this.show_method = 'GET';
    } else {
      this.show_method = options.show_method;
    }
    if (options.parent_dialog) {
      this.parent_dialog = options.parent_dialog.$omp;
    }
  }

  gsa.derive(OMPDialog, Dialog);

  OMPDialog.prototype.finished = function() {
    // I believe there have to be a better way to find this.
    var buttons = this.dialog.closest('.ui-dialog').find('button.ui-button');
    buttons.each(function() {
      var button = $(this);
      if (button.button('option', 'label') !== 'Close') {
        button.button('enable');
        button.button('option', 'label', this.label);
        button.button('option', 'icons', {primary: null});
      }
    });
  };

  OMPDialog.prototype.close = function() {
    if (this.dialog.$omp) {
      // dereference self to avoid memory leak
      this.dialog.$omp = undefined;
    }
    if (gsa.is_defined(this.dialog_id)) {
      // remove dialog from global dialogs
      delete DIALOGS[this.dialog_id];
    }

    this.dialog.remove();
    this.dialog = undefined;
    this.parent_dialog = undefined;
    start_auto_refresh();

    if (this.close_reload.type === 'window') {
      location.reload();
    }

    return this;
  };

  OMPDialog.prototype.postForm = function() {
    var self = this;
    var data = new FormData(this.dialog.find('form')[0]);

    data.append('xml', 1);
    data.append('no_redirect', 1);
    $.ajax({
      url: '/omp',
      data: data,
      processData: false,
      contentType: false,
      type: 'POST',
      dataType: 'xml',
    })
    .fail(function(response) {
      if (response.status === 401) {
        // not authorized (anymore)
        // reload page to show login dialog
        location.reload();
        return;
      }

      self.setErrorFromResponse(response);

      // restore the original button.
      self.finished();
    })
    .done(function(xml) {
      var entity;

      xml = $(xml);
      if (self.success_reload.type === 'window') {
        location.reload();
        // a bit overkill, but better-safe-than-sorry.
        return;
      }
      else if (self.success_reload.type === 'parent' && self.parent_dialog) {
        self.parent_dialog.reload();
      }
      else if (self.success_reload.type === 'next' &&
          xml.find('action_result next')) {
        var url = parse_url(xml.find('action_result next').text());
        // we need the html page
        url.params.xml = 0;
        location.href = encode_url_object(url);
      }
      else if (self.success_reload.type === 'dialog') {
        var elem = $(self.success_reload.data);

        entity = self.getActionResultEntity(xml);

        if (!gsa.has_value(entity)) {
          // element not found. raise warning
          console.warn('Entity element not found!');
          self.close();
          return;
        }

        elem.data('id', entity.id);

        var show_dialog = init_omp_dialog({
          element: elem,
          button: gsa._('Save'),
          listeners: false,
        });

        var overlay = $('<div>')
          .addClass('ui-widget-overlay ui-front')
          .appendTo($('body'));

        show_dialog(function() {
          overlay.remove();
        });
      }
      else if (self.success_reload.type === 'done') {
        var done = $(self.success_reload.data);

        if (!gsa.has_value(done)) {
          // No element to update, exit early.
          self.close();
          return;
        }

        if (!done.length) {
          // element not found. raise warning
          console.warn('Done element not found!');
          self.close();
          return;
        }

        entity = self.getActionResultEntity(xml);
        if (gsa.has_value(entity)) {
          // fill in the new information in the $done element and make it selected
          done.append($('<option/>', {
            value: entity.id,
            html: entity.name,
            selected: true,
          }));

          // refresh the select widget.
          done.trigger('change');
        }
      }

      // And finally, close our dialog.
      self.close();
    });
  };

  OMPDialog.prototype.setContent = function(html) {
    var self = this;
    var dialog_title, dialog_html;
    var response = $('<div/>', {html: html});

    // get the content of the (first) window
    // needs to wrap it in a div to be able to select the top-level elements.
    var gb_windows = response.find('.gb_window');
    var edit_dialog = response.find('.edit-dialog');

    if (gb_windows.length) {
      if (gb_windows.length > 1) {
        self.error((gb_windows.length - 1) + ' forms not displayed !');
      }

      var gb_window = gb_windows.first();
      var content = gb_window.find('div:nth-child(4)');

      // remove all 'submit' buttons
      content.find('input[type=submit]').remove();

      dialog_title = gb_window.find('.gb_window_part_center').justtext();
      dialog_html = content.html();
    }
    else if (edit_dialog.length) {
      dialog_title = edit_dialog.find('.title').justtext();
      dialog_html = edit_dialog.find('.content').html();
    }

    self.dialog.attr('title', dialog_title);
    self.dialog.html(dialog_html);

    self.dialog.find('form').on('submit', function(event) {
      // prevent default form submission. we need to use our function
      self.submit();
      event.preventDefault();
    });

    self.dialog.on('keydown', function(event) {
      if (event.which === $.ui.keyCode.ENTER) {
        var focused = $(':focus');
        var tag = focused[0].tagName;
        // submit form on enter, unless focus is on a multi-line text area.
        if (tag !== 'TEXTAREA') {
          self.submit();
          event.preventDefault();
        }
      }
    });

    // enable buttons, set up selects, ...
    on_ready(self.dialog);
  };

  OMPDialog.prototype.show = function(button, callback) {
    var self = this;
    var done_func, fail_func;

    if (gsa.is_defined(this.dialog_id)) {
      // check if the dialog is already shown
      if (gsa.is_defined(DIALOGS[this.dialog_id])) {
        return;
      }
      DIALOGS[this.dialog_id] = this;
    }

    if (button === undefined) { button = 'Create';}
    this.params.cmd = this.command;
    this.params.token = $('#gsa-token').text();
    $('html').css('cursor', 'wait');
    stop_auto_refresh();

    self.dialog = $('<div/>', {
      'class': 'dialog-form',
    });

    // connect this OMPDialog with the DOM
    self.dialog[0].$omp = self;

    done_func = function(html) {
      self.setContent(html);

      // show the dialog !
      self.dialog.dialog({
        modal: true,
        width: 800,
        maxHeight: self.height,
        buttons: [
          {
            text: button,
            click: function() {
              self.submit();
            },
          }
        ],
        open: function() {
          if (gsa.is_function(callback)) {
            callback();
          }
        },
        close: function() {
          self.close();
        },
      });

      $('html').css('cursor', '');
    };

    fail_func = function(response) {
      if (response.status === 401) {
        // not authorized (anymore)
        // reload page to show login dialog
        location.reload();
        return;
      }

      self.setErrorFromResponse(response);

      self.dialog.dialog({
        modal: true,
        width: 800,
        maxHeight: self.height
      });

      $('html').css('cursor', '');
    };

    if (this.show_method === 'GET') {
      self.request_data = {
        url: '/omp?' + $.param(this.params),
        cache: false,
        type: 'GET',
      };
    }
    else if (this.show_method === 'POST') {
      var data = new FormData();
      for (var param in this.params) {
        data.append(param, this.params[param]);
      }

      self.request_data = {
        url: '/omp',
        data: data,
        cache: false,
        processData: false,
        contentType: false,
        type: 'POST',
      };
    }
    else {
      throw new Error('Unknown show_method "' + this.show_method + '"');
    }

    $.ajax(self.request_data).done(done_func).fail(fail_func);

    return this;
  };

  OMPDialog.prototype.reload = function() {
    var self = this;
    self.waiting();
    $.ajax(self.request_data).then(function(data) {
        self.setContent(data);
        self.finished();
      }, function() {
      }
    );
  };

  OMPDialog.prototype.getActionResultEntity = function(xml) {
    var entity;
    var self = this;
    var action_result_next = xml.find('action_result > next');

    if (action_result_next.length > 0) {
      // got an "action_result" with "next" element,
      //  so get "next" url and extract entity from response.
      var next_url = action_result_next.text();
      $.ajax({
        url: next_url,
        async: false,
        success: function(doc) {
          entity = get_entity(self.command, $(doc));
        },
        error: function(doc) {
          self.setErrorFromResponse($(doc));
        },
      });
    } else {
      // got a response directly, extract entity directly.
      entity = get_entity(self.command, xml);
    }
    return entity;
  };

  OMPDialog.prototype.submit = function() {
    this.waiting();
    this.postForm();
  };

  global.OMPDialog = OMPDialog;

  function FilterDialog(id, title) {
    this.id = id;
    this.title = title;
  }

  gsa.derive(FilterDialog, Dialog);

  FilterDialog.prototype.show = function() {
    var self = this;
    var content = $('#' + this.id);
    var parent = content.parent();

    content.show();

    // Update the form parameter
    var input = content.find('input[name=build_filter]');
    if (input.length) {
      input.val(input.val() ^ 1);
    }

    this.dialog = $('<div/>', {
      'class': 'dialog-form',
      title:  this.title,
      html: content,
    });

    stop_auto_refresh();

    // show the dialog !
    this.dialog.dialog({
      modal: true,
      width: 800,
      buttons: [
        {
          text: 'Update',
          click: function() {
            self.waiting();
            self.dialog.find('form').submit();
          },
        }
      ],
      close: function() {
        content.hide();
        parent.append(content);
        self.dialog.remove();
        self.dialog = undefined;
        start_auto_refresh();
      },
    });

    // Rebuild select2 dropdown lists as the original copies do not work.
    content.find('span.select2').remove();
    content.find('select').removeClass('select2-hidden-accessible');
    content.find('select').removeAttr('aria-hidden');
    content.find('select').select2();
  };

  global.FilterDialog = FilterDialog;

  function InfoDialog(options) {
    this.timeout = options.timeout !== undefined ? options.timeout : 5000;
    this.width = options.width !== undefined ? options.width : 600;
    this.transfer_to = options.transfer_to ? $(options.transfer_to) : undefined;
    this.interval_time = 1000; // 1 sec
    this.progress_value = this.timeout;
    this.modal = options.modal !== undefined ? options.modal : false;
    this.fade_in_duration = options.fade_in_duration !== undefined ?
      options.fade_in_duration : 1000;

    this.dialog = $('<div/>', {
      'class': 'dialog-form',
    });
    options.element.detach();
    this.dialog.append(options.element.children());
    this.dialog_css = options.dialog_css;
  }

  InfoDialog.prototype.close = function() {
    if (this.transfer_to !== undefined) {
      this.dialog.parent('.ui-dialog').effect('transfer', {
        to: this.transfer_to,
      }, 1000);
    }

    this.stopProgress();

    this.progress = undefined;
    this.progress_value = this.timeout;

    this.dialog.remove();
    this.dialog = undefined;
  };

  InfoDialog.prototype.stopProgress = function() {
    if (this.progress_timer !== undefined) {
      global.clearInterval(this.progress_timer);
      this.progress_timer = undefined;
    }
  };

  InfoDialog.prototype.startProgress = function() {
    var self = this;

    var element = $('<div class="progress"/>');

    this.progress = $('<span />');
    this.progress.text(this.progress_value / 1000);

    this.progress_button = $('<img src="/img/pause.png" alt="Pause/Resume" />');
    this.progress_button.on('click', function() {
      if (self.progress_timer === undefined) {
        self.resumeProgress();
      }
      else {
        self.pauseProgress();
      }
    });

    element.append(this.progress);
    element.append(this.progress_button);

    this.dialog.after(element);

    this.resumeProgress();
  };

  InfoDialog.prototype.pauseProgress = function() {
    if (this.progress_timer !== undefined) {
      global.clearInterval(this.progress_timer);
      this.progress_timer = undefined;
    }
    this.progress_button.attr('src', '/img/resume.png');
  };

  InfoDialog.prototype.resumeProgress = function() {
    var self = this;

    self.progress_button.attr('src', '/img/pause.png');

    self.progress_timer = global.setInterval(function() {
      self.progress_value -= self.interval_time;

      if (self.progress_value < 0) {
        self.stopProgress();
        self.close();
        return;
      }

      self.progress.text(self.progress_value / 1000);
    }, self.interval_time);
  };

  InfoDialog.prototype.show = function() {
    var self = this;

    self.dialog.css('cursor', 'progress');

    self.dialog.dialog({
      dialogClass: self.dialog_css,
      modal: self.modal,
      width: self.width,
      show: {effect: 'fade', duration: self.fade_in_duration},
      beforeClose: function() {
        self.close();
      },
    });

    if (self.timeout) {
      self.startProgress();
    }

    return this;
  };

  global.InfoDialog = InfoDialog;

  function parse_params(data) {
    var params = {};

    if (data) {
      $.each(data.split('&'), function(i, v) {
        var pair = v.split('=');
        return (params[pair[0]] = pair[1]);
      });
    }
    return params;
  }

  function parse_url(value) {
    var parser = document.createElement('a');
    parser.href = value;

    return {
      protocol: parser.protocol,
      hostname: parser.hostname,
      port: parser.port,
      host: parser.host,
      pathname: parser.pathname,
      hash: parser.hash,
      params: parse_params(parser.search.substr(1)),
    };
  }

  function encode_url_object(url) {
    // currently only local urls are supported
    return url.pathname + '?' + $.param(url.params);
  }

  function init_omp_dialog(options) {
    var params;
    var reload_data;

    var cmd = options.element.data('cmd');
    var type_id = options.element.data('id');
    var type_name = options.element.data('type');
    var extra = options.element.data('extra');
    var done = options.element.data('done');
    var task_id = options.element.data('task_id');
    var parent_dialog = options.element.parents('.dialog-form')[0];
    var reload_type = options.element.data('reload');
    var height = options.element.data('height');
    var close_reload_type = options.element.data('close-reload');
    var dialog_id = options.element.data('dialog-id');

    if (!is_defined(reload_type)) {
      reload_type = options.default_reload;
    }

    if (reload_type === 'dialog') {
      reload_data = options.element.find('.success-dialog');
    }

    if (done) {
      // done is used to add newly created elements to the dialog
      // therefore we must not reload anything
      reload_type = 'done';
      reload_data = done;
    }

    if (!is_defined(cmd)) {
      cmd = options.type + '_' + type_name;

      if (options.postfix !== undefined) {
        cmd = cmd + '_' + options.postfix;
      }
    }

    params = parse_params(extra);

    if (is_defined(type_id)) {
      params[type_name + '_id'] = type_id;
    }

    if (is_defined(task_id)) {
      params.task_id = task_id;
    }

    function show_dialog(callback) {
      new OMPDialog({
        cmd: cmd,
        done: done,
        params: params,
        success_reload: {type: reload_type, data: reload_data},
        close_reload: {type: close_reload_type},
        parent_dialog: parent_dialog,
        height: height,
        dialog_id: dialog_id,
      }).show(options.button, callback);
    }

    if (options.listeners !== true) {
      options.element.on('click', function(event) {
        event.preventDefault();
        show_dialog();
      });

      options.element.on('keydown', function(event) {
        console.log('keydown');
        if (event.which === $.ui.keyCode.ENTER) {
          event.stopPropagation();
          show_dialog();
        }
      });
    }

    return show_dialog;
  }

  function ToggleIcon(options) {
    this.name = options.name;
    this.target = options.target;
    this.icon = options.icon;
    this.variable = options.variable;
    this.collapsed = options.collapsed !== undefined ?
      !!options.collapsed : false;
    this.storage = localStorage;
  }

  ToggleIcon.prototype.init = function() {
    if (this.variable) {
      if (this.storage.getItem(this.variable) === 'true' ||
          (this.storage.getItem(this.variable) === null && this.collapsed)) {
        this.target.hide();
        this.toggleIcon();
      }
    }
  };

  ToggleIcon.prototype.toggleIcon = function() {
    // manage the button itself
    this.icon.toggleClass('expand');
    if (this.icon.hasClass('expand')) {
      this.icon.attr({
        src:   '/img/unfold.png',
        title: gsa._('Unfold {{name}}', {name: this.name}),
        alt:   gsa._('Unfold {{name}}', {name: this.name}),
      });
    } else {
      this.icon.attr({
        src:   '/img/fold.png',
        title: gsa._('Fold {{name}}', {name: this.name}),
        alt:   gsa._('Fold {{name}}', {name: this.name}),
      });
    }
  };

  ToggleIcon.prototype.toggle = function() {
    // Update the localStorage
    if (this.variable) {
      if (this.storage.getItem(this.variable) === 'true') {
        // visible
        this.storage.setItem(this.variable, 'false');
      }
      else {
        // hidden
        this.storage.setItem(this.variable, 'true');
      }
    }
    this.target.slideToggle();
    this.toggleIcon();
  };

  function OMPAction(options) {
    this.params = options.params === undefined ? {} : options.params;
    this.form = options.form;
  }

  OMPAction.prototype.do = function() {
    var self = this;
    var data = new FormData(this.form);
    for (var param in this.params) {
      if (param === 'xml' || param === 'no_redirect') {
        // skip values
        continue;
      }
      data.append(param, this.params[param]);
    }
    data.append('xml', 1);
    data.append('no_redirect', 1);

    self.request_data = {
      url: '/omp',
      data: data,
      cache: false,
      processData: false,
      contentType: false,
      type: 'POST',
    };

    function done_func(data, status, jqXHR) {
      self.success(data, status, jqXHR);
    }
    function fail_func(jqXHR) {
      self.fail(jqXHR);
    }

    $.ajax(self.request_data).done(done_func).fail(fail_func);
  };

  function OMPDialogAction(options) {
    OMPAction.call(this, options);
    this.dialog = options.dialog.$omp;
  }

  gsa.derive(OMPDialogAction, OMPAction);

  OMPDialogAction.prototype.success = function() {
    this.dialog.reload();
  };

  OMPDialogAction.prototype.fail = function(jqXHR) {
    this.dialog.setErrorFromResponse(jqXHR);
  };

  function on_ready(doc) {
    doc = $(doc);

    doc.find('.edit-action-icon').each(function() {
      init_omp_dialog({
        type: 'edit',
        element: $(this),
        default_reload: 'window',
        button: gsa._('Save')
      });
    });

    doc.find('.new-action-icon').each(function() {
      init_omp_dialog({
        type: 'new',
        element: $(this),
        default_reload: 'next',
        button: gsa._('Create'),
      });
    });

    doc.find('.upload-action-icon').each(function() {
      init_omp_dialog({
        type: 'upload',
        element: $(this),
        button: gsa._('Create'),
      });
    });

    doc.find('.delete-action-icon').each(function() {
      init_omp_dialog({
        type: 'delete',
        element: $(this),
        button: gsa._('Delete'),
        default_reload: 'window',
        postfix: 'confirm',
      });
    });

    doc.find('.dialog-action').each(function() {
      var elem = $(this);
      elem.on('click', function(event) {
        event.preventDefault();
        new OMPDialogAction({dialog: elem.parents('.dialog-form')[0],
          params: parse_params(elem.data('extra')),
          form: elem.parents('form')[0],
        }).do();
      });
    });

    doc.find('.bulk-dialog-icon').each(function() {
      var elem = $(this);
      var type_name = elem.data('type');
      var done = elem.data('done');

      var reload;
      var params = {
        resource_type: type_name,
      };
      params [this.name + '.x'] = '0';

      elem.on('click', function(event) {
        event.preventDefault();
        var form = elem.closest('form');
        form.find(':input').each(function() {
          if (this.getAttribute('type') !== 'image' &&
                  (this.getAttribute('type') !== 'checkbox' || this.checked)) {
            params[this.name] = this.value;
          }
        });
        if (done === undefined) {
          reload = 'window';
        }
        new OMPDialog({
          cmd: 'process_bulk',
          done: done,
          params: params,
          show_method: 'POST',
          success_reload: {type: reload},
          height: elem.data('height'),
        }).show('OK', 'confirmation');
      });
    });

    doc.find('.wizard-action-icon').each(function() {
      var elem = $(this);
      var name = elem.data('name');
      var params = {name: name};
      var dialog_id = elem.data('dialog-id');

      var dialog = new OMPDialog({
        cmd: 'wizard',
        success_reload: {type: 'window'},
        params: params,
        height: elem.data('height'),
        dialog_id: dialog_id,
      });

      if (name === 'quick_first_scan') {
        dialog.old_postForm = dialog.postForm;
        dialog.postForm = function() {
          this.old_postForm();
          // set 30 sec.
          localStorage.setItem('autorefresh-interval', 30);
        };
      }

      elem.on('click', function(event) {
        event.preventDefault();
        dialog.show(elem.data('button'));
      });
    });

    // Replace icon forms
    doc.find('.ajax-post').each(function() {
      var elem = $(this);
      elem.on('click', function(event) {
        event.preventDefault();

        var form = elem.parents('form');
        var form_data = new FormData(form[0]);

        form_data.set('xml','1');
        form_data.set('next_xml','0');
        form_data.set('no_redirect','1');

        var request_data = {
          url: '/omp',
          data: form_data,
          cache: false,
          processData: false,
          contentType: false,
          type: 'POST',
        };

        var done_func = function(response_doc) {
          var action_result = $(response_doc).find('action_result');

          var next_url = action_result.children('next').text();
          if (gsa.is_defined(next_url) && next_url !== '') {
            window.location = next_url;
          }
        };

        var fail_func = function(jqXHR) {
          var action_result = $(jqXHR.responseXML).find('action_result');

          var error_div = $('<div class="ui-state-error ui-corner-all"/>');

          var error_title = 'Action "' +
                            action_result.children('action').text() +
                            '" failed';
          var error_status = action_result.children('status').text();
          var error_message = action_result.children('message').text();

          $('<div><b>' + error_title + '</b></div>')
            .appendTo(error_div);
          $('<div><b>' + error_status + ': </b>' + error_message + '</div>')
            .appendTo(error_div);

          new InfoDialog({
            element: $('<div/>').append(error_div),
            timeout: 15000,
            width: 500,
            modal: true,
            fade_in_duration: 250,
          }).show();
        };

        $.ajax(request_data)
          .done(done_func)
          .fail(fail_func);
      });
    });

    doc.find('.edit-filter-action-icon').each(function() {
      var elem = $(this);
      var id = elem.data('id');
      elem.on('click', function(event) {
        event.preventDefault();
        new FilterDialog(id, gsa._('Update Filter')).show();
      });
    });

    doc.find('.info-dialog').each(function() {
      var elem = $(this);
      new InfoDialog({
        element: elem,
        timeout: elem.data('timeout'),
        width: elem.data('width'),
        transfer_to: elem.data('transfer-to'),
      }).show();
    });

    doc.find('.datepicker').each(function() {
      var elem = $(this);
      var button = elem.find('.datepicker-button').first();
      var tooltip = gsa._('Select date') + '';
      var elem_year = elem.find('.datepicker-year');
      var elem_month = elem.find('.datepicker-month');
      var elem_day = elem.find('.datepicker-day');
      var cur_date = new Date();

      if (elem_year.length && is_defined(elem_year.val())) {
        var year = parseInt(elem_year.val(), 10);
        cur_date.setFullYear(year);
      }
      if (elem_month.length && is_defined(elem_month.val())) {
        var month = parseInt(elem_month.val(), 10);
        if (month > 0) {
          cur_date.setMonth(month - 1); // js Date uses 0-11 for month value
        }
      }
      if (elem_day.length && is_defined(elem_day.val())) {
        var day = parseInt(elem_day.val(), 10);
        if (day > 0) {
          cur_date.setDate(day);
        }
      }

      button.datepicker({
        showOn: 'button',
        buttonImage: 'img/calendar.png',
        buttonImageOnly: true,
        buttonText: tooltip,
        dateFormat: 'DD, d MM, yy',
        minDate: cur_date,
        maxDate: '+3Y',
        onClose: function() {
          var date = button.datepicker('getDate');
          if (has_value(date)) {
            elem_day.val(date.getDate());
            elem_month.val(date.getMonth() + 1);
            elem_year.val(date.getFullYear());
          }
        },
      });
      button.datepicker('setDate', cur_date);

      /* don't allow to change value_field by user */
      button.prop('readonly', true);
      button.attr('title', tooltip);

      button.on('click', function() {
        /* show datepicker when clicking on deactivated button */
        button.datepicker('show');
      });

      button.on('keydown', function(event) {
        if (event.which === $.ui.keyCode.ENTER) {
          /* show datepicker on enter */
          event.stopPropagation();
          button.datepicker('show');
        }
      });
    });

    doc.find('.setting-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var setting = elem.data('setting');
      var input_name = 'settings_changed:' + setting;
      var changed_input = form.children('input[name="' + input_name + '"]');
      var event;

      switch (elem.attr('type')) {
        case 'text':
        case 'password':
          event = 'keyup';
          break;
        case 'radio':
          event = 'click';
          break;
        default:
          event = 'change';
      }

      if (changed_input.length === 0) {
        changed_input = $('<input/>',
          {
            name: input_name,
            type: 'hidden',
            value: 0,
          }).appendTo(form);
      }
      // Add input elements to indicate that a setting was changed
      elem.on(event, function() {
          changed_input.attr('value', 1);
        });
    });

    var autorefresh = doc.find('#autorefresh');
    if (autorefresh.length) {
      if (localStorage.getItem('autorefresh-interval')) {
        autorefresh.val(localStorage.getItem('autorefresh-interval'));
      }
      autorefresh.change(function() {
        stop_auto_refresh();
        localStorage.setItem('autorefresh-interval', $(this).val());
        start_auto_refresh();
      });
      if (!global.autorefresh_enabled) {
        autorefresh.prop('disabled', 'disabled');
      }
    }

    doc.find('.toggle-action-icon').each(function() {
      var elem = $(this);
      var ticon = new ToggleIcon({
        target: doc.find(elem.data('target')),
        icon: elem.find('img'),
        name: elem.data('name'),
        collapsed: elem.data('collapsed'),
        variable: elem.data('variable'),
      });

      ticon.init();

      elem.on('click', function() {
        ticon.toggle();
      });
    });

    /**
     * Initializes input fields only if its not a radio and not a checkbox
     * element or if radio/checkbox is selected or it is the only element with
     * the name attribute.
     *
     * This avoids calling the func several times with invalid value for
     * checkboxes and radios.
     */
    function init_input(elem, func) {
      var form = elem.parents('form');
      var name = elem.attr('name');
      var group = form.find('[name=' + name + ']');

      if ((elem.attr('type') !== 'radio' && elem.attr('type') !== 'checkbox') ||
          elem.prop('checked') || group.length === 1) {
        func();
      }
    }

    doc.find('input.spinner').spinner();

    doc.find('.slider').slider();

    doc.find('select:not(.no-select2)').select2();

    doc.find('.form-selection-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var name = elem.attr('id');

      function on_change() {
        var value;
        var option;

        if (elem.attr('type') === 'radio' || elem.attr('type') === 'checkbox') {
          option = elem;
        }
        else {
          option = elem.find(':selected');
        }

        if (is_defined(option)) {
          value = option.data('select');
        }

        if (!has_value(value)) {
          /* fallback to elem.val() if data-select is not set or option not
           * found */
          value = elem.val();
        }

        /* hide all elements of the selection */
        form.find('.form-selection-input-' + name).prop('disabled', true);
        form.find('.form-selection-item-' + name).hide();

        if (is_defined(value)) {
          /* show elements wich have the selected value css class set */

          form.find('.form-selection-input-' + name + '--' + value).prop(
              'disabled', false);
          form.find('.form-selection-item-' + name + '--' + value).show();
        }
      }

      elem.on('change', on_change);

      init_input(elem, on_change);
    });

    doc.find('.form-enable-control').each(function() {
      var elem = $(this);
      var form = elem.parents('form');
      var name = elem.attr('id');
      var disable = is_defined(elem.attr('disable-on')) ?
        elem.attr('disable-on') : '1';
      var use_checked = false;

      if (disable === ':checked') {
        disable = true;
        use_checked = true;
      }
      else if (disable === 'not(:checked)') {
        disable = false;
        use_checked = true;
      }

      function on_change() {
        var value = elem.val();

        if (use_checked && elem.attr('type') === 'checkbox') {
          value = elem.prop('checked');
        }

        form.find('.form-enable-item--' + name).each(function() {
          var cur = $(this);
          if (cur.hasClass('spinner')) {
            cur.spinner('option', 'disabled', value === disable);
          }
          else {
            cur.prop('disabled', value === disable);
          }
        });
      }

      elem.on('change', on_change);

      init_input(elem, on_change);
    });

    doc.find('a.external').on('click', function(event) {
      event.preventDefault(); // prevent opening url

      var url = $(this).attr('href');

      var p = $('<p/>').append($('<span/>', {
        'class': 'ui-icon ui-icon-alert',
        style: 'float: left; margin: 0 15px 15px 0;',
      }));
      var dialog = $('<div/>', {
        'class': 'dialog-form',
        title: gsa._('Follow link?'),
      }).append(p);

      p.append(gsa._('This dialog will open a new window for <a>{{url}}</a> ' +
            'if you click on follow link. Following this link is on your own ' +
            'responsibility. Greenbone doesn\'t endorse the content you will ' +
            'see there.', {url: url}));

      var close = '' + gsa._('Abort');
      var follow = '' + gsa._('Follow link');
      var buttons = {};

      buttons[close] = function() {
        $(this).dialog('close');
      };
      buttons[follow] = function() {
        window.open(url);
        $(this).dialog('close');
      };

      dialog.dialog({
        modal: true,
        width: 600,
        maxHeight: 400,
        buttons: buttons,
      });
    });
  }

  var timeout_id;

  function start_auto_refresh() {
    if ($('.dialog-form').length > 0) {
      // Still open dialogs.
      return;
    }
    if (!timeout_id && +localStorage.getItem('autorefresh-interval') &&
        global.autorefresh_enabled) {
      timeout_id = global.setTimeout(function() {
        location.reload();
      }, localStorage.getItem('autorefresh-interval') * 1000);
    }
  }

  function stop_auto_refresh() {
    if (timeout_id !== undefined) {
      clearTimeout(timeout_id);
      timeout_id = undefined;
    }
  }

  $(document).ready(function() {

    // generic widget pimping
    on_ready(document);

    $(window).on('scroll', function() {
      var h_height = $('#gb_header').height();
      var scroll = $(window).scrollTop();
      $('.gsa-head').toggleClass('sticky', scroll > h_height);
    });

    $(window).trigger('scroll');

    // autorefresh
    start_auto_refresh();
  });

})(window, window.document, window.$, window.console, window.localStorage,
  window.location);
// vim: set ts=2 sw=2 tw=80:
