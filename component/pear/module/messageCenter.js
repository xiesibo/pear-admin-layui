layui.define(['table', 'jquery', 'element', 'dropdown'], function (exports) {
    "use strict";

    var MOD_NAME = 'messageCenter',
        $ = layui.jquery,
        dropdown = layui.dropdown,
        element = layui.element;

    var message = function (opt) {
        this.option = opt;
    };

    message.prototype.render = function (opt) {
        //默认配置值
        var option = {
            elem: opt.elem,
            url: opt.url ? opt.url : false,
            height: opt.height,
            data: opt.data
        }
        if (option.url != false) {
            option.data = getData(option.url);

            $(`${opt.elem}`).append(`<li class="layui-nav-item" lay-unselect="">
            <a href="#" class="notice layui-icon layui-icon-notice"></a>
            </li>`);
            
            var messageContent = createHtml(option);

            dropdown.render({
                elem: option.elem,
                align: "center",
                content: messageContent,
            })
        }
        
        return new message(option);
    }

    message.prototype.click = function (callback) {
        $("*[notice-id]").click(function (event) {
            event.preventDefault();
            var id = $(this).attr("notice-id");
            var title = $(this).attr("notice-title");
            var context = $(this).attr("notice-context");
            var form = $(this).attr("notice-form");
            callback(id, title, context, form);
        })
    }

    /** 同 步 请 求 获 取 数 据 */
    function getData(url) {
        $.ajaxSettings.async = false;
        var data = null;
        $.get(url, function (result) {
            data = result;
        });
        $.ajaxSettings.async = true;
        return data;
    }

    function createHtml(option) {

        var count = 0;
        var notice = '<div class="pear-message-center"><div class="layui-tab layui-tab-brief">'
        var noticeTitle = '<ul class="layui-tab-title">';
        var noticeContent = '<div class="layui-tab-content" style="height:' + option.height + ';overflow-x: hidden;padding:0px;">';

        $.each(option.data, function (i, item) {

            noticeTitle += `<li class="${i === 0 ? 'layui-this':''}">${item.title}</li>`;
            noticeContent += '<div class="layui-tab-item layui-show">';
          

            $.each(item.children, function (i, note) {
                count++;
                noticeContent += '<div class="message-item" notice-form="' + note.form + '" notice-context="' + note.context +
                    '" notice-title="' + note.title + '" notice-id="' + note.id + '">';

                noticeContent += '<img src="' + note.avatar + '"/><div style="display:inline-block;">' + note.title + '</div>' +
                    '<div class="extra">' + note.time + '</div>' +
                    '</div>';
            })

            noticeContent += '</div>';
        })

        noticeTitle += '</ul>';
        noticeContent += '</div>';
        notice += noticeTitle;
        notice += noticeContent;
        notice += "</div></div>"

        return notice;
    }

    exports(MOD_NAME, new message());
})