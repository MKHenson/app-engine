var fs = require('fs');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var download = require('gulp-download');
var rename = require("gulp-rename");

// CONFIG
// ==============================
var tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));
var tsFiles = tsConfig.files;
var outDir = tsConfig.compilerOptions.outDir;
var modepressPluginDir = "../../modepress/server/dist/plugins/app-engine";

/**
 * Checks to see that all TS files listed exist
 */
gulp.task('check-files', function(){

    // Make sure the files exist
    for (var i = 0, l = tsFiles.length; i < l; i++ )
        if(!fs.existsSync(tsFiles[i]))
        {
            console.log("File does not exist:" + tsFiles[i] );
            process.exit();
        }
})

/**
 * Builds each of the ts files into JS files in the output folder
 */
gulp.task('ts-code', function() {

    return gulp.src(tsFiles, { base: "lib" })
        .pipe(ts({
            "module": tsConfig.compilerOptions.module,
            "removeComments": tsConfig.compilerOptions.removeComments,
            "noEmitOnError": tsConfig.compilerOptions.noEmitOnError,
            "declaration": tsConfig.compilerOptions.declaration,
            "sourceMap": tsConfig.compilerOptions.sourceMap,
            "preserveConstEnums": tsConfig.compilerOptions.preserveConstEnums,
            "target": tsConfig.compilerOptions.target,
            "noImplicitAny": tsConfig.compilerOptions.noImplicitAny
            }))
        .pipe(gulp.dest(outDir));
});

/**
 * This function downloads a definition file from github and writes it to a destination
 * @param {string} url The url of the file to download
 * @param {string} dest The destination folder to move the file to
 */
function getDefinition(url, dest, name) {
    return new Promise(function(resolve, reject) {
        download(url)
            .pipe(rename(name))
            .pipe(gulp.dest(dest))
            .on('error', function(err) {
                throw(err)
            })
            .on('end', function() {
                resolve(true);
            })
    });
}

// Builds the definition
gulp.task('generate-declarations', function() {

    var tsDefinition = gulp.src("lib/definitions/custom/app-engine.d.ts", { base: "lib/definitions/custom" })
       .pipe(gulp.dest("../generated-definitions"));
});

/**
 * Downloads the definition files used in the development of the application and moves them into the definitions folder
 */
gulp.task('install-definitions', function () {
     return Promise.all([
            getDefinition("https://raw.githubusercontent.com/MKHenson/users/dev/dist/definitions/definitions.d.ts", "lib/definitions/required/", "users.d.ts"),
            getDefinition("https://raw.githubusercontent.com/MKHenson/modepress/dev/server/definitions/modepress-api.d.ts", "lib/definitions/required/", "modepress-api.d.ts")
         ]);
});

/**
 * Builds the definitions and
 */
gulp.task('copy-dist', function() {

    return gulp.src(outDir + "/**", { base: "dist" })
        .pipe(gulp.dest(modepressPluginDir));
});

/**
 * Copies the distribution files to the modepress plugin folder
 */
gulp.task('copy-dist', ['ts-code', 'generate-declarations'], function() {

    return gulp.src(outDir + "/**", { base: "dist" })
        .pipe(gulp.dest(modepressPluginDir));
});

gulp.task('install', ['install-definitions']);
gulp.task('build-all', [ 'copy-dist' ]);