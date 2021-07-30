(function () {
  var match = new RegExp("(^|(.*?\\/))(lib.js)(\\?|$)");
  var scripts = document.getElementsByTagName("script");
  var libScript;
  var publicPath = "";
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].getAttribute("src");
    if (src) {
      var rs = src.match(match);
      if (rs) {
        libScript = scripts[i];
        break;
      }
    }
  }
  var cssExpr = new RegExp("\\.css");
  function inputLibs(list) {
    if (list == null || list.length === 0) {
      return;
    }

    for (var i = 0, len = list.length; i < len; i++) {
      var url = list[i];
      if (cssExpr.test(url)) {
        var css = '<link rel="stylesheet" href="' + url + '">';
        document.writeln(css);
      } else {
        var script =
          '<script type="text/javascript" src="' + url + '"><' + "/script>";
        document.writeln(script);
      }
    }
  }

  var version = "1.0.0";
  function loadLib() {
    var libs = (libScript.getAttribute("libs") || "").split(",");
    var libConfig = {
      dtree: [
        publicPath +
          "/component/pear/css/module/dtree/font/dtreefont.css?v="+version,
      ],
      iconPicker: [publicPath + "/component/pear/css/module/iconPicker.cs?v="+version],
      treetable: [publicPath + "/component/pear/css/module/treetable.css?v="+version],
      message: [publicPath + "/component/pear/css/module/message.css?v="+version],
      cropper: [publicPath + "/component/pear/css/module/cropper.css?v="+version],

      loading: [publicPath + "/component/pear/css/module/loading.css?v="+version],

      topBar: [publicPath + "/component/pear/css/module/topBar.css?v="+version],

      select: [publicPath + "/component/pear/css/module/select.css?v="+version],

      layout: [publicPath + "/component/pear/css/module/layout.css?v="+version],

      notice: [publicPath + "/component/pear/css/module/notice.css?v="+version],

      button: [publicPath + "/component/pear/css/module/button.css?v="+version],

      table: [publicPath + "/component/pear/css/module/table.css?v="+version],

      frame: [publicPath + "/component/pear/css/module/frame.css?v="+version],

      layer: [publicPath + "/component/pear/css/module/layer.css?v="+version],
      menu: [publicPath + "/component/pear/css/module/menu.css?v="+version],
      form: [publicPath + "/component/pear/css/module/form.css?v="+version],
      link: [publicPath + "/component/pear/css/module/link.css?v="+version],
      code: [publicPath + "/component/pear/css/module/code.css?v="+version],
      step: [publicPath + "/component/pear/css/module/step.css?v="+version],
      card: [publicPath + "/component/pear/css/module/card.css?v="+version],
      tab: [publicPath + "/component/pear/css/module/tab.css?v="+version],
      tag: [publicPath + "/component/pear/css/module/tag.css?v="+version],
      layui: [
        publicPath + "/component/layui/css/layui.css?v="+version,
        publicPath + "/component/pear/font/iconfont.css?v="+version,
      ],
    };

    var keys = {};
    for (var i = 0, len = libs.length; i < len; i++) {
      var key = libs[i];

      if (keys[key]) {
        //规避重复引入lib
        continue;
      }
      keys[key] = true;

      inputLibs(libConfig[key]);
    }
  }
  loadLib();
})();
