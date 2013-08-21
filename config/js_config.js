seajs.config({
  // 设置别名，方便调用
  alias: {
    'jquery': 'modules/jquery/jquery-1.10.2.js',

    'alerttip': 'modules/alerttip/alerttip',
    'button': 'modules/button/button',
    'dropdown': 'modules/dropdown/dropdown',
    'guide': 'modules/guide/guide',
    'loadtip': 'modules/loadtip/loadtip',
    'modal': 'modules/modal/modal',
    'scrollbar': 'modules/scrollbar/scrollbar',
    'slideshow': 'modules/slideshow/slideshow',
    'step': 'modules/step/step',
    'tabs': 'modules/tabs/tabs',
    'tooltip': 'modules/tooltip/tooltip'
  },
  preload: ["jquery"]

});