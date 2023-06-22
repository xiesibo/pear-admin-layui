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

	common: "common",            // 公共方法封装
	encrypt: "encrypt",		     // 数据加密组件
	select: "select",	         // 下拉多选组件
	notice: "notice",	         // 消息提示组件
	step:"step",		         // 分布表单组件
	tag:"tag",			         // 多标签页组件
	popup:"popup",               // 弹层封装
	dtree:"dtree",			     // 树结构
	tinymce:"tinymce/tinymce",   // 编辑器
	area:"area",			     // 省市级联  
	count:"count",			     // 数字滚动
	topBar: "topBar",		     // 置顶组件
	button: "button",		     // 加载按钮
	card: "card",			     // 数据卡片组件
	loading: "loading",		     // 加载组件
	cropper:"cropper",		     // 裁剪组件
	convert:"convert",		     // 数据转换
	context: "context",		     // 上下文组件
	http: "http",			     // 网络请求组件
	theme: "theme",			     // 主题转换
	message: "message",          // 通知组件
	iconPicker: "iconPicker",    // 图标选择
	watermark:"watermark/watermark", //水印组件
	fullscreen:"fullscreen",     //全屏组件
	popover:"popover/popover",    //汽泡组件
	darkreader: "darkreader"
}).use(['layer', 'theme'], function () {
	layui.theme.changeTheme(window, false);
});