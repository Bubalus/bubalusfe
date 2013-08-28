+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var buttonStatus = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, buttonStatus.DEFAULTS, options)
  }

  buttonStatus.DEFAULTS = {
    loadingText: '正在加載...',
    valueText: '加載完成'
  }

  buttonStatus.prototype.setState = function (state) {
    var disabled  = 'disabled'
    var $element  = this.$element
    var val  = $element.is('input') ? 'val' : 'html'
    var data = $element.data()

    state = state + 'Text'

    if (!data.resetText) $element.data('resetText', $element[val]())

    $element[val](data[state] || this.options[state])

    // push to event loop to allow forms to submit
    setTimeout(function () {
      state == 'loadingText' ?
        $element.addClass(disabled).attr(disabled, disabled) :
        $element.removeClass(disabled).removeAttr(disabled);
    }, 0)
  }

  // BUTTON PLUGIN DEFINITION
  // ========================
  $.fn.buttonStatus = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('BFE.buttonStatus')
      var options = typeof option == 'object' && option

      if (!data) $this.data('BFE.buttonStatus', (data = new buttonStatus(this, options)))

      if (option) data.setState(option)
    })
  }

}(window.jQuery);
