layui.define(['jquery', 'element'], function(exports) {
	"use strict";

	const MOD_NAME = 'context',
		$ = layui.jquery,
		element = layui.element;

	const context = new function () {

		this.put = function (key, value) {
			localStorage.setItem(key, value);
		}

		this.get = function (key) {
			return localStorage.getItem(key);
		}
	};
	exports(MOD_NAME, context);
});
