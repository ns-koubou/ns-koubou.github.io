const gulp = require('gulp'),
      uglify = require('gulp-uglify'),
      concat = require('gulp-concat');

gulp.task('concat-uglify', () => {
  gulp.src('_js/*.js')
    .pipe(concat('app.js'))
    .pipe(uglify({preserveComments: 'some'}))
    .pipe(gulp.dest('assets/js/'));
});

gulp.task('default', ['concat-uglify']);
