layui.define(['jquery', 'element'], function(exports) {
	"use strict";

	/**
	 * 类 型 转 换 工 具 类
	 * */
	const MOD_NAME = 'convert',
		$ = layui.jquery,
		element = layui.element;

	const convert = new function () {

		// image 转 base64
		this.imageToBase64 = function (img) {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0, img.width, img.height);
			const ext = img.src.substring(img.src.lastIndexOf(".") + 1).toLowerCase();
			return canvas.toDataURL("image/" + ext);
		}

	};
	exports(MOD_NAME, convert);
});
