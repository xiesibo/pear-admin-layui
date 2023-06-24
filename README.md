### 更新日志

- [优化] 移动端 collapse 样式，由圆形调整为正方形。
- [重构] frame.js 组件，重命名为 page.js, 移除 iframe 嵌套。
- [重构] tab.js 组件，重命名为 tabPage.js, 移除 iframe 嵌套。
- [新增] admin.js 模块 setConfigurationProvider 方法，用于自定义 configuration 来源。
- [优化] admin.js 模块 logout 方法，返回值由 boolean 调整为 Promise 类型。 
- [新增] 夜间模式适配，目前已完成整体框架兼容，layui 待完成。