// --------------------------------------------
// BubalusFE - The front-end development framework
//
/* Tabs.js - 標籤頁 */
// --------------------------------------------

+function($) {

  $.tabs = function(container, options) {

    var plugin = this,
        $container = $(container),

        defaults = {
          animate: true, // 是否开启标签切换动画
          panelActiveClass: "active",  // 当前激活内容区类名
          tabActiveClass: "active", // 当前激活 tab 类名
          defaultTab: "li:first-child", // 默认激活 tab
          animationSpeed: "normal", // 动画速度 slow | normal | fast | 毫秒
          tabs: "> ul > li",  // 指定 tab 在结构中的位置 相对于tabs容器
          updateHash: true,  // 是否更新 url 的 hash 值
          cycle: false, // 是否自动播放 false | 毫秒
          collapsible: false, // 双击 tab 可折叠内容区
          collapsedClass: "collapsed", // 折叠时添加的類名
          collapsedByDefault: true, // 默认是折叠的
          transitionIn: 'fadeIn', // 切入時過渡效果 fadeIn | slideDown
          transitionOut: 'fadeOut', // 切出時過渡效果 fadeOut | slideUp
          transitionInEasing: 'swing',
          transitionOutEasing: 'swing',
          transitionCollapse: 'slideUp', // 折叠時過渡效果
          transitionUncollapse: 'slideDown', // 取消折疊時過渡效果
          transitionCollapseEasing: 'swing',
          transitionUncollapseEasing: 'swing',
          containerClass: "", // 指定内容容器類名
          tabsClass: "", // 指定 tabs 的容器類名
          tabClass: "", // 指定單個 tab 的容器類名
          panelClass: "", // 指定單個内容容器類名
          cache: true, // 緩存 ajax 内容
          event: 'click', // 響應事件
          panelContext: $container
        },

        // 内部實例變量
        $defaultTab,
        $defaultTabLink,
        transitions,
        lastHash,
        skipUpdateToHash,
        animationSpeeds = {
          fast: 200,
          normal: 400,
          slow: 600
        },

        settings;


    // 初始化
    plugin.init = function() {

      plugin.settings = settings = $.extend({}, defaults, options);
      settings.bind_str = settings.event+".tabs";

      // 如果折疊開啓，并指定了默認的tab，那不折疊
      if ( settings.collapsible && options.defaultTab !== undefined && options.collpasedByDefault === undefined ) {
        settings.collapsedByDefault = false;
      }

      // 將 normal fast slow 轉換爲以毫秒爲單位的速度值
      if ( typeof(settings.animationSpeed) === 'string' ) {
        settings.animationSpeed = animationSpeeds[settings.animationSpeed];
      }

      $('a.anchor').remove().prependTo('body');

      // 存儲 tabs 中的對象以便對其屬性進行設置
      $container.data('tabs', {});

      plugin.setTransitions();

      plugin.getTabs();

      addClasses();

      setDefaultTab();

      bindToTabClicks();

      initHashChange();

      initCycle();

      // 設置 data 屬性，方便選擇器選擇
      $container.attr('data-tabs', true);
    };

    // 設置過渡效果，可用于更新過渡效果
    plugin.setTransitions = function() {
      transitions = ( settings.animate ) ? {
          show: settings.transitionIn,
          hide: settings.transitionOut,
          speed: settings.animationSpeed,
          collapse: settings.transitionCollapse,
          uncollapse: settings.transitionUncollapse,
          halfSpeed: settings.animationSpeed / 2
        } :
        {
          show: "show",
          hide: "hide",
          speed: 0,
          collapse: "hide",
          uncollapse: "show",
          halfSpeed: 0
        };
    };

    // 查找和實例化 tabs，可用于重置 tabs
    plugin.getTabs = function() {
      var $matchingPanel;

      // 在容器内查找最初一組匹配 settings.tabs 的元素
      plugin.tabs = $container.find(settings.tabs),

      // 將面板設為一個空的JQuery對象
      plugin.panels = $(),

      plugin.tabs.each(function(){
        var $tab = $(this),
            $a = $tab.children('a'),
            targetId = $tab.children('a').data('target');

        $tab.data('tabs', {});

        // 如果 tabs 有 data-target 屬性，那他就是個 ajax tabs
        if ( targetId !== undefined && targetId !== null ) {
          $tab.data('tabs').ajax = $a.attr('href');
        } else {
          targetId = $a.attr('href');
        }
        targetId = targetId.match(/#([^\?]+)/)[1];

        $matchingPanel = settings.panelContext.find("#" + targetId);

        // 如果 tab 有匹配的面板
        if ( $matchingPanel.length ) {

          $matchingPanel.data('tabs', {
            position: $matchingPanel.css('position'),
            visibility: $matchingPanel.css('visibility')
          });

          $matchingPanel.not(settings.panelActiveClass).hide();

          plugin.panels = plugin.panels.add($matchingPanel);

          $tab.data('tabs').panel = $matchingPanel;

        // 否則，刪掉這個tab
        } else {
          plugin.tabs = plugin.tabs.not($tab);
          if ('console' in window) {
            console.warn('警告: tab 沒有匹配面板的選擇器 \'#' + targetId +'\' ');
          }
        }
      });
    };

    // 選中 tab 和相關回調
    plugin.selectTab = function($clicked, callback) {
      var url = window.location,
          hash = url.hash.match(/^[^\?]*/)[0],
          $targetPanel = $clicked.parent().data('tabs').panel,
          ajaxUrl = $clicked.parent().data('tabs').ajax;

      // tab 是可折叠的並且是激活狀態 || 切換到折疊狀態
      if( settings.collapsible && ! skipUpdateToHash && ($clicked.hasClass(settings.tabActiveClass) || $clicked.hasClass(settings.collapsedClass)) ) {
        plugin.toggleTabCollapse($clicked, $targetPanel, ajaxUrl, callback);

      // tab 和面板皆未激活 || 選中 tab
      } else if( ! $clicked.hasClass(settings.tabActiveClass) || ! $targetPanel.hasClass(settings.panelActiveClass) ){
        activateTab($clicked, $targetPanel, ajaxUrl, callback);

      // 緩存被禁用 || 重載
      } else if ( ! settings.cache ){
        activateTab($clicked, $targetPanel, ajaxUrl, callback);
      }

    };

    // 切換 tab 折叠狀態和相關回調
    plugin.toggleTabCollapse = function($clicked, $targetPanel, ajaxUrl, callback) {
      plugin.panels.stop(true,true);

      if( fire($container,"tabs:before", [$clicked, $targetPanel, settings]) ){
        plugin.tabs.filter("." + settings.tabActiveClass).removeClass(settings.tabActiveClass).children().removeClass(settings.tabActiveClass);

        // 如果面板處於折叠狀態，取消折叠
        if( $clicked.hasClass(settings.collapsedClass) ){

          // 如果 ajax 面板沒有被緩存
          if( ajaxUrl && (!settings.cache || !$clicked.parent().data('tabs').cached) ) {
            $container.trigger('tabs:ajax:beforeSend', [$clicked, $targetPanel]);

            $targetPanel.load(ajaxUrl, function(response, status, xhr){
              $clicked.parent().data('tabs').cached = true;
              $container.trigger('tabs:ajax:complete', [$clicked, $targetPanel, response, status, xhr]);
            });
          }

          // 更新 tab 和面板的類
          $clicked.parent()
            .removeClass(settings.collapsedClass)
            .addClass(settings.tabActiveClass)
            .children()
              .removeClass(settings.collapsedClass)
              .addClass(settings.tabActiveClass);

          $targetPanel
            .addClass(settings.panelActiveClass)
            [transitions.uncollapse](transitions.speed, settings.transitionUncollapseEasing, function(){
              $container.trigger('tabs:midTransition', [$clicked, $targetPanel, settings]);
              if(typeof callback == 'function') callback();
            });

        // 否則，折疊
        } else {

          // 更新 tab 和面板的類
          $clicked.addClass(settings.collapsedClass)
            .parent()
              .addClass(settings.collapsedClass);

          $targetPanel
            .removeClass(settings.panelActiveClass)
            [transitions.collapse](transitions.speed, settings.transitionCollapseEasing, function(){
              $container.trigger("tabs:midTransition", [$clicked, $targetPanel, settings]);
              if(typeof callback == 'function') callback();
            });
        }
      }
    };


    // 匹配 tab
    plugin.matchTab = function(hash) {
      return plugin.tabs.find("[href='" + hash + "'],[data-target='" + hash + "']").first();
    };

    // 匹配面板
    plugin.matchInPanel = function(hash) {
      return ( hash && plugin.validId(hash) ? plugin.panels.filter(':has(' + hash + ')').first() : [] );
    };

    // 確保哈希值是一個正確的ID值
    plugin.validId = function(id) {
      return id.substr(1).match(/^[A-Za-z]+[A-Za-z0-9\-_:\.].$/);
    };

    // 選擇匹配的 tab 時改變哈希
    plugin.selectTabFromHashChange = function() {
      var hash = window.location.hash.match(/^[^\?]*/)[0],
          $tab = plugin.matchTab(hash),
          $panel;

      if ( settings.updateHash ) {

        // 如果哈希匹配 tab
        if( $tab.length ){
          skipUpdateToHash = true;
          plugin.selectTab( $tab );

        } else {
          $panel = plugin.matchInPanel(hash);

          // 如果面板中的元素匹配哈希
          if ( $panel.length ) {
            hash = '#' + $panel.attr('id');
            $tab = plugin.matchTab(hash);
            skipUpdateToHash = true;
            plugin.selectTab( $tab );

          // 如果默認的 tab 不是激活的
          } else if ( ! $defaultTab.hasClass(settings.tabActiveClass) && ! settings.cycle ) {

            // 如果哈希是空的，或匹配父級的 tab 容器，再或如果更新哈希前最后一個 tab 是在這個容器中其他的 tab 之一
            if ( hash === '' || plugin.matchTab(lastHash).length || $container.closest(hash).length ) {
              skipUpdateToHash = true;
              plugin.selectTab( $defaultTabLink );
            }
          }
        }
      }
    };

    // tabs 的自動播放
    plugin.cycleTabs = function(tabNumber){
      if(settings.cycle){
        tabNumber = tabNumber % plugin.tabs.length;
        $tab = $( plugin.tabs[tabNumber] ).children("a").first();
        skipUpdateToHash = true;
        plugin.selectTab( $tab, function() {
          setTimeout(function(){ plugin.cycleTabs(tabNumber + 1); }, settings.cycle);
        });
      }
    };

    // 選擇器快捷方式
    plugin.publicMethods = {
      select: function(tabSelector){
        var $tab;

        // 查找 tab 容器匹配的選擇器  如 li#tab-one 其中包含 tab 鏈接
        if ( ($tab = plugin.tabs.filter(tabSelector)).length === 0 ) {

          // 查找 tab 鏈接匹配的 href 如 a[href="#panel-1"]
          if ( ($tab = plugin.tabs.find("a[href='" + tabSelector + "']")).length === 0 ) {

            // 查找 tab 鏈接 匹配的選擇器 如 a#tab-1
            if ( ($tab = plugin.tabs.find("a" + tabSelector)).length === 0 ) {

              // 查找 tab 鏈接 匹配的 data-target 如 a[data-target="#panel-1"]
              if ( ($tab = plugin.tabs.find("[data-target='" + tabSelector + "']")).length === 0 ) {

                // 查找 tab 鏈接 匹配的 href 末端 如 a[href$="#panel-1"] 這將匹配 http://example.com/#panel-1)
                if ( ($tab = plugin.tabs.find("a[href$='" + tabSelector + "']")).length === 0 ) {

                  $.error('Tab \'' + tabSelector + '\' does not exist in tab set');
                }
              }
            }
          }
        } else {
          // 選擇子代 tab 鏈接
          $tab = $tab.children("a").first();
        }
        plugin.selectTab($tab);
      }
    };

    // =============================================================
    // 私有函數
    // =============================================================

    // 觸發元素上的事件，并返回結果
    var fire = function(obj, name, data) {
      var event = $.Event(name);
      obj.trigger(event, data);
      return event.result !== false;
    }

    // 添加 CSS 類到標簽，被初始化調用
    var addClasses = function() {
      $container.addClass(settings.containerClass);
      plugin.tabs.parent().addClass(settings.tabsClass);
      plugin.tabs.addClass(settings.tabClass);
      plugin.panels.addClass(settings.panelClass);
    };

    // 設置默認選項卡，被初始化調用
    var setDefaultTab = function(){
      var hash = window.location.hash.match(/^[^\?]*/)[0],
          $selectedTab = plugin.matchTab(hash).parent(),
          $panel;

      // 如果哈希直接匹配某標簽，激活之
      if( $selectedTab.length === 1 ){
        $defaultTab = $selectedTab;
        settings.cycle = false;

      } else {
        $panel = plugin.matchInPanel(hash);

        // 如果一個面板中的元素匹配哈希，激活之
        if ( $panel.length ) {
          hash = '#' + $panel.attr('id');
          $defaultTab = plugin.matchTab(hash).parent();

        // 否則激活默認 tab
        } else {
          $defaultTab = plugin.tabs.parent().find(settings.defaultTab);
          if ( $defaultTab.length === 0 ) {
            $.error("The specified default tab ('" + settings.defaultTab + "') could not be found in the tab set ('" + settings.tabs + "') out of " + plugin.tabs.length + " tabs.");
          }
        }
      }

      $defaultTabLink = $defaultTab.children("a").first();

      activateDefaultTab($selectedTab);
    };

    // 激活默認 tab 或 默認折疊，被 setDefaultTab 調用
    var activateDefaultTab = function($selectedTab) {
      var defaultPanel,
          defaultAjaxUrl;

      if ( settings.collapsible && $selectedTab.length === 0 && settings.collapsedByDefault ) {
        $defaultTab
          .addClass(settings.collapsedClass)
          .children()
            .addClass(settings.collapsedClass);

      } else {

        defaultPanel = $( $defaultTab.data('tabs').panel );
        defaultAjaxUrl = $defaultTab.data('tabs').ajax;

        if ( defaultAjaxUrl && (!settings.cache || !$defaultTab.data('tabs').cached) ) {
          $container.trigger('tabs:ajax:beforeSend', [$defaultTabLink, defaultPanel]);
          defaultPanel.load(defaultAjaxUrl, function(response, status, xhr){
            $defaultTab.data('tabs').cached = true;
            $container.trigger('tabs:ajax:complete', [$defaultTabLink, defaultPanel, response, status, xhr]);
          });
        }

        $defaultTab.data('tabs').panel
          .show()
          .addClass(settings.panelActiveClass);

        $defaultTab
          .addClass(settings.tabActiveClass)
          .children()
            .addClass(settings.tabActiveClass);
      }

      // 激發事件時，初始化插件
      $container.trigger("tabs:initialised", [$defaultTabLink, defaultPanel]);
    };

    // 綁定 tab-select 函數的點擊事件
    var bindToTabClicks = function() {
      plugin.tabs.children("a").bind(settings.bind_str, function(e) {

        // 單擊一個 tab 的時候停止自動播放
        settings.cycle = false;

        // tab 點擊時更新哈希
        skipUpdateToHash = false;

        // 點擊 tab 選擇面板
        plugin.selectTab( $(this) );

        // 不要跟隨鏈接的錨
        e.preventDefault ? e.preventDefault() : e.returnValue = false;
      });
    };

    // 激活特定 tab 或面板，被 plugin.selectTab 調用
    //
    //   * 激發 tabs:before 鈎子
    //   * 如果新 tab 是一個未緩存的 ajax tab，開始獲取
    //   * 動畫淡出先前激活的面板
    //   * 激發 tabs:midTransition 鈎子
    //   * 更新 URL 哈希
    //   * 動畫淡入新激活的面板
    //   * 更新 tab 和面板的 CSS 類
    //
    // TODO: 應該可以被細分成更多模塊
    var activateTab = function($clicked, $targetPanel, ajaxUrl, callback) {
      plugin.panels.stop(true,true);

      if( fire($container,"tabs:before", [$clicked, $targetPanel, settings]) ){
        var $visiblePanel = plugin.panels.filter(":visible"),
            $panelContainer = $targetPanel.parent(),
            targetHeight,
            visibleHeight,
            heightDifference,
            showPanel,
            hash = window.location.hash.match(/^[^\?]*/)[0];

        if (settings.animate) {
          targetHeight = getHeightForHidden($targetPanel);
          visibleHeight = $visiblePanel.length ? setAndReturnHeight($visiblePanel) : 0;
          heightDifference = targetHeight - visibleHeight;
        }

        lastHash = hash;

        // TODO: 移動這函數到別處
        showPanel = function() {
          // 此時以前的面板是隱藏的，新的面板將被選中
          $container.trigger("tabs:midTransition", [$clicked, $targetPanel, settings]);

          // 切入時兩個面板高度不一時動畫切換
          if (settings.animate && settings.transitionIn == 'fadeIn') {
            if (heightDifference < 0)
              $panelContainer.animate({
                height: $panelContainer.height() + heightDifference
              }, transitions.halfSpeed ).css({ 'min-height': '' });
          }

          if ( settings.updateHash && ! skipUpdateToHash ) {
            //window.location = url.toString().replace((url.pathname + hash), (url.pathname + $clicked.attr("href")));
            // 不知爲何表現差距很大，不過這樣很直接了當，副作用也少
            window.location.hash = '#' + $targetPanel.attr('id');
          } else {
            skipUpdateToHash = false;
          }

          $targetPanel
            [transitions.show](transitions.speed, settings.transitionInEasing, function(){
              $panelContainer.css({height: '', 'min-height': ''}); // 過渡之後取消高度設置
              $container.trigger("tabs:after", [$clicked, $targetPanel, settings]);

              if(typeof callback == 'function'){
                callback();
              }
          });
        };

        if ( ajaxUrl && (!settings.cache || !$clicked.parent().data('tabs').cached) ) {
          $container.trigger('tabs:ajax:beforeSend', [$clicked, $targetPanel]);
          $targetPanel.load(ajaxUrl, function(response, status, xhr){
            $clicked.parent().data('tabs').cached = true;
            $container.trigger('tabs:ajax:complete', [$clicked, $targetPanel, response, status, xhr]);
          });
        }

        // 切出時兩個面板高度不一時動畫切換
        if( settings.animate && settings.transitionOut == 'fadeOut' ) {
          if( heightDifference > 0 ) {
            $panelContainer.animate({
              height: ( $panelContainer.height() + heightDifference )
            }, transitions.halfSpeed );
          } else {
            // 防止提前觸發 midTransition
            $panelContainer.css({ 'min-height': $panelContainer.height() });
          }
        }

        // 當用戶點擊活動的 tab 時提供即時的反饋
        plugin.tabs.filter("." + settings.tabActiveClass).removeClass(settings.tabActiveClass).children().removeClass(settings.tabActiveClass);
        plugin.tabs.filter("." + settings.collapsedClass).removeClass(settings.collapsedClass).children().removeClass(settings.collapsedClass);
        $clicked.parent().addClass(settings.tabActiveClass).children().addClass(settings.tabActiveClass);

        plugin.panels.filter("." + settings.panelActiveClass).removeClass(settings.panelActiveClass);
        $targetPanel.addClass(settings.panelActiveClass);

        if( $visiblePanel.length ) {
          $visiblePanel
            [transitions.hide](transitions.speed, settings.transitionOutEasing, showPanel);
        } else {
          $targetPanel
            [transitions.uncollapse](transitions.speed, settings.transitionUncollapseEasing, showPanel);
        }
      }
    };

    // 獲取面板的高度，動畫處理不同高度的面板，activateTab 調用
    var getHeightForHidden = function($targetPanel){

      if ( $targetPanel.data('tabs') && $targetPanel.data('tabs').lastHeight ) {
        return $targetPanel.data('tabs').lastHeight;
      }

      var display = $targetPanel.css('display'),
          outerCloak,
          height;

      try {
        outerCloak = $('<div></div>', {'position': 'absolute', 'visibility': 'hidden', 'overflow': 'hidden'});
      } catch (e) {
        outerCloak = $('<div></div>', {'visibility': 'hidden', 'overflow': 'hidden'});
      }
      height = $targetPanel
        .wrap(outerCloak)
        .css({'position':'relative','visibility':'hidden','display':'block'})
        .outerHeight();

      $targetPanel.unwrap();

      // 元素返回到以前的狀態
      $targetPanel.css({
        position: $targetPanel.data('tabs').position,
        visibility: $targetPanel.data('tabs').visibility,
        display: display
      });

      // 緩存高度
      $targetPanel.data('tabs').lastHeight = height;

      return height;
    };

    // 因爲可見的面板高度可能已經被改動了，所以要重新緩存每個可見面板的高度
    // activateTab 調用
    var setAndReturnHeight = function($visiblePanel) {
      var height = $visiblePanel.outerHeight();

      if( $visiblePanel.data('tabs') ) {
        $visiblePanel.data('tabs').lastHeight = height;
      } else {
        $visiblePanel.data('tabs', {lastHeight: height});
      }
      return height;
    };

    // 爲前進後退功能安裝哈希改變的回調，初始化調用
    var initHashChange = function(){

      // 對 jquery.hashchange 啓用後退按鈕
      // http://benalman.com/projects/jquery-hashchange-plugin/
      if(typeof $(window).hashchange === 'function'){
        $(window).hashchange( function(){
          plugin.selectTabFromHashChange();
        });
      } else if ($.address && typeof $.address.change === 'function') { // jquery.address 的後退按鈕 http://www.asual.com/jquery/address/docs/
        $.address.change( function(){
          plugin.selectTabFromHashChange();
        });
      }
    };

    // 開始自動播放，初始化調用
    var initCycle = function(){
      var tabNumber;
      if (settings.cycle) {
        tabNumber = plugin.tabs.index($defaultTab);
        setTimeout( function(){ plugin.cycleTabs(tabNumber + 1); }, settings.cycle);
      }
    };


    plugin.init();

  };

  $.fn.tabs = function(options) {
    var args = arguments;

    return this.each(function() {
      var $this = $(this),
          plugin = $this.data('tabs');

      if (undefined === plugin) {
        plugin = new $.tabs(this, options);
        $this.data('tabs', plugin);
      }

      // 用戶調用的公共方法
      if ( plugin.publicMethods[options] ){
        return plugin.publicMethods[options](Array.prototype.slice.call( args, 1 ));
      }
    });
  };

}(jQuery);
