window.rootPath = (function (src) {
	src = document.currentScript
		? document.currentScript.src
		: document.scripts[document.scripts.length - 1].src;
	return src.substring(0, src.lastIndexOf("/") + 1);
})();

layui.config({
	base: rootPath + "module/",
	version: "3.40.0"
}).extend({
	admin: "core/admin", 	       
	page: "core/page",			   
	tabPage: "core/tabPage",			
	menu: "core/menu",		  
	messageCenter: "core/messageCenter",          // 通知组件       

	echarts: "extends/echarts",          
	echartsTheme: "extends/echartsTheme",
	yaml:"extends/yaml",			     
	nprogress: "extends/nprogress",      
	toast: "extends/toast",                     

	common: "common",            // 公共方法封装
	popup:"popup",               // 弹层封装
	count:"count",			     // 数字滚动
	button: "button",		     // 加载按钮
	loading: "loading",		     // 加载组件
	convert:"convert",		     // 数据转换
	context: "context",		     // 上下文组件
	theme: "theme",			     // 主题转换
	fullscreen:"fullscreen",     //全屏组件

}).use(['layer', 'theme'], function () {
	layui.theme.changeTheme(window, false);
});