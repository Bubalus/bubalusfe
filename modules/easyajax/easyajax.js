// --------------------------------------------
// BubalusFE - The front-end development framework
//
/* easyAjax.js - 弹出通知 */
// --------------------------------------------

+(function($, undefined) { "use strict";
	$(document).on('click.BFE.easyAjax', '[data-trigger="easyAjax"]', function(){
		var $this = $(this),
			data = $this.data(),
			$target,
			spinner;

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

/* END easyAjax.js */
