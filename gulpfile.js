const {src, dest, watch, series, parallel } = require("gulp");
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const uglify = require("gulp-uglify-es").default;
const cleanCSS = require("gulp-clean-css");
const image = require("gulp-image");
const sourcemaps = require("gulp-sourcemaps");
const browserSync = require('browser-sync').create();
const sass = require('gulp-sass'); 
sass.compiler = require('node-sass');

// Paths to source files
const files = {
    htmlPath: "src/**/*.html",
    cssPath: "src/**/*.css",
    sassPath: "src/**/*.scss",
    jsPath: "src/**/*.js",
    imagePath: "src/images/*"
}

// Paths to pub files
const pubFiles = {
    htmlPath: "pub/**/*.html",
    cssPath: "pub/**/*.css",
    jsPath: "pub/**/*.js",
    imagePath: "pub/images/*"
}

// Copy html files
function copyHTML() {
    return src(files.htmlPath)
        .pipe(dest("pub"))
}

// Concat and minify js files
function jsTask() {
    return src(files.jsPath)
        .pipe(sourcemaps.init())
            .pipe(concat("main.js"))
            .pipe(uglify())
            .pipe(rename("main.min.js"))
        .pipe(sourcemaps.write())
        .pipe(dest("pub/js"))
}

// Concat and minify css files
function cssTask() {
    return src(files.cssPath)
        .pipe(sourcemaps.init())
            .pipe(concat("main.css"))
            .pipe(cleanCSS())
            .pipe(rename("pureCss.min.css"))
        .pipe(sourcemaps.write())
        .pipe(dest("pub/css"))
}

// Compile scss to css and minify css code
function sassTask() {
    return src(files.sassPath)
        .pipe(sourcemaps.init())
            .pipe(sass().on("error", sass.logError))
            .pipe(cleanCSS())
            .pipe(rename("main.min.css"))
        .pipe(sourcemaps.write())
        .pipe(dest("pub/css"))
}

// Compress and copy images
function imageTask() {
    return src(files.imagePath)
        .pipe(image())
        .pipe(dest("pub/images"))
}

// Watcher, starting a browser sync server and running task depending on change
function watchTask() {
    browserSync.init({
        server: {
            baseDir: "./pub"
        }
    });
    watch(files.htmlPath, copyHTML);
    watch(files.jsPath, jsTask);
    watch(files.cssPath, cssTask);
    watch(files.sassPath, sassTask);
    watch(files.imagePath, imageTask);
    watch([pubFiles.htmlPath, pubFiles.jsPath, pubFiles.cssPath, pubFiles.imagePath]).on("change", browserSync.reload);
}


// Default tasks
exports.default = series(
    parallel(copyHTML, jsTask, cssTask, sassTask, imageTask),
    watchTask
);