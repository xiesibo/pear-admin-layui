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

	echarts: "extends/echarts",          
	echartsTheme: "extends/echartsTheme",
	yaml:"extends/yaml",			     
	nprogress: "extends/nprogress",      
	toast: "extends/toast",          	      
	popup:"extends/popup",     
	count:"extends/count",         

	button: "button",		     
	fullscreen:"fullscreen",      
	theme: "theme",			     

}).use(['layer', 'theme'], function () {

});