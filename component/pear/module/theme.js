layui.define(["jquery","layer"], function (exports) {
	var MOD_NAME = 'theme',
	    $ = layui.jquery;

	var theme = {};

	theme.changeTheme = function () {
		
		var color = localStorage.getItem("theme-color-color");
		
		document.documentElement.style.setProperty("--global-primary-color", color);
	
	}

	exports(MOD_NAME, theme);
});