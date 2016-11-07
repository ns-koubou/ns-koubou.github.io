const gulp = require('gulp'),
      coffee = require('gulp-coffee'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat');

gulp.task('coffee', () => {
  gulp.src('_js/*.coffee')
    .pipe(coffee())
    .pipe(gulp.dest('_js/'));
});

gulp.task('concat-uglify', () => {
  gulp.src('_js/*.js')
    .pipe(concat('app.js'))
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('assets/js/'));
});

gulp.task('default', ['coffee', 'concat-uglify']);
