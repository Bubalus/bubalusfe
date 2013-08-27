// ajax 加载提示
$.bubalusToolsLoader = {};
(function($) {
	$.bubalusToolsLoader = function(settings) {
		settings = jQuery.extend({
			show_mode:'mouse', //显示模式 rightTop/mouse 可以显示在右上角或跟随鼠标
			animation_speed: 'fast', //淡入淡出的速度
			bind_to_ajax: true,  //绑定ajax
			delay: false, 
			offset_top: 13, 
			offset_left: 10,
			theme:'default', //方便以后扩展加载样式
			loader_content: '正在卖力的加载中 ...'
		}, settings);
		
		scrollPos = _getScroll();

		if(settings.bind_to_ajax)
			jQuery(document).ajaxStart(function(){ $.bubalusToolsLoader.show() }).ajaxStop(function(){ $.bubalusToolsLoader.hide() });

		$.bubalusToolsLoader.positionLoader = function(e){
			if(settings.show_mode == 'rightTop'){
				$('.bubalusToolsLoader').css({
					'position': 'fixed',
					'top':34,
					'right':4
				});
				if($.browser.msie && $.browser.version == 6) {
					top_pos = scrollPos['scrollTop']+34;
					$('.bubalusToolsLoader').css({
						'position': 'absolute',
						'top':top_pos
					});
				}
			}else if(settings.show_mode == 'mouse') {
				e = e ? e : window.event;
				cur_x = (e.clientX) ? e.clientX : cur_x;
				cur_y = (e.clientY) ? e.clientY : cur_y;
	
				left_pos = cur_x + settings.offset_left + scrollPos['scrollLeft'];
				top_pos = cur_y + settings.offset_top + scrollPos['scrollTop'];
	
				$('.bubalusToolsLoader').css({
					'top':top_pos,
					'left':left_pos
				});
			}
		}
	
		$.bubalusToolsLoader.show = function(delay){
			if($('.bubalusToolsLoader').size() > 0) return;
			scrollPos = _getScroll();
			
			$('<div></div>')
				.addClass('bubalusToolsLoader')
				.addClass('bubalusToolsLoader_'+ settings.theme)
				.appendTo('body')
				.hide();
			$('<p></p>')
				.html(settings.loader_content)
				.appendTo('.bubalusToolsLoader');

			$('.bubalusToolsLoader').fadeIn(settings.animation_speed);

			$(document).bind('click',$.bubalusToolsLoader.positionLoader);
			$(document).bind('mousemove',$.bubalusToolsLoader.positionLoader);
			$(window).scroll(function(){ scrollPos = _getScroll(); $(document).triggerHandler('mousemove'); });
			
			delay = (delay) ? delay : settings.delay;
			
			if(delay){
				setTimeout(function(){ $.bubalusToolsLoader.hide() }, delay);
			}
		};

		$.bubalusToolsLoader.hide = function(){
			$(document).unbind('click',$.bubalusToolsLoader.positionLoader);
			$(document).unbind('mousemove',$.bubalusToolsLoader.positionLoader);
			$(window).unbind('scroll');
						
			$('.bubalusToolsLoader').fadeOut(settings.animation_speed,function(){
				$(this).remove();
			});
		};
		
		function _getScroll(){
			if (self.pageYOffset) {
				return {scrollTop:self.pageYOffset,scrollLeft:self.pageXOffset};
			} else if (document.documentElement && document.documentElement.scrollTop) { // Explorer 6 Strict
				return {scrollTop:document.documentElement.scrollTop,scrollLeft:document.documentElement.scrollLeft};
			} else if (document.body) {// all other Explorers
				return {scrollTop:document.body.scrollTop,scrollLeft:document.body.scrollLeft};
			};
		};
		
		return this;
	};
})(jQuery);