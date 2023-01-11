window.rootPath = (function (src) {
	src = document.currentScript
		? document.currentScript.src
		: document.scripts[document.scripts.length - 1].src;
	return src.substring(0, src.lastIndexOf("/") + 1);
})();

layui.config({
	base: rootPath + "module/",
	version: "3.10.0"
}).extend({
	admin: "admin", 	// 框架布局组件
	menu: "menu",		// 数据菜单组件
	frame: "frame", 	// 内容页面组件
	tab: "tab",			// 多选项卡组件
	echarts: "echarts", // 数据图表组件
	echartsTheme: "echartsTheme", // 数据图表主题
	encrypt: "encrypt",		// 数据加密组件
	select: "select",	// 下拉多选组件
	drawer: "drawer",	// 抽屉弹层组件
	notice: "notice",	// 消息提示组件
	step:"step",		// 分布表单组件
	tag:"tag",			// 多标签页组件
	popup:"popup",      // 弹层封装
	treetable:"treetable",   // 树状表格
	dtree:"dtree",			// 树结构
	tinymce:"tinymce/tinymce", // 编辑器
	area:"area",			// 省市级联  
	count:"count",			// 数字滚动
	topBar: "topBar",		// 置顶组件
	button: "button",		// 加载按钮
	design: "design",		// 表单设计
	card: "card",			// 数据卡片组件
	loading: "loading",		// 加载组件
	cropper:"cropper",		// 裁剪组件
	convert:"convert",		// 数据转换
	yaml:"yaml",			// yaml 解析组件
	context: "context",		// 上下文组件
	http: "http",			// ajax请求组件
	theme: "theme",			// 主题转换
	message: "message",     // 通知组件
	toast: "toast",         // 消息通知
	iconPicker: "iconPicker",// 图标选择
	nprogress: "nprogress",  // 进度过渡
	watermark:"watermark/watermark", //水印
	fullscreen:"fullscreen",  //全屏组件
	popover:"popover/popover", //汽泡组件
	translate:"translate"	//多语言翻译组件
}).use(['layer', 'theme', 'translate'], function () {
	layui.theme.changeTheme(window, false);
	
	/***** translate.js 翻译 ******/
	var template_temp_pearInterval = setInterval(function(){
		if(typeof(parent.window.pearTranslateConfig) == 'undefined'){
			//配置还没加载出来，等待加载
			return;
		}
		//admin.js 初始化完毕，translate配置已获取成功
		var translateConfig = parent.window.pearTranslateConfig;
		//停止
		clearInterval(template_temp_pearInterval);
		
		/***** 配置项赋予 *****/
		if(typeof(translateConfig.autoDiscriminateLocalLanguage) != 'undefined' && (translateConfig.autoDiscriminateLocalLanguage == true || translateConfig.autoDiscriminateLocalLanguage == 'true' )){
			translate.setAutoDiscriminateLocalLanguage();	//设置用户第一次用时，自动识别其所在国家的语种进行切换
		}
		if(typeof(translateConfig.currentLanguage) != 'undefined' && translateConfig.currentLanguage.length > 0){
			translate.language.setLocal(translateConfig.currentLanguage);
		}
		if(typeof(translateConfig.ignoreClass) != 'undefined' && translateConfig.ignoreClass.length > 0){
			var classs = translateConfig.ignoreClass.split(',');
			for(var ci = 0; ci < classs.length; ci++){
				var className = classs[ci].trim();
				if(className.length > 0){
					if(translate.ignore.class.indexOf(className.toLowerCase()) > -1){
						//已经有了，忽略
					}else{
						//还没有，加入
						translate.ignore.class.push(className);
					}
				}
			}
		}
		if(typeof(translateConfig.ignoreTag) != 'undefined' && translateConfig.ignoreTag.length > 0){
			var tags = translateConfig.ignoreTag.split(',');
			for(var ti = 0; ti < tags.length; ti++){
				var tagName = tags[ti].trim();
				if(tagName.length > 0){
					if(translate.ignore.tag.indexOf(tagName.toLowerCase()) > -1){
						//已经有了，忽略
					}else{
						//还没有，加入
						translate.ignore.tag.push(tagName);
					}
				}
			}
		}
		//开启html页面变化的监控，对变化部分会进行自动翻译。注意，这里变化部分，是指当 translate.execute(); 已经完全执行完毕之后，如果页面再有变化的部分，才会对其进行翻译。
		translate.listener.start();	
		//页面加载完毕后执行翻译
		if(document.readyState == 'complete'){
			translate.execute();
		}else{
			window.onload = function(){
				translate.execute();
			}
		}
		//避免有遗漏，特别是表格的render渲染等，诡异的会复原
		setTimeout(translate.execute,1500);
		
    }, 30);
	/***** translate.js 翻译 结束 ******/
	
});