// --------------------------------------------
// BubalusFE - The front-end development framework
//
/* alertTip.js - 弹出通知 */
// --------------------------------------------

+function($) { "use strict";
	$.alertTip = function( message , options ) {
		// 如果 alertTip 容器不存在，就先創建一個
		if ( $('#alertTip').size() == 0 )
			$('<div id="alertTip"></div>').addClass( (options && options.position) ? options.position : $.alertTip.defaults.position ).appendTo('body');

		$('#alertTip').alertTip(message,options);
	};


	$.fn.alertTip = function( message , options ) {
		if ( $.isFunction(this.each) ) {
			var args = arguments;

			return this.each(function() {
				if ( $(this).data('alertTip.instance') == undefined ) {
					$(this).data('alertTip.instance', $.extend( new $.fn.alertTip(), { notifications: [], element: null, interval: null } ));
					$(this).data('alertTip.instance').startup( this );
				}

				if ( $.isFunction($(this).data('alertTip.instance')[message]) ) {
					$(this).data('alertTip.instance')[message].apply( $(this).data('alertTip.instance') , $.makeArray(args).slice(1) );
				} else {
					$(this).data('alertTip.instance').create( message , options );
				}
			});
		};
	};

	$.extend( $.fn.alertTip.prototype , {
		defaults: {
			pool:				0, // 单组同时显示的数量限制
			header:				'', // 标题
			group:				'', // 为每个 alertTip 添加一个类，用于逻辑分组和统一样式
			sticky:				false, // 设置为true时，该实例将停留到用户手动关闭为止
			position: 			'top-right', // 弹出位置
			glue:				'after', // 在系列中置顶或沉底 after | before
			theme:				'', // 指定样式
			life:				3000, // 生命值 毫秒
			closeDuration: 		'normal', // 关闭动画速度
			openDuration: 		'normal', // 打开动画速度
			easing: 			'swing', // 动画类型
			closer: 			true, // 是否在多条 alert 时显示批量关闭按钮
			closeTemplate: 		'&times;', // 关闭键模板
			closerTemplate: 	'<div>[ close all ]</div>', // 全部关闭按钮模板
			log:				function() {}, // 日志回调
			beforeOpen:			function() {}, // 弹出之前回调
			afterOpen:			function() {}, // 弹出之后回调
			open:				function() {}, // 弹出时回调
			beforeClose: 		function() {}, // 关闭之前回调
			close:				function() {}, // 关闭时回调
			animateOpen: 		{ // 弹出时动画样式
				opacity:	 'show'
			},
			animateClose: 		{ // 关闭时动画样式
				opacity:	 'hide'
			}
		},

		notifications: [],

		element:	 null,

		interval:   null,

		create:	 function( message , options ) {
			var options = $.extend({}, this.defaults, options);

			this.notifications.push({ message: message , options: options });

			options.log.apply( this.element , [this.element,message,options] );
		},

		render:	 function( notification ) {
			var self = this;
			var message = notification.message;
			var options = notification.options;

			var notification = $('<div/>')
				.addClass('alertTip ' + options.theme + ((options.group != undefined && options.group != '') ? ' ' + options.group : ''))
				.append($('<button/>').addClass('close-btn').attr('type','button').html(options.closeTemplate))
				.append($('<h4/>').html(options.header))
				.append($('<p/>').html(message))
				.data("alertTip", options).addClass(options.theme).children('.close-btn').bind("click.alertTip", function() {
					$(this).parent().trigger('alertTip.beforeClose');
				})
				.parent();

			$(notification).bind("mouseover.alertTip", function() {
				$('.alertTip', self.element).data("alertTip.pause", true);
			}).bind("mouseout.alertTip", function() {
				$('.alertTip', self.element).data("alertTip.pause", false);
			}).bind('alertTip.beforeOpen', function() {
				if ( options.beforeOpen.apply( notification , [notification,message,options,self.element] ) !== false ) {
					$(this).trigger('alertTip.open');
				}
			}).bind('alertTip.open', function() {
				if ( options.open.apply( notification , [notification,message,options,self.element] ) !== false ) {
					if ( options.glue == 'after' ) {
						$('.alertTip:last', self.element).after(notification);
					} else {
						$('.alertTip:first', self.element).before(notification);
					}

					$(this).animate(options.animateOpen, options.openDuration, options.easing, function() {
						if ($.support.opacity === false)
							this.style.removeAttribute('filter');

						if ( $(this).data("alertTip") !== null )
							$(this).data("alertTip").created = new Date();

						$(this).trigger('alertTip.afterOpen');
					});
				}
			}).bind('alertTip.afterOpen', function() {
				options.afterOpen.apply( notification , [notification,message,options,self.element] );
			}).bind('alertTip.beforeClose', function() {
				if ( options.beforeClose.apply( notification , [notification,message,options,self.element] ) !== false )
					$(this).trigger('alertTip.close-btn');
			}).bind('alertTip.close-btn', function() {
				$(this).data('alertTip.pause', true);
				$(this).animate(options.animateClose, options.closeDuration, options.easing, function() {
					if ( $.isFunction(options.close) ) {
						if ( options.close.apply( notification , [notification,message,options,self.element] ) !== false )
							$(this).remove();
					} else {
						$(this).remove();
					}
				});
			}).trigger('alertTip.beforeOpen');

			if ( $('.alertTip:parent', self.element).size() > 1 &&
				 $('.alertTip-closer', self.element).size() == 0 && this.defaults.closer !== false ) {
				 $(this.defaults.closerTemplate).addClass('alertTip-closer ').addClass(this.defaults.theme)
					.appendTo(self.element).animate(this.defaults.animateOpen, this.defaults.speed, this.defaults.easing)
					.bind("click.alertTip", function() {
						$(this).siblings().trigger("alertTip.beforeClose");

						if ( $.isFunction( self.defaults.closer ) ) {
							self.defaults.closer.apply( $(this).parent()[0] , [$(this).parent()[0]] );
						}
					});
			};
		},

		update:	 function() {
			$(this.element).find('.alertTip:parent').each( function() {
				if ( $(this).data("alertTip") != undefined && $(this).data("alertTip").created !== undefined &&
					 ($(this).data("alertTip").created.getTime() + parseInt($(this).data("alertTip").life))  < (new Date()).getTime() &&
					 $(this).data("alertTip").sticky !== true &&
					 ($(this).data("alertTip.pause") == undefined || $(this).data("alertTip.pause") !== true) ) {

					$(this).trigger('alertTip.beforeClose');
				}
			});

			if ( this.notifications.length > 0 &&
				 (this.defaults.pool == 0 || $(this.element).find('.alertTip:parent').size() < this.defaults.pool) )
				this.render( this.notifications.shift() );

			if ( $(this.element).find('.alertTip:parent').size() < 2 ) {
				$(this.element).find('.alertTip-closer').animate(this.defaults.animateClose, this.defaults.speed, this.defaults.easing, function() {
					$(this).remove();
				});
			}
		},

		startup:	function(e) {
			this.element = $(e).addClass('alertTip-area').append('<div class="alertTip"></div>');
			this.interval = setInterval( function() {
				$(e).data('alertTip.instance').update();
			}, parseInt(250));

		},

		shutdown:   function() {
			$(this.element).removeClass('alertTip-area')
				.find('.alertTip').trigger('alertTip.close')
				.parent().empty()

			clearInterval(this.interval);
		},

		close:	 function() {
			$(this.element).find('.alertTip').each(function(){
				$(this).trigger('alertTip.beforeClose');
			});
		}
	});

	$.alertTip.defaults = $.fn.alertTip.prototype.defaults;

	$(document).on('click.BFE.alertTip', '[data-trigger=alertTip]', function (e) {
		var $this = $(this)
		var $header = $this.data('header')
		var $message = $this.data('message')
		var $theme = $this.data('theme')
		var $wrapper = $this.data('wrapper')
		var $sticky = $this.data('sticky')

		if ($wrapper == null){
			$.alertTip($message, { 
				header: $header,
				theme: $theme,
				sticky: $sticky
			});
		}else{
			if ( $('#' + $wrapper).size() == 0 ){
				$('<div/>').attr('id',$wrapper).addClass('alertTip-area').appendTo('body');
			}

			$('#' + $wrapper).alertTip($message, { 
				header: $header,
				theme: $theme,
				sticky: $sticky
			});
		}
	})

}(jQuery);

/* END alertTip.js */