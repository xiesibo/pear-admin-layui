layui.define(['jquery', 'element'], function (exports) {
	"use strict";

	var $ = layui.jquery;
	var element = layui.element;

	var page = function (opt) {
		this.option = opt;
	};

	page.prototype.render = function (opt) {
		var option = {
			url: opt.url,
			elem: opt.elem,
			title: opt.title,
			width: opt.width,
			height: opt.height,
			done: opt.done ? opt.done : function () {
				console.log("菜单渲染成功");
			}
		}
		renderContent(option);
		return new frame(option);
	}

	page.prototype.changePage = function (url, loading) {
		var $frameLoad = $("#" + this.option.elem).find(".pear-frame-loading");
		var $frame = $("#" + this.option.elem + " .pear-frame-content");
		if(loading) {
			$frameLoad.css({
				display: 'block'
			});
		}
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'html',
			success: function (data) {
				$frame.html(data)
				$frame.attr("src", url);
				$frameLoad.fadeOut(1000);
				element.init();
			},
			error: function (xhr, textstatus, thrown) {
				return layer.msg('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！');
			}
		});
	}

	page.prototype.changePageByElement = function (elem, url, loading) {
		var $frameLoad = $("#" + elem).find(".pear-frame-loading");
		var $frame = $("#" + elem + " .pear-frame-content");
		if(loading) {
			$frameLoad.css({
				display: 'block'
			});
		}
		$.ajax({
			url: url,
			type: 'get',
			dataType: 'html',
			success: function (data) {
				$frame.html(data)
				$frame.attr("src", url);
				$frameLoad.fadeOut(1000);
				element.init();
			},
			error: function (xhr, textstatus, thrown) {
				return layer.msg('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！');
			}
		});
	}

	page.prototype.refresh = function (loading) {
		var $frameLoad = $("#" + this.option.elem).find(".pear-frame-loading");
		var $frame = $("#" + this.option.elem).find(".pear-frame-content");
		if(loading) {
			$frameLoad.css({
				display: 'block'
			});
		}
		$.ajax({
			url: $frame.attr("src"),
			type: 'get',
			dataType: 'html',
			success: function (data) {
				$frame.html(data)
				$frameLoad.fadeOut(1000);
				element.init();
			},
			error: function (xhr, textstatus, thrown) {
				return layer.msg('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！');
			}
		});
	}

	function renderContent(option) {

		$("#" + option.elem).html(`
			<div class='pear-frame'>
				<div class='pear-frame-content'></div>
				<div class="pear-frame-loading">
					<div class="ball-loader">
						<span></span>
						<span></span>
						<span></span>
						<span></span>
					</div>
				</div>
			</div>`);
		
		var $frame = $("#" + option.elem).find(".pear-frame-content");

		$.ajax({
			url: option.url,
			type: 'get',
			dataType: 'html',
			success: function (data) {
				$frame.html(data);
				$frame.attr("src", option.url);
				element.init();
			},
			error: function (xhr, textstatus, thrown) {
				return layer.msg('Status:' + xhr.status + '，' + xhr.statusText + '，请稍后再试！');
			}
		});
	}

	exports('page', new page());
});
