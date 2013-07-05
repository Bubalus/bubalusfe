$.bubalusToolsStep = {};
(function($){
	$.fn.bubalusToolsStep = function(bts_settings) {
		bts_settings = jQuery.extend({
			finish:true,
			onBack:function(index) { return true; },
			onNext:function(index) { return true; }
		}, bts_settings);
			
		$global = $(this);

		var id = $global.attr('id'),
			steps = $global.children('.BTStep_container'),
			name = $global.children('.BTStep_box_title'),
			size = steps.size(),
			description	= '',
			title = '',
			step,
			$titles = $('<ul class="BTStep_titles"></ul>').appendTo(name);

        steps.each(function(index) {
        	step = $(this);

        	step.attr('id', id + '-step-' + index)
        		.addClass('step')
        		.append('<div id="' + id + '-buttons-' + index + '" class="buttonHolder"></div>');

        	title = (step.attr('steps-value') != '') ? step.attr('steps-value') : '--';

        	description = step.children('.BTStep_name').html();

        	$titles.append('<li id="' + id + '-title-' + index + '"><span><b>' + title  + '.</b>' + description + '</span></li>');

        	if (index == 0) {
        		createNextButton(index);
        	} else {
        		createBackButton(index);
        		step.hide();

        		if (index != size - 1) {
	        		createNextButton(index);
	        	}
        	}
        });

        $titles.children('li:first').addClass('selected');

        var finish = $global.children('.finish'),
        	$this	= $global;

		if (bts_settings.finish && finish.length) {
        	finish.hide().appendTo($global.find('.buttonHolder:last'));
        }

		$titles.children().click(function() {
			var clicked = parseInt($(this).attr('id').match(/\d/)),
				current = parseInt($titles.children('.selected').attr('id').match(/\d/)),
				maxStep = clicked;

			if (clicked > current) {
				if (isStopCallback(bts_settings.onNext, clicked)) return;
				maxStep = getMaxStep($this, bts_settings, clicked);
			} else if (clicked < current) {
				if (isStopCallback(bts_settings.onBack, clicked)) return;
			}

			if (clicked != current) {
				selectStep($this, maxStep);

				if (bts_settings.finish && maxStep + 1 == size) {
					finish.show();
				}
			}
		});

        function isStopCallback(callback, clicked) {
        	var isValid = callback.apply($this, [clicked + 1]);

        	if (isValid || isValid === undefined) { 
				return false;
			}
        	
        	return true;
        };

        function createBackButton(index) {
        	$('<a/>', {
        		id: id + '-back-' + index,
        		href: 'javascript:void(0);',
        		'class': 'secondaryAction',
        		html: '&larr; 返回'
        	})
        	.click(function() {
        		if (!isStopCallback(bts_settings.onBack, index - 1)) {
	                selectStep($this, index - 1);
	                finish.hide();
        		}
            })
        	.appendTo($('#' + id + '-buttons-' + index));

        };

        function createNextButton(index) {
        	$('<a/>', {
        		id: id + '-next-' + index,
        		href: 'javascript:void(0);',
        		'class': 'primaryAction',
        		html: '下一步 &gt;'
        	})
        	.click(function() {
        		if (!isStopCallback(bts_settings.onNext, index + 1)) {
	        		var maxStep	= getMaxStep($this, bts_settings, index + 1);
	
					selectStep($this, maxStep);
	
			        if (bts_settings.finish && maxStep + 1 == size) {
	                	finish.show();
	                }
        		}
            })
            .appendTo($('#' + id + '-buttons-' + index));
        };

        function getMaxStep(context, bts_settings, clicked) {
        	var maxStep = clicked,
        		isValid = true;
				
        	return maxStep;
        };

		return $global;
		
	}
	$.fn.bubalusToolsStep.step = function(index, id) {
		selectStep(getContext(index, id, 'step'), index - 1);
		$.fn.bubalusToolsStep;
	};

	function getContext(value, id, name) {
		var context = $global;

		if (id) {
			context	= $(id);

			if (!context.length) {
				return;
			}
		}

		return context;
	};

	function selectStep(context, index) {
		var id = context.attr('id'),
			size = context.children('.BTStep_container').size(),
			step;

		if (index > size - 1) {
			index = size - 1;
		}

		context
			.children('.BTStep_container').hide()
		.end()
			.children('.BTStep_container')
				.eq(index).show();

		context
			.find('.BTStep_titles')
				.children().removeClass('selected')
			.end()
			.children()
				.eq(index).addClass('selected')

        if (context.is('form')) {
        	context.children('.BTStep_container')
				.eq(index)
					.find(':input:visible')
						.each(function() {
							step = $(this);
		
							if (!step.attr('disabled')) {
								step.focus();
								return false;
							}
						});
        }
	};

	
})(jQuery);
