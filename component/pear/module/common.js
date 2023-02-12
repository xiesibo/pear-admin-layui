layui.define(['jquery', 'element','table'], function(exports) {
	"use strict";

	/**
	 * 常用封装类
	 * */
	var MOD_NAME = 'common',
		$ = layui.jquery,
		table = layui.table,
		element = layui.element;

	var common = new function() {
		
		/**
		 * 获取当前表格选中字段
		 * @param obj 表格回调参数
		 * @param field 要获取的字段
		 * */
		this.checkField = function(obj, field) {
			let data = table.checkStatus(obj.config.id).data;
			if (data.length === 0) {
				return "";
			}
			let ids = "";
			for (let i = 0; i < data.length; i++) {
				ids += data[i][field] + ",";
			}
			ids = ids.substr(0, ids.length - 1);
			return ids;
		}
		
		/**
		 * 当前是否为与移动端
		 * */
		this.isModile = function(){
			if ($(window).width() <= 768) {
				return true;
			}
			return false;
		}
		
		
		/**
		 * 提交 json 数据
		 * @param data 提交数据
		 * @param href 提交接口
		 * @param ajaxtype 提交方式
		 * @param table 刷新父级表
		 * @param callback 自定义回调函数
		 * */
		this.submit = function(href,data,ajaxtype,table,callback,is_async,is_cache){
			if(ajaxtype==''){ ajaxtype='post';}

			if(data!==undefined){
				$.ajaxSetup({data:JSON.stringify(data)});
			}else {
				$.ajaxSetup({data:''});
			}
			if(is_async!==undefined){
				$.ajaxSetup({async:is_async });
			}
			if(is_cache!==undefined){
				$.ajaxSetup({cache:is_cache });
			}
			$.ajax({
			    url:href,
			    dataType:'json',
			    contentType:'application/json',
			    type:ajaxtype,
				success:callback !=null?callback:function(result){
			        if(result.code==1){
			            layer.msg(result.msg,{icon:1,time:1000},function(){
			            	if(parent.layer.getFrameIndex(window.name)!=undefined){
								parent.layer.close(parent.layer.getFrameIndex(window.name));//关闭当前页
								if(table!=null){parent.layui.table.reload(table);}
							}else {
								if(table!=null){layui.table.reload(table);}
							}
			            });
			        }else{
			            layer.msg(result.msg,{icon:2,time:1000});
			        }
			    },
				error:function(xhr){
					if(xhr.status==401)
					{
						layer.msg('权限不足，您无法访问受限资源或数据',{icon: 5});
					}
					if(xhr.status==404)
					{
						layer.msg('请求url地址错误，请确认后刷新重试',{icon: 5});
					}
					if(xhr.status==419)
					{
						layer.msg('长时间未操作，自动刷新后重试！',{icon: 5});
						setTimeout(function () { window.location.reload();}, 2000);
					}
					if(xhr.status==429)
					{
						layer.msg('尝试次数太多，请一分钟后再试',{icon: 5});
					}
					if(xhr.status==500)
					{
						layer.msg(xhr.responseJSON.message,{icon: 5});
					}
				}
				,complete:function (xhr,status){

				}
			})
		}
	}
	exports(MOD_NAME, common);
});
