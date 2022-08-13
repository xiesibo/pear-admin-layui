var pkg = require('./package.json');
var inds = pkg.independents;
var gulp = require('gulp');
var uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var minify = require('gulp-clean-css');
var minifyHtml = require('gulp-minify-html');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var header = require('gulp-header');
var del = require('del');
var gulpif = require('gulp-if');
var minimist = require('minimist');
var argv = require('minimist')(process.argv.slice(2), { default: { ver: 'all' }});
var note = ['/** <%= pkg.name %>-v<%= pkg.version %> <%= pkg.license %> License By <%= pkg.homepage %> */\n <%= js %>', {pkg: pkg, js: ';'}];
var destDir = './dist'; 
var srcDir = './src';

var task = {
  minjs: function(){
    var src = [
      srcDir+'/**/*.js'
      ,'!'+srcDir+'/component/pear/module/tinymce/tinymce/**/*.js'
      ,'!'+srcDir+'/component/pear/module/echarts.js'
    ];
    return gulp.src(src).pipe(babel({
      presets: ['es2015'],
      compact: false
    })).pipe(uglify({
      mangle: true,       
      compress: true,      
      output: { comments: false }
    }))
    .pipe(header.apply(null, note))
    .pipe(gulp.dest(destDir));
  },
  mincss: function(){
    var noteNew = JSON.parse(JSON.stringify(note));
    noteNew[1].js = '';
    return gulp.src([srcDir + '/**/*.css'])
	.pipe(minify({compatibility: 'ie8'}))
	.pipe(header.apply(null, noteNew))
    .pipe(gulp.dest(destDir));
  },
  minihtml:function(){
    return gulp.src([srcDir+'/**/*.html'])
	.pipe(minifyHtml({ collapseWhitespace: true,comments:false })) 
    .pipe(gulp.dest(destDir));
  },
  mv: function(){    
    gulp.src(srcDir+'/admin/data/*.json').pipe(gulp.dest(destDir + '/admin/data'));
    gulp.src(srcDir+'/admin/images/*').pipe(gulp.dest(destDir + '/admin/images'));
    gulp.src(srcDir+'/component/layui/font/*').pipe(gulp.dest(destDir + '/component/layui/font/'));
    gulp.src(srcDir+'/component/layui/css/modules/**/*').pipe(gulp.dest(destDir + '/component/layui/css/modules/'));
    gulp.src(srcDir+'/component/pear/font/**/*.json').pipe(gulp.dest(destDir + '/component/pear/font/'));
    gulp.src(srcDir+'/component/pear/font/**/*.ttf').pipe(gulp.dest(destDir + '/component/pear/font/'));
    gulp.src(srcDir+'/component/pear/font/**/*.woff').pipe(gulp.dest(destDir + '/component/pear/font/'));
    gulp.src(srcDir+'/component/pear/font/**/*.woff2').pipe(gulp.dest(destDir + '/component/pear/font/'));
    gulp.src(srcDir+'/component/pear/module/echarts.js').pipe(gulp.dest(destDir + '/component/pear/module/'));
    gulp.src(srcDir+'/component/pear/module/tinymce/tinymce/**/*').pipe(gulp.dest(destDir + '/component/pear/module/tinymce/tinymce/'));
    gulp.src(srcDir+'/config/*').pipe(gulp.dest(destDir + '/config'));
  }
};

gulp.task('clear', function(cb) { return del(['./dist/*'], cb); });
gulp.task('minjs', task.minjs);
gulp.task('mincss', task.mincss);
gulp.task('minify-html', task.minihtml);
gulp.task('mv', task.mv);
gulp.task('src', function(){ return gulp.src('./!**!/!*').pipe(gulp.dest(srcDir)); });
gulp.task('default', ['clear','src'], function(){ 
  for(var key in task){
    task[key]();
  }
});