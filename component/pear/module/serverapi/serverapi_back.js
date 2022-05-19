layui.define(['jquery','popup','hash','context'], function(exports){
    "use strict";

    var $ = layui.$;
    var context = layui.context;
    var popup = layui.popup;
    var MOD_NAME ="serverapi" ;


    const ajaxPromise=  param => {
        return new Promise((resovle, reject) => {
            $.ajax({
                "type":param.type || "get",
                "async":param.async || true,
                "url":param.url,
                "data":param.data || "",
                "success": res => {
                    resovle(res);
                },
                "error": (xhr,msg) => {
                    if( xhr.status === 0)
                        //alert('Error : ' + xhr.status + 'You are not connected.');
                        reject({code:2,msg: "网络错误"});
                    else if( xhr.status == "201")
                        reject({code:201,msg: "服务错误"});
                    else if( xhr.status == "404")
                        reject({code:404,msg: "未找到接口"});
                    else if( xhr.status == "500")
                        reject({code:400,msg: "Internal Server 错误 [500]"});
                    else if (exception === 'parsererror')
                        reject({code:1002,msg: "数据格式解析错误"});
                    else if (exception === 'timeout')
                        reject({code:3,msg: "超时错误"});
                    else
                        reject({code:1,msg: "其它错误 status="+xhr.status});
                }
            })
        })
    }
    /*
    function ajaxPromise(url,method,data) {
        var data=data ||null
        var pro = new Promise(function(resolve, reject) {
            var ajax = new XMLHttpRequest();
            method=method || "GET"
            ajax.open(method, url) ;
            ajax.send(JSON.stringify(data));
            ajax.onreadystatechange = function() {
                if (ajax.readyState == 4 && ajax.status == 200) {
                    resolve(ajax.responseText);
                }
            }

            setTimeout(function() {
                reject("请求服务器失败");
                console.log("timeout");
            }, 1000)
        })
        return pro;
    }
    */

    function GetRootPath(path)
    {

        var lastchar = path.substr(path.length-1,1);
        if(lastchar=="/") return path.substr(0,path.length-1);
        return path
    }

    var serverapi = function() {
        this.config = {
            apiPath : "/service/api/" , /*接口地址路径*/
        }
        this.APP_PATH = "/AdminIOT"
        this.cmds = [
            {operator:"sys:login",comment:'登陆'},
            {operator:"sys:logout",comment:'退出'},
            {operator:"sys:get_web_info",comment:'网站信息'},
            {operator:"sys:del_menu",comment:'删除菜单项'},
            {operator:'sys:edit_menu',comment:'更新菜单项'}
        ]
        this.token_id = null;
        this.fresh_id=null;
    };

    serverapi.prototype.init=function(tokenid)
    {

        if(!tokenid || typeof(tokenid)=="undefined"){
            tokenid = context.get("tokenid");
        }
        //console.log("init tokenid=",tokenid);
        this.token_id = tokenid;
        var that = this;
        if(tokenid == null || typeof(tokenid)=="undefined"){
            top.location.href = GetRootPath(this.APP_PATH)+"/login";
            //console.log("未登陆001");
            return false;
        }

        $.ajaxSetup({ //发送请求前触发
            complete: function (xhr) {
                if (xhr.responseJSON && typeof(xhr.responseJSON.code)!="undefined" && xhr.responseJSON.code == 2000) {
                    popup.failure(xhr.responseJSON.msg,function(){
                        context.remove('tokenid');
                        //console.log(GetRootPath(that.APP_PATH)+"/login");
                        top.location.href = GetRootPath(that.APP_PATH)+"/login";
                        //console.log("未登陆002");
                    })
                }else{
                    //console.log(top.doOk());
                    //console.log(window.parent.doOk());
                }
            },
            beforeSend: function (xhr) { //可以设置自定义标头
                that.token_id = context.get("tokenid");
                xhr.setRequestHeader('Authorization', "Bearer "+that.token_id);
            }
        })
    }
    serverapi.prototype.doCommand = function(cmd,method,data)
    {
        data = data || {} ;
        data.operator = cmd;
        method = method || "GET";
        return ajaxPromise({url:this.config.apiPath,type:method,data:data});
    }

    /**
     * @method login
     * @param username 用户名
     * @param password 密码
     * @param idenCode 验证码，可以不填
     * @return 反回 Object json
     */
    serverapi.prototype.login = function(username,password,idenCode){
        //console.log("执行登陆");
        password = layui.hash.md5(password);
        return this.doCommand("sys:login","POST",{username:username,password:password});
    };
    var serverapi = new serverapi();
    exports(MOD_NAME, serverapi);
});
