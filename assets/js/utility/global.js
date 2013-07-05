/*
 * 全局公共方法
*/
Utility = {
	// Cookie 讀寫
	cookieGet : function (name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' '){
				c = c.substring(1,c.length);
			}
			if (c.indexOf(nameEQ) == 0){
				return c.substring(nameEQ.length,c.length);
			}
		};

		return null;
	},
	cookieSet : function(name,value,days,domain) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+days*24*60*60*1000);
			var expires = '; expires='+date.toGMTString();
		}else{
			var expires = '';
		}
		document.cookie = name+"="+value+expires+"; domain="+domain+"; path=/";
	},
	/* ctrl+enter 提交表單 */ 
	ctrlEnterSub : function(elem, btn) {
		elem.on('keydown', function(e) {
			if (e.ctrlKey && e.keyCode === 13) {
				//防止跟Wind.Util.buttonStatus按键冲突
				elem.blur();
				btn.click();
			}
		});
	},
	// 錨點定位
	hashPos : function(){
		var hash = location.hash.replace('#', '');
		if(hash.indexOf('hashpos') < 0 ) {
			//不匹配
			return;
		}
		var elem = $('#'+hash),					//锚元素
			elem_ot = elem.offset().top,
			doc_st = $(document).scrollTop(),	//
			hh = $('#J_header').height();		//头部高度

		if(elem_ot - doc_st < hh) {
			//锚元素被头部遮住
			$(document).scrollTop(elem_ot - hh);
		}
	},
	// hover显示/隐藏内容
	hoverToggle : function(options) {
		try{
			var elem = options.elem,																//触发元素
					list = options.list,																//隐藏列表
					delay = (options.delay ? options.delay : 200);			//延时

			var timeout;

			elem.on('mouseenter keydown', function (e) {
				//无障碍处理
				if(e.type === 'keydown' && e.keyCode !== 40) {
					//如果不是按的down键，return
					return;
				}else {
					e.preventDefault();
				}

				//清理延时
				timeout && clearTimeout(timeout);

				timeout = setTimeout(function () {
					list.show();

					//回调，传回两个元素
					options.callback && options.callback(elem, list);
				}, delay);
			}).on('mouseleave keydown', function (e) {
				//无障碍处理
				if(e.type === 'keydown' && e.keyCode !== 27) {
					//如果不是按的ESC键，return
					return;
				}else {
					e.preventDefault();
				}
				//鼠标离开
				timeout && clearTimeout(timeout);

				timeout = setTimeout(function () {
					list.hide();
				}, delay);
			});

			list.on('mouseenter', function (e) {
				//清理延时
				timeout && clearTimeout(timeout);
			}).on('mouseleave keydown', function (e) {
				//无障碍处理
				if(e.type === 'keydown' && e.keyCode !== 27) {
					//如果不是按的ESC键，return
					return;
				}else {
					e.preventDefault();
					elem.focus();
				}
				timeout = setTimeout(function () {
					list.hide();
					if(e.type === 'keydown') {
						elem.focus();
					}
				}, delay);
			});
		}catch(e){
				$.error(e);
		}
	},
	// 强制刷新
	reloadPage : function (win) {
		var location = win.location;
		location.href = location.pathname + location.search;
	},
	// 操作通用小气泡提示
	resultTip : function (options) {
		//前台成功提示
		var elem = options.elem || options.follow,			//触发按钮, 曾经是options.follow
			error = options.error,											//正确或错误
			msg = options.msg,													//内容
			follow = options.follow,										//是否跟随显示
			callback = options.callback,								//回调
			zindex = (options.zindex ? options.zindex : 10),			//z值
			cls = (error ? 'warning' : 'success'),			//弹窗class
			_this = this;

		var html = '<span class="pop_showmsg"><span class="' + cls + '">' + msg + '</span></span>';

		//移除重复
		$('#J_resulttip').remove();
		_this.rt_timer && clearTimeout(_this.rt_timer);

		Wind.use('dialog', function(){
			Wind.dialog.html(html, {
				id : 'J_resulttip',
				className : 'pop_showmsg_wrap',
				isMask : false,
				zIndex : zindex,
				callback : function(){
					var resulttip = $('#J_resulttip');

					if(follow){
						//元素上方定位
						var elem_offset_left = elem.offset().left,
							pop_width = resulttip.innerWidth(),
							win_width = $(window).width(),
							left;

						if(win_width - elem_offset_left < pop_width) {
							left = win_width - pop_width
						}else{
							left = elem_offset_left - (pop_width - elem.innerWidth())/2;
						}

						var top = elem.offset().top - resulttip.height() - 15;

						resulttip.css({
							left: left,
							top: top > 0 ? top : elem.offset().top+elem.height() + 15
						});

					}

					_this.rt_timer = setTimeout(function(){
						resulttip.fadeOut(function () {
							resulttip.remove();

							//回调
							callback && callback();
						});
					}, 1500);
				}
			});
		})
	},
	// 表单提交反馈提示（提交按钮旁显示）
	formBtnTips : function(options){
		var error = options.error ? true : false,
				wrap = options.wrap,
				msg = options.msg,
				callback = options.callback;

		wrap.find('.J_tips_btn').remove();
		if(error) {
			//失败
			wrap.append('<span class="tips_icon_error J_tips_btn">'+ msg +'</span>');
		}else{
			//成功
			$('<span class="tips_icon_success J_tips_btn">'+ msg +'</span>').appendTo(wrap).delay(3000).fadeOut('200', function(){
				$(this).remove();

				//回调
				callback && callback();
			});
		}
	},
	postTip : function(options){
		var elem = options.elem,			//定位元素
			msg  = options.msg,				//提示信息
			zindex = options.zindex ? options.zindex : 1,		//z值
			callback = options.callback;		//回调

		var tip = $('<div id="J_posttip_success" class="my_message_success" style="display:none;z-index:'+ zindex +';">'+ msg +'</div>');
		tip.remove();

		tip.appendTo('body').css({
			left : elem.offset().left + (elem.width() - tip.width())/2,
			top : elem.offset().top + (elem.height() - tip.height())/2
		}).fadeIn().delay(1500).fadeOut(function(){
			$(this).remove();
			//回调
			callback && callback();
		});
	},
	// 添加收藏
	addBookmark : function(url,title) {
		if (window.sidebar) {
			window.sidebar.addPanel(title, url,"");
		} else if( document.all ) {
			window.external.AddFavorite( url, title);
		} else if( window.opera && window.print ) {
			return true;
		}
	},
	// 设置首页
	setHome : function(obj,vrl){
		var url=vrl||window.location.href;
		try{obj.style.behavior='url(#default#homepage)';obj.setHomePage(url);}
		catch(e){
			if(window.netscape) {
				try {netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");}
				catch (e) {alert("设置主页的请求被浏览器拒绝！\n请从菜单栏进入 工具->选项 \n在打开窗口中的“常规”选项卡中进行设置");}
			}
		}
	},
	// 字数统计
	TextCount : function(textArea, maxLength){
		var textVal = parseInt(maxLength/2),
		    textEn = $(textArea).val().replace(/[^\x00-\xff]/g, "**").length,
		    val = textVal - parseInt(textEn/2),
			btn = $(textArea).closest("form").find(":submit"), 
			tip = $(textArea).closest("form").find(".count_text"); 
		
		if (val == textVal) { btn.attr("disabled", "disabled").addClass("disabled")}
		if (val <= maxLength && val >= 0 ) {
			btn.removeAttr("disabled").removeClass("disabled");
			tip.html("还能输入 " + "<span class=\"f-color-g\">" + val + "</span>" + " 字");
		}else{
			btn.attr("disabled", "disabled").addClass("disabled");
			tip.html("已经超出 " + "<span class=\"f-color-r\">" + (-val) + "</span>" + " 字");
		}
	},

};



(function () {
	// ie 都不缓存
	if($.browser.msie) {
		
		$.ajaxSetup({
			cache : false
		});
	}

	// 不支持placeholder浏览器下对placeholder进行处理
	if(document.createElement('input').placeholder !== '') {
		$('head').append('<style>.placeholder{color: #aaa;}</style>');
		$('[placeholder]').focus(function() {
			var input = $(this);

			if(input.val() == input.attr('placeholder')) {
				input.val('');
				input.removeClass('placeholder');
			}
		}).blur(function() {
			var input = $(this);
			//密码框空
			if(this.type === 'password') {
				return false;
			}
			if(input.val() == '' || input.val() == input.attr('placeholder')) {
				input.addClass('placeholder');
				input.val(input.attr('placeholder'));
			}
		}).blur().parents('form').submit(function() {
			$(this).find('[placeholder]').each(function() {
				var input = $(this);
				if(input.val() == input.attr('placeholder')) {
					input.val('');
				}
			});
		});
	}


	// select控件关联日期组件
	var date_select = $('.J_date_select');
	if (date_select.length) {
		Wind.use('dateSelect', function () {
			date_select.dateSelect();
		});
	}

	// 全选
	if ($('.J_check_wrap').length) {
		//遍历所有全选框
		$.each($('input.J_check_all'), function (i, o) {
			var $o = $(o),
				check_wrap = $o.parents('.J_check_wrap'), //当前操作区域所有复选框的父标签
				check_all = check_wrap.find('input.J_check_all'), //当前操作区域所有(全选)复选框
				check_items = check_wrap.find('input.J_check'); //当前操作区域所有(非全选)复选框

			//点击全选框
			$o.change(function (e) {
				if ($(this).attr('checked')) {
					//全选
					check_items.attr('checked', true);

					if (check_items.filter(':checked').length === check_items.length) {
						check_all.attr('checked', true); //所有全选打钩
					}

				} else {
					//取消全选
					check_items.removeAttr('checked');
					check_all.removeAttr('checked');
				}
			});

			//点击(非全选)复选框
			check_items.change(function () {
				if ($(this).attr('checked')) {

					if (check_items.filter(':checked').length === check_items.length) {
						check_all.attr('checked', true); //所有全选打钩
					}

				} else {
					check_all.removeAttr('checked'); //取消全选
				}
			});

		});
	}

	// 键盘翻页
	var page_wrap = $('.J_page_wrap');
	if(page_wrap.length && page_wrap.data('key') && !DESIGN_MODE) {
		$(document).on('keyup', function(e){
			var focus_el = $(':focus');
				
			if(focus_el.length) {
				var lowercase = focus_el[0].tagName.toLowerCase();
				if(lowercase == 'textarea' || lowercase == 'input') {
					//如果聚焦于输入框则取消翻页
					return;
				}
			}

			if(e.keyCode == 37) {
				var prev = page_wrap.find('a.J_pages_pre');
				if(prev.length) {
					location.href = prev.attr('href');
				}
			}else if(e.keyCode == 39) {
				var next = page_wrap.find('a.J_pages_next');
				if(next.length) {
					location.href = next.attr('href');
				}
			}
		});
	}

	// 锚点定位
	if(!DESIGN_MODE) {
		Wind.Util.hashPos();
	}

	// input只能输入数字
	$('input.J_input_number').on('keyup', function(){
		var v = $(this).val();
		$(this).val(v.replace(/\D/g,''));
	});

	// 日历组件
	var date_btns = $("input.J_date");
	if(date_btns.length) {
		Wind.use('datePicker',function() {
			date_btns.datePicker();
		});
	}

	// 邮箱自动匹配
	var email_match = $('input.J_email_match');
	if(email_match.length) {
		email_match.attr('autocomplete', 'off');
		Wind.use('emailAutoMatch', function(){
			email_match.emailAutoMatch();
		});
	}

	// 地区组件
	var region_set = $('.J_region_set');
	if(region_set.length) {
		Wind.use('region', function(){
			$('a.J_region_change').region();
		});
	}

	// 代码复制_表单元素
	var clipboard_input = $('a.J_clipboard_input'); //复制按钮
	if(clipboard_input.length) {
		if(!$.browser.msie && !Wind.Util.flashPluginTest(9)) {
			if(confirm('您的浏览器尚未安装flash插件，代码复制不可用！点击确定下载')) {
				location.href = 'http://get.adobe.com/cn/flashplayer/';
			};
			return;
		}

		Wind.use('textCopy', function() {
			for(i=0, len=clipboard_input.length; i<len; i++) {
				var item = $(clipboard_input[i]);
				item.textCopy({
					content : $('#' + item.data('rel')).val()
				});
			}
		});
	}

})();

// 公告滚动
(function(){
	var an_slide_auto = $('ul.J_slide_auto'),
		an_lock = false,											//滚动锁定
		an_timer,
		step_h = an_slide_auto.children().height(),
		an_h = an_slide_auto.height();								//整体高度

	an_slide_auto.hover(function(){
		//鼠标进入，锁定
		an_lock = true;
	}, function(){
		//鼠标进入，解锁 执行
		an_lock = false;
		anMove();
	});
	anMove();

	function anMove(){
		clearTimeout(an_timer);
		if(an_lock || an_h == step_h) {
			//锁定或不超过2行时不执行
			return false;
		}
		var mgtop = parseInt(an_slide_auto.css('marginTop').replace('px', '')),
			mgtop_remove = Math.abs(mgtop) + step_h;

		an_timer = setTimeout(function(){
			if(!an_lock) {
				an_slide_auto.animate({'marginTop' : -mgtop_remove}, function(){
					if(mgtop_remove >= an_h) {
						//重置
						an_slide_auto.css('marginTop', 0);
					}
					anMove();
				});
			}
		}, 5000);
	}
})();

// 回到顶部
(function () {
    var back_top_btn = $('#back_top');
    if ($.browser.msie && $.browser.version < 7) {
        back_top_btn.remove();
        return; //ie6不支持回到顶部
    }
    if (back_top_btn.length) {
        var scrollTimer;
        $(window).scroll(function () {
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(function () {
                var scrollTop = $(this).scrollTop();
                if (scrollTop > 400) {
                    back_top_btn.fadeIn();
                } else {
                    back_top_btn.fadeOut();
                }
            }, 100);
        });
        back_top_btn.on('click', function (e) {
            e.preventDefault();
            $('body,html').animate({
                scrollTop: 0
            }, 400);
        });
    }
})();

// ios/android兼容mouse事件 by kejun https://gist.github.com/3358036
;(function ($) {
    $.support.touch = 'ontouchend' in document;

    if (!$.support.touch) {
        return;
    }

    var eventMap = {
        click: 'touchend',
        mousedown: 'touchstart',
        mouseup: 'touchend',
        mousemove: 'touchmove'
    };

    var simulateEvent = function (eventType) {
        $.event.special[eventType] = {
            setup: function () {
                var el = $(this);
                el.bind(eventMap[eventType], $.event.special[eventType].handler);
                if (this.nodeName === 'A' && eventType === 'click') {
                    this.addEventListener('click', function (e) {
                        e.preventDefault();
                    }, false);
                }
            },
            teardown: function () {
                $(this).unbind(eventMap[eventType], $.event.special[eventType].handler);
            },
            handler: function (e) {
                var touch = e.originalEvent.changedTouches[0];
                e.type = eventType;
                e.pageX = touch.pageX;
                e.pageY = touch.pageY;
                e.clientX = touch.clientX;
                e.clientY = touch.clientY;
                $.event.handle.call(this, e);
            }
        };
    };

    $.fn.delegate = function (selector, types, data, fn) {
        var params = data;
        if (typeof data === 'function') {
            fn = data;
            params = null;
        }
        var handler = function (e) {
            if (this.nodeName === 'A' && e.type === 'click') {
                this.addEventListener('click', function (e) {
                    e.preventDefault();
                }, false);
            }
            fn.apply(this, arguments);
        };
        return this.live(types, params, handler, selector);
    };

    $.each(['click', 'mousedown', 'mousemove', 'mouseup'],

    function (i, name) {
        simulateEvent(name);
    });

})(jQuery);
