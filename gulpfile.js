const gulp = require('gulp'),
    gutil = require('gulp-util'),
    sass = require('gulp-sass'),
    browserSync = require('browser-sync').create(),
    concat = require('gulp-concat'),
    uglify = require('gulp-uglify-es').default,
    cleanCSS = require('gulp-clean-css'),
    concatCss = require('gulp-concat-css'),
    rename = require('gulp-rename'),
    del = require('del'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    svgSprite = require('gulp-svg-sprite'),
    svgmin = require('gulp-svgmin'),
    cheerio = require('gulp-cheerio'),
    replace = require('gulp-replace'),
    autoprefixer = require('gulp-autoprefixer'),
    notify = require("gulp-notify");

gulp.task('sass', function () {
    return gulp.src('app/scss/**/*.scss')
        .pipe(sass({
            outputStyle: 'expand'
        }).on("error", notify.onError()))
        .pipe(gulp.dest('app/css'));
});

gulp.task('css', function () {
    return gulp.src([
        'app/css/normalize.css',
        'app/css/my-reset.css',
        'app/css/main.css'
        ])
        .pipe(autoprefixer(['last 3 versions']))
        .pipe(cleanCSS({
            level: 2
        }))
        .pipe(concatCss('style.min.css'))
        .pipe(gulp.dest('app'))
});

gulp.task('js', function () {
    return gulp.src([
		'app/js/common.js'
		])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('app'))
});

gulp.task('imagemin', function () {
    return gulp.src(['app/img/**/*', '!app/img/**/*.svg'])
        .pipe(cache(imagemin()))
        .pipe(imagemin())
        .pipe(gulp.dest('dist/img'));
});

gulp.task('svg', function () {
    return gulp.src('app/img/*.svg')
        .pipe(svgmin({
            js2svg: {
                pretty: true
            }
        }))
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {
                xmlMode: true
            }
        }))
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    sprite: "../sprite.svg"
                }
            }
        }))
        .pipe(gulp.dest('app/img'));
});

gulp.task('clearcache', function () {
    return cache.clearAll();
});

gulp.task('removedist', function (done) {
    done();
    return del.sync('dist');
});

gulp.task('move', function (done) {
    gulp.src([
		'app/*.html',
		]).pipe(gulp.dest('dist'));

    gulp.src([
		'app/style.min.css',
		]).pipe(gulp.dest('dist'));

    gulp.src([
		'app/scripts.min.js',
		]).pipe(gulp.dest('dist'));

    gulp.src([
		'app/img/sprite.svg',
		], { allowEmpty: true }).pipe(gulp.dest('dist/img'));

    gulp.src([
		'app/fonts/**/*',
		]).pipe(gulp.dest('dist/fonts'));
    done();
});

gulp.task('watch', function (done) {
    browserSync.init({
        server: "app"
    });
    gulp.watch('app/scss/**/*.scss', gulp.series('sass'));
    gulp.watch('app/css/**/*.css', gulp.series('css'));
    gulp.watch('app/js/**/*.js', gulp.series('js'));
    gulp.watch('app/*.html').on("change", browserSync.reload);
    gulp.watch('app/scss/**/*.scss').on('change', browserSync.reload);
    gulp.watch('app/css/**/*.css').on('change', browserSync.reload);
    gulp.watch('app/js/**/*.js').on('change', browserSync.reload);
    done();
});

gulp.task('build', gulp.series('removedist', 'sass', 'css', 'js', 'imagemin', 'move'));

gulp.task('default', gulp.series('sass', 'css', 'js', 'watch'));
