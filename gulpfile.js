var gulp = require('gulp'),
	gutil = require('gulp-util'),
	sass = require('gulp-sass'),
	browserSync = require('browser-sync'),
	concat = require('gulp-concat'),
	//uglify = require('gulp-uglify'),
	cleanCSS = require('gulp-clean-css'),
	rename = require('gulp-rename'),
	del = require('del'),
	imagemin = require('gulp-imagemin'),
	cache = require('gulp-cache'),
	autoprefixer = require('gulp-autoprefixer'),
	ftp = require('vinyl-ftp'),
	notify = require('gulp-notify'),
	rsync = require('gulp-rsync');

gulp.task('js', function() {
	return (
		gulp
			.src([
				'app/libs/jquery/index.js',
				'app/libs/inputmask/index.js',
				// 'app/libs/fullpage/index.js',
				'app/libs/mobile-menu/index.js',
				'app/libs/modal/index.js',
				'app/libs/slider/index.js',
				// 'app/libs/slider/new_slider.js',
				'app/libs/slider/new_slider_without_comment.js',
				'app/libs/link-activator/index.js',
				'app/libs/animator/index.js',
				// 'app/js/common.js', // Всегда в конце
			])
			.pipe(concat('scripts.min.js'))
			// .pipe(uglify()) // Минимизировать весь js (на выбор)
			.pipe(gulp.dest('app/js'))
			.pipe(browserSync.reload({ stream: true }))
	);
});

gulp.task('browser-sync', function() {
	browserSync({
		server: {
			baseDir: 'app',
		},
		notify: false,
	});
});

gulp.task('sass', function() {
	return (
		gulp
			.src('app/sass/**/*.sass')
			.pipe(sass({ outputStyle: 'expand' }).on('error', notify.onError()))
			.pipe(rename({ suffix: '.min', prefix: '' }))
			.pipe(autoprefixer(['last 15 versions']))
			// .pipe(cleanCSS()) // Опционально, закомментировать при отладке
			.pipe(gulp.dest('app/css'))
			.pipe(browserSync.reload({ stream: true }))
	);
});

gulp.task('watch', ['sass', 'js', 'browser-sync'], function() {
	gulp.watch('app/sass/**/*.sass', ['sass']);
	gulp.watch(['libs/**/*.js', 'app/js/common.js'], ['js']);
	gulp.watch('app/*.html', browserSync.reload);
});

gulp.task('imagemin', function() {
	return (
		gulp
			.src('app/img/**/*')
			// .pipe(cache(imagemin())) // Cache Images
			.pipe(imagemin())
			.pipe(gulp.dest('dist/img'))
	);
});

gulp.task('build', ['removedist', 'imagemin', 'sass', 'js'], function() {
	var buildFiles = gulp.src(['app/*.html', 'app/*.php', 'app/.htaccess']).pipe(gulp.dest('dist'));

	var buildCss = gulp.src(['app/css/index.min.css']).pipe(gulp.dest('dist/css'));

	var buildJs = gulp.src(['app/js/scripts.min.js']).pipe(gulp.dest('dist/js'));

	var buildFonts = gulp.src(['app/fonts/**/*']).pipe(gulp.dest('dist/fonts'));
});

gulp.task('deploy', function() {
	var conn = ftp.create({
		host: 'host',
		user: 'user',
		password: 'password',
		parallel: 10,
		log: gutil.log,
	});
	return (
		gulp
			.src('dist/**/*.*', { buffer: false })
			//.pipe(conn.newer('/multikey_studio/public_html/'))
			.pipe(conn.dest('path'))
	);
});

gulp.task('rsync', function() {
	return gulp.src('dist/**').pipe(
		rsync({
			root: 'dist/',
			hostname: 'username@yousite.com',
			destination: 'yousite/public_html/',
			// include: ['*.htaccess'], // Скрытые файлы, которые необходимо включить в деплой
			recursive: true,
			archive: true,
			silent: false,
			compress: true,
		})
	);
});

gulp.task('removedist', function() {
	return del.sync('dist');
});
gulp.task('clearcache', function() {
	return cache.clearAll();
});

gulp.task('location', function() {
	return setTimeout(function() {
		gutil.log('Your code is running at http://localhost:3000/.');
	}, 2000);
});
gulp.task('default', ['watch', 'location']);
