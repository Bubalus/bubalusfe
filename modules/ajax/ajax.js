+(function($, undefined) {
	"use strict";

	$(document).on('click.scojs_ajax', '[data-trigger="ajax"]', function() {
		var $this = $(this)
			,data = $this.data()
			,$target
			,spinner
			;
		if (typeof data['target'] != 'undefined') {
			$target = $(data['target']);
			if (typeof Spinner == 'function') {
				spinner = new Spinner({color: '#3d9bce'}).spin($target[0]);
			}
			$target.load($this.attr('href'), function() {
				if (spinner) {
					spinner.stop();
				}
			});
			return false;
		}
	});
})(jQuery);
