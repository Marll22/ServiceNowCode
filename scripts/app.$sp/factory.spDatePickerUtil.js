/*! RESOURCE: /scripts/app.$sp/factory.spDatePickerUtil.js */
angular
  .module('sn.$sp')
  .factory('spDatePickerUtil', function (spAriaUtil, $window) {
    var enableDateTranslation = $window.NOW.sp.enableDateTranslation;
    var service = {
      isValidDate: isValidDate,
      validate: validate,
      getSPDateickerInput: getSPDateickerInput,
      formattedDate: formattedDate,
      formattedDayTime: formattedDayTime,
      datePickerActionType: datePickerActionType,
      datePickerShowType: datePickerShowType,
      calendarShowType: calendarShowType,
    };
    function getSPDateickerInput(picker) {
      var input;
      if (picker.isInput) {
        return picker.element;
      }
      input = picker.element.find('.datepickerinput');
      if (input.size() === 0) {
        input = picker.element.find('input');
      } else if (!input.is('input')) {
        throw new Error(
          'CSS class "datepickerinput" cannot be applied to non input element'
        );
      }
      return input.parent().prev();
    }
    function formattedDate(picker, date) {
      var format = 'DD MMMM YYYY',
        formattedDate = null,
        a = '',
        s = '';
      if (picker.options.pickTime) {
        if (picker.options.format.indexOf('h') !== -1) {
          a = ' A';
        }
        if (picker.options.format.indexOf('s') !== -1) {
          s = ':ss';
        }
        format += (a ? ' hh' : ' HH') + ':mm' + s + a;
      }
      format += ' dddd';
      if (enableDateTranslation) {
        formattedDate = moment(date).format(format);
      } else {
        formattedDate = moment(date).locale('en').format(format);
      }
      return formattedDate;
    }
    function formattedDayTime(picker, date) {
      var format = '',
        formattedDate = null,
        a = '';
      if (picker.options.pickTime) {
        if (picker.options.format.indexOf('h') !== -1) {
          a = 'A';
        }
        format += a;
      }
      format += ' dddd';
      if (enableDateTranslation) {
        formattedDate = moment(date).format(format);
      } else {
        formattedDate = moment(date).locale('en').format(format);
      }
      return formattedDate;
    }
    function datePickerActionType(action) {
      if (action.indexOf('Hours') !== -1) {
        return 'hour';
      }
      return 'minute';
    }
    function datePickerShowType(picker) {
      if (!picker.options.pickTime) {
        return 'date';
      }
      if (!picker.options.pickDate) {
        return 'time';
      }
      var $this = $(picker.widget.find('.accordion-toggle')[0]);
      return $this.find('.glyphicon-calendar').length !== 0 ? 'time' : 'date';
    }
    function calendarShowType(picker) {
      if (picker.widget.find('.datepicker-days').css('display') == 'block')
        return 'days';
      if (picker.widget.find('.datepicker-months').css('display') == 'block')
        return 'months';
      if (picker.widget.find('.datepicker-years').css('display') == 'block')
        return 'years';
    }
    function isValidDate(value, format) {
      if (value === '') return true;
      if (!enableDateTranslation) {
        moment.locale('en');
      }
      if (typeof format == 'string' && format.indexOf('z') !== -1) {
        return moment(value, format).isValid();
      }
      return moment(value, format, true).isValid();
    }
    function validate(dp, format, formattedDate, isUserEnteredValue, cb) {
      if (formattedDate == null || formattedDate == '') {
        dp.data('DateTimePicker').setValue(new Date());
        return '';
      }
      if (service.isValidDate(formattedDate, format)) {
        if (enableDateTranslation) {
          formattedDate = moment(formattedDate, format).format(format);
        } else {
          formattedDate = moment(formattedDate, format)
            .locale('en')
            .format(format);
        }
        dp.data('DateTimePicker').setDate(moment(formattedDate, format));
        cb();
      } else if (service.isValidDate(formattedDate, moment.ISO_8601)) {
        var date;
        if (isUserEnteredValue) date = moment(formattedDate).clone();
        else date = moment.utc(formattedDate).clone();
        dp.data('DateTimePicker').setDate(date);
        if (enableDateTranslation) {
          formattedDate = date.format(format);
        } else {
          formattedDate = date.locale('en').format(format);
        }
        cb();
      } else {
        cb(true);
      }
      return formattedDate;
    }
    return service;
  })
  .run(function ($rootScope) {
    if (typeof moment !== 'undefined' && typeof moment.tz !== 'undefined') {
      var startOfWeek = parseInt(g_date_picker_first_day_of_week);
      var updateStartOfWeek = function () {
        if (moment.localeData()._week.dow != startOfWeek) {
          moment.updateLocale(g_lang, {
            week: {
              dow: startOfWeek,
            },
          });
        }
      };
      if (isNaN(startOfWeek) || startOfWeek < 1) {
        startOfWeek = 0;
      } else if (startOfWeek > 7) {
        startOfWeek = 6;
      } else {
        startOfWeek = startOfWeek - 1;
      }
      if (g_lang == 'en') updateStartOfWeek();
      $rootScope.$on('sp.date.depsLoaded', function () {
        updateStartOfWeek();
      });
      moment.tz.setDefault(g_tz);
    }
  });
