/*添加收藏*/
var addBookmark = function(url,title) {
	if (window.sidebar) {
		window.sidebar.addPanel(title, url,"");
	} else if( document.all ) {
		window.external.AddFavorite( url, title);
	} else if( window.opera && window.print ) {
		return true;
	}
};
/*设置首页*/
var setHome = function(obj,vrl){
	var url=vrl||window.location.href;
	try{obj.style.behavior='url(#default#homepage)';obj.setHomePage(url);}
	catch(e){
		if(window.netscape) {
			try {netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect");}
			catch (e) {alert("设置主页的请求被浏览器拒绝！\n请从菜单栏进入 工具->选项 \n在打开窗口中的“常规”选项卡中进行设置");}
		}
	}
};
/*toggle指定内容*/
var toggleObj = function(obj){
	var objStatus = $(obj).css("display");
	if (objStatus == "none") {
		$(obj).css("display","block");	
	}else if (objStatus == "block"){
		$(obj).css("display","none");	
	}
};
/*字数统计*/
var TextCount = function(textArea, maxLength){
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
};

// 表单交互
$.bubalusToolsForm = {};
(function($){
	$.fn.bubalusToolsForm = function() {
		return this.each(function() {
        	var form = $(this)
			form.find('input, textarea, select').each(function(){
				var $input = $(this),
					value = $input.val();
				$input.data('default-color',$input.css('color'));
				if (value == $input.data('default-value') || ! value) {
					$input.not('select').css('color','#ccc');
					$input.val($input.data('default-value'));
				}
			});
			form.delegate('input, textarea, select','focus',function() {
				form.find('.focused').removeClass('focused');
				var $input = $(this);
				$input.parents().filter('.ctrlHolder:first').addClass('focused');
				if($input.val() == $input.data('default-value')){
					$input.val("");
				}
				$input.not('select').css('color',$input.data('default-color'));
			});
			form.delegate('input, textarea, select','blur',function() {
				var $input = $(this);
				form.find('.focused').removeClass('focused');
				if($input.val() == "" || $input.val() == $input.data('default-value')){
					$input.not('select').css('color','#ccc');
					$input.val($input.data('default-value'));
				} else {
					$input.css('color',$input.data('default-color'));
				}
			});
		});
	}
})(jQuery);

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

//
$(function() {
	/* Show_menu */
	$(".show_menu").hover(function(){
		$(this).children(".menu_ctrl").addClass("hover").siblings(".menu_content_box").show();
	},function(){
		$(this).children(".menu_ctrl").removeClass("hover").siblings(".menu_content_box").hide();
	});
	/* Show_content */
	$(".show_content").hover(function(){
		$(this).find(".content_box").show();
	},function(){
		$(this).find(".content_box").hide();
	});
	/* toggle_element */
	$(".toggle_this").find(".toggle_ctrl").click(function () {
		if($(this).siblings(".toggle_content_box").css("display") == "none"){
			$(this).addClass("hover").siblings(".toggle_content_box").show();
		} else if ($(this).siblings(".toggle_content_box").css("display") == "block"){
			$(this).removeClass("hover").siblings(".toggle_content_box").hide();
		}
	});
	$(".toggle_this").find(".close_btn").click(function () {
		$(this).closest(".toggle_content_box").hide();
		$(this).closest(".toggle_this").children(".toggle_ctrl").removeClass("hover");
	});
	/* 搜索 */
		/* 搜索类型 */
	$("#searchType_menu").find(".menu_item").hover(function(){
		$(this).addClass("hover")
	},function(){
		$(this).removeClass("hover")
	});
	$("#searchType_menu").find("label").click(function(){
		var menu_item_text = $(this).text();
		$("#searchType").empty();
		$("#searchType").prepend(menu_item_text);
		$("#searchType_menu").hide();
	});
		/* text */
	$("#searchText").hover(function(){
		$(this).addClass("hover")
	},function(){
		$(this).removeClass("hover")
	});
	
	/*表单的默认值*/
	$(".default_text").each(function(){//备忘：以后有时间要把所有页面这里的title属性改成自定义属性
		var defaultitle = $(this).attr("title");
		$(this).attr("defatltext",defaultitle).removeAttr("title");
	});			
	$(".default_text").focusin(function() {
		var text = $(this).attr("defatltext");
		$(this).addClass("focusin")
		if($(this).val() == text){
			$(this).removeAttr("value");
		}
	});
	$(".default_text").blur(function() {
		var text = $(this).attr("defatltext");
		$(this).removeClass("focusin")
		if($(this).val()== ''){
			$(this).val(text);
		}
	});
	
	//创建tabs
	$(".tab_box").easytabs({
    	animate: false,
		tabs: "> .tab_box_title > ul > li", 
		updateHash: false
	});
	
	/* Dialog */
	$(".dialog_mooex").nyroModal({ showCloseButton: false });
	

});

