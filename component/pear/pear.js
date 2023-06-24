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
	admin: "admin", 	       
	page: "page",			   
	tabPage: "tabPage",			
	menu: "menu",		    
	fullscreen:"fullscreen",    
	messageCenter: "messageCenter",
	button: "button",		       
	theme: "theme",		
	echarts: "extends/echarts",          
	echartsTheme: "extends/echartsTheme",
	yaml:"extends/yaml",			     
	nprogress: "extends/nprogress",      
	toast: "extends/toast",          	      
	popup:"extends/popup",     
	count:"extends/count",         	     

}).use(['layer', 'theme'], function () {

});