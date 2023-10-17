layui.define(['jquery', 'element'], function(exports) {
	"use strict";

	const MOD_NAME = 'count',
		$ = layui.jquery,
		element = layui.element;

	const count = new function () {

		this.up = function (targetEle, options) {

			options = options || {};

			let $this = document.getElementById(targetEle),
				time = options.time,
				finalNum = options.num,
				regulator = options.regulator,
				step = finalNum / (time / regulator),
				count = 0.00,
				initial = 0;

			const timer = setInterval(function () {
				count = count + step;
				if (count >= finalNum) {
					clearInterval(timer);
					count = finalNum;
				}
				const t = count.toFixed(options.bit ? options.bit : 0);
				if (t === initial) return;
				initial = t;
				$this.innerHTML = initial;
			}, 30);
		}

	};
	exports(MOD_NAME, count);
});
