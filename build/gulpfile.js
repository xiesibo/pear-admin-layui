/**
 layuiAdmin pro 构建
*/

var pkg = require('./package.json');
var inds = pkg.independents;

var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default;
var minify = require('gulp-minify-css');
var minifyHtml = require('gulp-minify-html');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var header = require('gulp-header');
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');

//获取参数
var argv = require('minimist')(process.argv.slice(2), {
  default: {
    ver: 'all' 
  }
})

//注释
,note = [
  '/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> License By <%= pkg.homepage %> */\n <%= js %>'
  ,{pkg: pkg, js: ';'}
]
,srcDir = './PearAdminBaitqt'
,destDir = './dist' //构建的目标目录
,releaseDir = '../pack/layuiAdmin.pack/'+ pkg.name +'-v' + pkg.version //发行版本目录

//任务
,task = {
  //压缩 JS
  minjs: function(){
    var src = [
      srcDir+'/**/*.js'
      //,'!'+srcDir+'/view/echarts/**/*.js'
      //,'!'+srcDir+'/config.js'
      //,'!'+srcDir+'/lib/extend/echarts.js'
    ];
    
    return gulp.src(src).pipe(uglify({ 
      //mangle: { toplevel: true },
      mangle: true,        //类型：Boolean 默认：true， 是否修改变量名
      compress: true,      //类型：Boolean 默认：true， 是否完全压缩
      output: {
        comments: false,        //类型：Boolean 默认：true， 是否保留注释
      }
    }))
     .pipe(header.apply(null, note))
    .pipe(gulp.dest(destDir));
  }
  
  //压缩 CSS
  ,mincss: function(){
    var src = [
      srcDir+'/**/*.css'
    ]
     ,noteNew = JSON.parse(JSON.stringify(note));
     
     
    noteNew[1].js = '';
    
    return gulp.src(src).pipe(minify({
      compatibility: 'ie7'
    })).pipe(header.apply(null, noteNew))
    .pipe(gulp.dest(destDir));
  }

  ,minihtml:function(){
    var src = [
      srcDir+'/**/*.html'
    ]
    return gulp.src(src).pipe(minifyHtml({ collapseWhitespace: true,comments:false })) 
    .pipe(gulp.dest(destDir));
  }
  
  //复制文件夹
  ,mv: function(){    
    /*gulp.src('./src/config.js')
    .pipe(gulp.dest(destDir));
    
    gulp.src('./src/lib/extend/echarts.js')
    .pipe(gulp.dest(destDir + '/lib/extend'));
    */
    gulp.src(srcDir+'/admin/data/*.json')
    .pipe(gulp.dest(destDir + '/admin/data'));

    gulp.src(srcDir+'/admin/images/*')
    .pipe(gulp.dest(destDir + '/admin/images'));

    gulp.src(srcDir+'/component/layui/font/*')
    .pipe(gulp.dest(destDir + '/component/layui/font/'));

    gulp.src(srcDir+'/component/layui/css/modules/**/*')
    .pipe(gulp.dest(destDir + '/component/layui/css/modules/'));

    gulp.src(srcDir+'/component/pear/font/*.json')
    .pipe(gulp.dest(destDir + '/component/pear/font/'));

    gulp.src(srcDir+'/component/pear/font/*.ttf')
    .pipe(gulp.dest(destDir + '/comonent/pear/font/'));

    gulp.src(srcDir+'/component/pear/font/*.woff')
    .pipe(gulp.dest(destDir + '/component/pear/font/'));

    gulp.src(srcDir+'/component/pear/font/*.woff2')
    .pipe(gulp.dest(destDir + '/component/pear/font/'));

    gulp.src(srcDir+'/component/pear/module/tinymce/tinymce/*')
    .pipe(gulp.dest(destDir + '/component/pear/module/tinymce/tinymce/'));

    gulp.src(srcDir+'/component/pear/module/tinymce/tinymce/*')
    .pipe(gulp.dest(destDir + '/component/pear/module/tinymce/tinymce/'));



    

    gulp.src(srcDir+'/config/*')
    .pipe(gulp.dest(destDir + '/config'));



    return gulp.src(srcDir+'/style/res/**/*')
    .pipe(gulp.dest(destDir + '/style/res'));
    
    return gulp.src('./src/views/**/*')
    .pipe(gulp.dest(destDir + '/views'));
  }
};


//清理
gulp.task('clear', function(cb) {
  return del(['./dist/*'], cb);
});
gulp.task('clearRelease', function(cb) {
  return del(['./json/*', releaseDir], cb);
});

gulp.task('minjs', task.minjs);
gulp.task('mincss', task.mincss);
gulp.task('minify-html', task.minihtml);

gulp.task('mv', task.mv);

gulp.task('src', function(){ //命令：gulp src
  return gulp.src('./dev-src/**/*')
  .pipe(gulp.dest(srcDir));
});

//构建核心源文件
gulp.task('default', ['clear', 'src'], function(){ //命令：gulp
  for(var key in task){
    task[key]();
  }
});

//发行 - layuiAdmin 官方使用
gulp.task('release', function(){ //命令：gulp && gulp release
  
  //复制核心文件
  gulp.src('./dist/**/*')
  .pipe(gulp.dest(releaseDir + '/dist'));
  
  gulp.src(srcDir+'/**/*')
  .pipe(gulp.dest(releaseDir + '/src'));

  //复制 json
  gulp.src('./dev/json/**/*')
  .pipe(gulp.dest('./json'))
  .pipe(gulp.dest('./start/json'))
  .pipe(gulp.dest(releaseDir + '/start/json'));

  //复制并转义宿主页面
  gulp.src('./dev/index.html')
    .pipe(replace(/\<\!-- clear s --\>([\s\S]*?)\<\!-- clear e --\>/, ''))
    .pipe(replace('//local.res.layui.com/layui/src', 'layui'))
    .pipe(replace("base: '../dev-src/'", "base: '../dist/'"))
    .pipe(replace('@@version@@', pkg.version))
  .pipe(gulp.dest('./start'))
  .pipe(gulp.dest(releaseDir + '/start'));
  
  //复制帮助文件
  gulp.src([
    './帮助/*'
    ,'!./帮助/说明.txt'
  ]).pipe(gulp.dest(releaseDir + '/帮助'));
  
  gulp.src([
    './帮助/说明.txt'
  ]).pipe(gulp.dest(releaseDir));
  
  
  //复制 gulpfile
  gulp.src([
    'gulpfile.js'
    ,'package.json'
  ]).pipe(gulp.dest(releaseDir));
  
  //说明
  gulp.src('../pack/说明.txt')
  .pipe(gulp.dest('../pack/layuiAdmin.pack'));
  
  //复制 layui
  return gulp.src('../../../../res/layui/rc/**/*')
  .pipe(gulp.dest('./start/layui'))
  .pipe(gulp.dest(releaseDir + '/start/layui'))
});






