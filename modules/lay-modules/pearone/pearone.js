layui.define(["element", "jquery", "layer","form"], function(exports) {
	var element = layui.element,
		$ = layui.$,
		layer = layui.layer,
		form = layui.form;

	// 判断是否在web容器中打开
	if (!/http(s*):\/\//.test(location.href)) {
		return layer.alert("请先将项目部署至web容器（Apache/Tomcat/Nginx/IIS/等），否则部分数据将无法显示");
	}

	pearone = new function() {

		/**
		 *  系统配置
		 * @param name 
		 * @returns {{BgColorDefault: number, urlSuffixDefault: boolean}|*}
		 */
		    var config = {
		    	multileTab: true, 
				homeInfo:'views/system/console.html',
				menuInfo:'api/menu.json'
		    };
			
			
     	    this.config = function(name) {

			
				if (name == undefined) {
					return config;
				} else {
					return config[name];
				}
			},
			this.setConfig = function(b){
				
				config.multileTab = b;
			},
			this.init = function() {
                // 单系统菜单
			    pearone.initMenu(pearone.config('menuInfo')); 
				// 多系统菜单
				pearone.initMenuPlus(pearone.config('menuInfo')); 
				
			 	pearone.initHome(pearone.config('homeInfo')); 
				
				pearone.initTab(pearone.config('multileTab'));

			},
			this.initMenu = function(url){
				
			   console.log("初始化单系统菜单")
				//清空菜单栏
			  $(".layui-side #menuEnd").html("");
			  $(".layui-header #topMenu").html("");
				
				var leftHtml= '<ul class="layui-nav layui-nav-tree" id="menu" lay-filter="test">'
				$.ajaxSettings.async = false;
		        $.get(url, function(result){
				      $.each(result,function(i,item){
						             var content='<li class="layui-nav-item" >';
						             if(item.type==0){
									    content+='<a  href="javascript:;" href="javascript:;"><i class="'+item.icon+'"></i><span>'+item.title+'</span></a>';
						             }else if(item.type==1){
										content+='<a class="site-demo-active" data-url="'+item.href+'" data-id="'+item.id+'" data-title="'+item.title+'" href="javascript:;" href="javascript:;"><i class="'+item.icon+'"></i><span>'+item.title+'</span></a>';
									 }
									 //这里是添加所有的子菜单
						             content+=pearone.loadchild(item);
						             content+='</li>';
						             
									 
									 leftHtml+=content;
									 
	                    });
						leftHtml+="</ul>";
						$("#menuEnd").append(leftHtml);
						element.init();
				        pearone.initTab(pearone.config('multileTab'));
			    });
				$.ajaxSettings.async = true;
				
				//重新注入灵魂
				
				
		             
				
				
				
			},
			this.initMenuPlus = function(url){
				//顶部菜单
				var headHtml = "";
				//左边菜单
				var leftHtml = "";
				console.log("初始化多系统菜单");
		        $(".layui-side #menuEnd").html("");
		        $(".layui-header #topMenu").html("");
						
			    $.ajaxSettings.async = false;
				$.get(url,function(result){
					//每一个菜单
					 var leftMenuEnd ='<ul class="layui-nav layui-nav-tree leftMenu" id="leftMenu" lay-filter="test">';
					 //遍历第一层,既顶部菜单
				     $.each(result,function(i,item){
						      //设置每一个菜单的唯一值
						     leftMenuEnd ='<ul  class="layui-nav layui-nav-tree leftMenu" id="lay-'+item.id+'" lay-filter="test">';
						 
				             var content='<li class="layui-nav-item" id="lay-'+item.id+'">';
				             if(item.type==0){
							    content+='<a  href="javascript:;" href="javascript:;"><i class="'+item.icon+'"></i>&nbsp;&nbsp;<span>'+item.title+'</span></a>';
				             }else if(item.type==1){
								content+='<a class="site-demo-active" data-url="'+item.href+'" data-id="'+item.id+'" data-title="'+item.title+'" href="javascript:;" href="javascript:;"><i class="'+item.icon+'"></i>&nbsp;&nbsp;<span>'+item.title+'</span></a>';
							 }
							 //这里是添加所有的子菜单
				            /* content+=pearone.loadchild(item); */
							   //遍历基本的左侧菜单
							   $.each(item.children,function(j,item1){
								 
								var leftMenu='<li class="layui-nav-item">';
								
								if(item1.type==0){
								   leftMenu+='<a  href="javascript:;" href="javascript:;"><i class="'+item1.icon+'"></i><span>'+item1.title+'</span></a>';
								}else if(item1.type==1){
								   
								   leftMenu+='<a class="site-demo-active" data-url="'+item1.href+'" data-id="'+item1.id+'" data-title="'+item1.title+'" href="javascript:;" href="javascript:;"><i class="'+item1.icon+'"></i><span>'+item1.title+'</span></a>';
																 
								}
								
								leftMenu+= pearone.loadchild(item1);
								leftMenu+='</li>';
				                leftMenuEnd+=leftMenu;
							})
							
							
							leftMenuEnd +='</ul>';
							//将每一个菜单拼接到总的 
							leftHtml+=leftMenuEnd;
							
				            content+='</li>';
				            $("#topMenu").append(content);
							
							$("#topMenu li").click(function(){
								var  menuId = $(this).attr("id");
								$(".layui-side .leftMenu").addClass("layui-hide");
								$(".layui-side .leftMenu").removeClass("layui-show");
								$(".layui-side #"+menuId).addClass("layui-show");
								$(".layui-side #"+menuId).removeClass("layui-hide");
							})
							     
				     });
					 
					 $("#menuEnd").append(leftHtml);
					 element.init();
					 pearone.initTab(pearone.config('multileTab'));
					 
					 $("#topMenu li:first-child").addClass("layui-this");
					 $(".layui-side .leftMenu").addClass("layui-hide");
					 $("#menuEnd ul:first-child").addClass("layui-show");
					 $("#menuEnd ul:first-child").removeClass("layui-hide");
					 
				})
				$.ajaxSettings.async = true;
				
				
				/* $.get(url, function(result){
				 
				        $.each(result,function(i,item){
						             var content='<li class="layui-nav-item">';
						             if(item.type==0){
									    content+='<a  href="javascript:;" href="javascript:;"><i class="'+item.icon+'"></i><span>'+item.title+'</span></a>';
						             }else if(item.type==1){
										content+='<a class="site-demo-active" data-url="'+item.href+'" data-id="'+item.id+'" data-title="'+item.title+'" href="javascript:;" href="javascript:;"><i class="'+item.icon+'"></i><span>'+item.title+'</span></a>';
										 
									 }
									 //这里是添加所有的子菜单
						             content+=pearone.loadchild(item);
						             content+='</li>';
						             $("#menu").append(content);
				        });
						element.init();
				        pearone.initTab(pearone.config('multileTab'));
				}); */
				
			}
			this.loadchild = function(obj){
				            if(obj==null){
				                return;
				            }
				 
				            var content='';
				            if(obj.children!=null && obj.children.length>0){
				                content+='<dl class="layui-nav-child">';
				            }else{
				                content+='<dl>';
				            }
				 
				            if(obj.children!=null && obj.children.length>0){
				                $.each(obj.children,function(i,note){
				                    content+='<dd>';
				                    
									if(note.type==0){
										
										content+='<a  href="javascript:;"><i class="'+note.icon+'"></i><span>'+note.title+'</span></a>';
														                   
										
									}else if(note.type==1){
								   
								        console.log("标题:"+note.title);
										
										console.log("链接:"+note.href);
								   
									    content+='<a class="site-demo-active" data-url="'+note.href+'" data-id="'+note.id+'" data-title="'+note.title+'" data-icon="'+note.icon+'" href="javascript:;"><i class="'+note.icon+'"></i><span>'+note.title+'</span></a>';
				                   
								    }
								   
								   
									if
									(note.children==null){
				                        return;
				                    }
				                    content+=pearone.loadchild(note);
				                    content+='</dd>';
				                });
				 
				                content+='</dl>';
				            }
				            console.log(content);
				            return content;
			},
			this.initTab = function(b) {

                pearone.setConfig(b);

				/**初始化Tab页*/
				if (b) {


					$("#oneTab").hide();

					$("#multileTab").show();

					//当点击有site-demo-active属性的标签时，即左侧菜单栏中内容 ，触发点击事件
					$('.site-demo-active').on('click', function() {
						var dataid = $(this);

                        var title  = dataid.attr("data-title");
						var url = dataid.attr("data-url");
						var id = dataid.attr("data-id");

						//这时会判断右侧.layui-tab-title属性下的有lay-id属性的li的数目，即已经打开的tab项数目
						if ($(".layui-tab-title li[lay-id]").length <= 0) {
							//如果比零小，则直接打开新的tab项
							pearone.tabAdd(url, id, title);
						} else {
							//否则判断该tab项是否以及存在
							var isData = false; //初始化一个标志，为false说明未打开该tab项 为true则说明已有
							$.each($(".layui-tab-title li[lay-id]"), function() {
								//如果点击左侧菜单栏所传入的id 在右侧tab项中的lay-id属性可以找到，则说明该tab项已经打开
								if ($(this).attr("lay-id") == dataid.attr("data-id")) {
									isData = true;
								}
							})
							if (isData == false) {
								//标志为false 新增一个tab项
								var title  = '<i class="'+dataid.attr("data-icon")+'"></i>&nbsp;&nbsp;<span>'+dataid.attr("data-title")+'</span>'
								
								pearone.tabAdd(dataid.attr("data-url"), dataid.attr("data-id"),title);
							}
						}
						//最后不管是否新增tab，最后都转到要打开的选项页面上
						pearone.tabChange(dataid.attr("data-id"));
					});


					//绑定下拉菜单事件
					$("#closeThisTabs").on("click", function() {

						var currentTabId = $(".pearone-layout .layui-body .layui-tab-title .layui-this").attr("lay-id");

						if (currentTabId != 1) {
							pearone.tabDelete(currentTabId);
						}
					});

					$("#closeOtherTabs").on("click", function() {

						var currentTabId = $(".pearone-layout .layui-body .layui-tab-title .layui-this").attr("lay-id");

						var tabtitle = $(".layui-tab-title li");
						$.each(tabtitle, function(i) {
							if ($(this).attr("lay-id") != currentTabId && $(this).attr("lay-id") != 1) {
								pearone.tabDelete($(this).attr("lay-id"))
							}
						})
					});

					$("#closeAllTabs").on("click", function() {

						var tabtitle = $(".layui-tab-title li");

						$.each(tabtitle, function(i) {

							if ($(this).attr("lay-id") != 1) {
								pearone.tabDelete($(this).attr("lay-id"))
							}
						})
					});
					
				   $("#leftPage").on("click", function() {
					      pearone.leftPage();
				   })
				
				   $("#rightPage").on("click", function() {
					      pearone.rightPage();
				   })
				
					
                    
					pearone.initHome(pearone.config('homeInfo'));
				
 				} else {

                    //标签页菜单单击监听
					$('.site-demo-active').on('click', function() {

						var url = $(this).attr("data-url");

						$("#mainFrame").attr("src", url);
					})


					$("#oneTab").show();

					$("#multileTab").hide();
					
					pearone.initHome(pearone.config('homeInfo'));


				}

			},
			this.initHome = function(url){
				
				//初始化首页信息
				if(pearone.config('multileTab')){
				  
					//清空tab信息来初始化首页
			        $(".pearone-layout .layui-body .layui-tab-title").html("");
					$(".pearone-layout .layui-body .layui-tab-content").html("");
					pearone.tabAdd(url,1,"<i class='layui-icon layui-icon-home'></i>");
					pearone.tabChange(1);
				
				}else{
					
					$("#mainFrame").attr("src",url);
				}
				
			},
			this.tabAdd = function(url, id, name) {
				//查询该编号是否存在,如果存在进行相应替换
				console.log("添加TaB:"+url);
				
			    element.tabAdd('mainFrame', {
					title: name,
					content: '<iframe data-frameid="' + id +
						'" frameborder="no" border="0" marginwidth="0" marginheight="0" style="width: 100%;height: 100%;" src="' +
						url +
						'" ></iframe>',
					id: id
				})
				element.render('tab');
			},
			this.tabChange = function(id) {
				//切换到指定Tab项
				element.tabChange('mainFrame', id); //根据传入的id传入到指定的tab项
			},

			this.tabDelete = function(id) {

				element.tabDelete("mainFrame", id); //删除
			},
			this.tabDeleteAll = function(ids) { //删除所有
				$.each(ids, function(i, item) {
					element.tabDelete("mainFrame", item); //ids是一个数组，里面存放了多个id，调用tabDelete方法分别删除
				})
			},
			this.setTheme = function() {


			},
			this.rollPage =  function(d) {
				var $tabTitle = $('.layui-body .layui-tab .layui-tab-title');
				var left = $tabTitle.scrollLeft();
				if ('left' === d) {
					$tabTitle.scrollLeft(left - 300);
				} else if ('auto' === d) {
					var autoLeft = 0;
					$tabTitle.children("li").each(function() {
						if ($(this).hasClass('layui-this')) {
							return false;
						} else {
							autoLeft += $(this).outerWidth();
						}
					});
					// console.log(autoLeft);
					$tabTitle.scrollLeft(autoLeft - 47);
				} else {
					$tabTitle.scrollLeft(left + 300);
				}
			},
			// 左滑动tab
			this.leftPage = function() {
				console.log("左滑");
				pearone.rollPage("left");
			},
			// 右滑动tab
			this.rightPage = function() {
				console.log("右滑");
				pearone.rollPage();
			}


	}
    
	
	/**
	 * 菜单栏隐藏
	 * */
	$(".zoom-tool").click(function() {
		if ($(this).attr("show-data") == 0) {
			$('.pearone-layout .layui-side .layui-nav-item').off('mouseenter').unbind('mouseleave');
			$("body").removeClass("pearone-mini");
			$(this).attr("show-data", 1);
		} else {
			$(".layui-side .layui-nav-item").hover(function() {
	
				$(this).children(".layui-nav-child").addClass("pearone-menu-hover");
				
				var top = $(this).offset().top;
			
			
			    var css = {
			  
					 top:top+'px'
				}
				
				$(this).children(".layui-nav-child").css(css);
				               
		}, function() {
			
				$(this).children(".layui-nav-child").removeClass("pearone-menu-hover");
				
				var css = {
							  
					 top:'0px'
				}
				
				$(this).children(".layui-nav-child").css(css);
			})
       
	   
			$(".pearone-layout .layui-side .layui-nav-item").removeClass("layui-nav-itemed");
			$("body").addClass("pearone-mini");
			$(this).attr("show-data", 0);
		}
	})

	$(".setTheme").click(function() {
		

		
		layer.open({
		    type: 2,
		    title: false,
		    closeBtn: false, //不显示关闭按钮
		    shade: [0],
		    shadeClose: true,
		    area: ['300px', 'calc(100% - 90px)'],
		    offset: 'rb', //右下角弹出
		    time: 0, //2秒后自动关闭
		      anim   : -1,
		      skin:'layer-anim-07',
		      content : 'views/system/theme.html',
		      cancel  : function (index) {
		        var $layero = $('#layui-layer' + index);
		        $layero.animate({
		          left : $layero.offset().left + $layero.width()
		        }, 300, function () {
		          layer.close(index);
		        });
		        return false;
		      }
		    });
		
	})
	

	
	
	/**
	 * 通用下拉按钮实现
	 * */
	$(".downpanel").on("click",".layui-select-title",function(e){
		      $(".layui-form-select").not($(this).parents(".layui-form-select")).removeClass("layui-form-selected");
		      $(this).parents(".layui-form-select").toggleClass("layui-form-selected");
		      e.stopPropagation();
		    });
		    $(document).click(function(event){
		      //搜索框
		      var _con2 = $(".downpanel");
		      if(!_con2.is(event.target) && (_con2.has(event.target).length ===0)){
		         _con2.removeClass("layui-form-selected");
		         console.log(_con2);
		      }
	});    
	

	exports("pearone", pearone);
});
