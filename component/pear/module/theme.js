layui.define(["jquery","layer"], function (exports) {
	var MOD_NAME = 'theme',
	    $ = layui.jquery;

	var theme = {};
	theme.autoHead = false;

	theme.changeTheme = function (target, autoHead) {

		this.autoHead = autoHead;
		
		var color = localStorage.getItem("theme-color-color");
		
		document.documentElement.style.setProperty("--global-primary-color", color);
		
		this.colorSet(color);
	}

	theme.colorSet = function(color) {
		
		var style = '';
		style += '.light-theme .pear-nav-tree .layui-this a:hover,.light-theme .pear-nav-tree .layui-this,.light-theme .pear-nav-tree .layui-this a,.pear-nav-tree .layui-this a,.pear-nav-tree .layui-this{background-color: ' +color + '!important;}';
		style += '.pear-admin .layui-logo .title{color:' + color + '!important;}';
		style += '.pear-frame-title .dot,.pear-tab .layui-this .pear-tab-active{background-color: ' + color +'!important;}';
		style += '.bottom-nav li a:hover{background-color:' + color + '!important;}';
		style += '.pear-btn-primary {border: 1px solid ' + color + '!important;}';
		style += '.pear-admin .layui-header .layui-nav .layui-nav-bar{background-color: ' + color + '!important;}'
		style += '.ball-loader>span,.signal-loader>span {background-color: ' + color + '!important;}';
		style += '.layui-header .layui-nav-child .layui-this a{background-color:' + color +'!important;color:white!important;}';
		style += '.pearone-color .color-content li.layui-this:after, .pearone-color .color-content li:hover:after {border: ' +color + ' 3px solid!important;}';
		style += '.layui-nav .layui-nav-child dd.layui-this a, .layui-nav-child dd.layui-this{background-color:' + color + ';color:white;}';	
		style += '.pear-social-entrance {background-color:' + color + '!important}';
		style += '.pear-admin .pe-collapse {background-color:' + color + '!important}';
		style += '.layui-fixbar li {background-color:' + color + '!important}';
		style += '.layui-form-checkbox[lay-skin=primary]:hover span {background-color: initial;}'
		style += '.layui-form-checked[lay-skin=primary] i {border-color: ' + color + '!important;background-color: ' + color + ';}'
		style += '.layui-form-checked,.layui-form-checked:hover {border-color: ' + color + '!important;}'
		style += '.layui-form-checked span,.layui-form-checked:hover span {background-color: ' + color + ';}'
		style += '.layui-form-checked i,.layui-form-checked:hover i {color: ' + color + ';}'
		style += '.layui-form-onswitch { border-color: ' + color + '; background-color: ' + color + ';}'
		style += '.layui-form-radio>i:hover, .layui-form-radioed>i {color: ' + color + ';}'
		style += '.layui-laypage .layui-laypage-curr .layui-laypage-em{background-color:'+ color +'!important}'
		style += '.layui-tab-brief>.layui-tab-more li.layui-this:after, .layui-tab-brief>.layui-tab-title .layui-this:after{border-bottom: 3px solid '+color+'!important}'
		style += '.layui-tab-brief>.layui-tab-title .layui-this{color:'+color+'!important}'
		style += '.layui-progress-bar{background-color:'+color+'}';
		style += '.layui-elem-quote{border-left: 5px solid '+ color +'}';
		style += '.layui-timeline-axis{color:' + color + '}';
		style += '.layui-laydate .layui-this{background-color:'+color+'!important}';
		style += '.pear-this,.pear-text{color:' + color + '!important}';
		style += '.pear-back{background-color:'+ color +'!important}';
		style += '.pear-collapsed-pe{background-color:'+color+'!important}'
		style += '.layui-form-select dl dd.layui-this{color:'+color+'!important;}'
		style += '.layui-layer-btn a:first-child{border-color:'+color+';background-color:'+color+'!important}';
		style += '.layui-form-checkbox[lay-skin=primary]:hover i{border-color:'+color+'!important}'
		style += '.pear-tab-menu .item:hover{background-color:'+color+'!important}'
		style += '.layui-form-danger:focus {border-color:#FF5722 !important}'
		style += '.pear-admin .user .layui-this a:hover{color:white!important}'
		style += '.pear-admin .user  a:hover{color:'+color+'!important}'
        style += '.layui-form-radio:hover *, .layui-form-radioed, .layui-form-radioed>i{color:' + color + ' !important}';
		style += '.loader:after {background:'+color+'}'
		style += '.layui-laydate .layui-this, .layui-laydate .layui-this>div{background:'+color+'!important}'
		if(this.autoHead === true || this.autoHead === "true"){
			style += '.pear-admin.banner-layout .layui-header .layui-logo,.pear-admin .layui-header{border:none;background-color:' + color + '!important;}.pear-admin.banner-layout .layui-header .layui-logo .title,.pear-admin .layui-header .layui-nav .layui-nav-item>a{color:whitesmoke!important;}';
			style += '.pear-admin.banner-layout .layui-header{ box-shadow: 2px 0 6px rgb(0 21 41 / 35%) }'
			style += '.pear-admin .layui-header .layui-layout-control .layui-this *,.pear-admin.banner-layout .layui-header .layui-layout-control .layui-this *{ background-color: rgba(0,0,0,.1)!important;}'
		}
    	style += '.menu-search-list li:hover,.menu-search-list li.this{background-color:'+ color +'}'
		var colorPane = $("#pear-admin-color");
		if(colorPane.length>0){
			colorPane.html(style);
		}else{
			$("head").append("<style id='pear-admin-color'>"+style+"</style>")
		}
	}

	exports(MOD_NAME, theme);
});