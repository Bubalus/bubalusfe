+function ($) { "use strict";

  // BUTTON PUBLIC CLASS DEFINITION
  // ==============================

  var Button = function (element, options) {
    this.$element = $(element)
    this.options  = $.extend({}, Button.DEFAULTS, options)
  }

  Button.DEFAULTS = {
    loadingText: 'loading...'
  }

  Button.prototype.setState = function (state) {
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
  $.fn.button = function (option) {
    return this.each(function () {
      var $this   = $(this)
      var data    = $this.data('bs.button')
      var options = typeof option == 'object' && option

      if (!data) $this.data('bs.button', (data = new Button(this, options)))

      if (option) data.setState(option)
    })
  }

  // BUTTON DATA-API
  // ===============

  $(document).on('click.button', '[data-loading-text]', function (e) {
    var btn = $(this),
        timeout = btn.data('set-timeout');
    btn.button('loading')
    setTimeout(function () {
      btn.button('complete')
    }, timeout)
  })

}(window.jQuery);
