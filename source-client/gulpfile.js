var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ts = require('gulp-typescript');
var util = require('util');
var inject = require('gulp-inject');
var sass = require('gulp-sass');
var filter = require('gulp-filter');
var print = require('gulp-print');
var merge = require('merge-stream');
var fs = require('fs');
var download = require('gulp-download');
var gunzip = require('gulp-gunzip');
var request = require('request');
var source = require('vinyl-source-stream')
var untar = require('gulp-untar');
var gutil = require('gulp-util');
var rename = require('gulp-rename');

// Read the contents of the tsconfig file so we dont have to specify the files twice
var tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));
var tsFiles = tsConfig.files;

// CONFIG
// ==============================
var outDir = "dist";

// Create the type script project file
var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });
var target = gulp.src('./lib/index.html');

/**
 * Adds the relevant bower files to the index html
 */
gulp.task('bower', function() {

    var sources = gulp.src([
        './third-party/jquery/dist/jquery.js',
        './third-party/jquery-hotkeys/jquery.hotkeys.js',
        './third-party/jquery-mousewheel/jquery.mousewheel.js',
        './third-party/jstepper/jquery.jstepper.js',
        './third-party/jquery-scrollTo/jquery.scrollTo.js',
        './third-party/jquery-ui/ui/core.js',
        './third-party/jquery-ui/ui/widget.js',
        './third-party/jquery-ui/ui/mouse.js',
        './third-party/jquery-ui/ui/draggable.js',
        './third-party/jquery-ui/ui/droppable.js',
        './third-party/jquery-ui/ui/resizable.js',
        './third-party/es6-promise/dist/es6-promise.js',
        './third-party/jscolor/*.*',
        './third-party/ace/src-noconflict/*.js',
        './third-party/ace/src-noconflict/snippets/javascript.js',
        './third-party/ace/src-noconflict/snippets/typescript.js',
        './third-party/ace/src-noconflict/snippets/html.js',
        './third-party/ace/src-noconflict/snippets/json.js'
    ], { base: "." } )
        .pipe(gulp.dest(outDir));

    var sourceNoAce = sources.pipe( filter( ['**/*.js', '!third-party/ace/**/*.js' ] ) );
    var sourceWithAce = gulp.src(['third-party/ace/src-noconflict/ace.js'], { base: "." } )
        .pipe( gulp.dest( outDir ) );
    var mergedStream = merge(sourceNoAce, sourceWithAce);

    // Add each of the bower files as a reference
    return target.pipe(inject( mergedStream, {
            starttag: '<!-- inject:bower -->',
                relative: true
            }))
        .pipe(gulp.dest(outDir));
});

/**
 * Adds all HTML files to the temp/index.html
 */
gulp.task('html', function() {
    var sources = gulp.src(['./lib/**/*.html', '!./lib/**/index.html']);

    return target.pipe(inject(sources, {
        starttag: '<!-- inject:html -->',
        transform: function (filePath, file) {
            return file.contents.toString('utf8')
        }}))
        .pipe(gulp.dest(outDir));
});

/**
 * Copy all the media into the output folder
 */
gulp.task('media', function() {

    // Compile all sass files into temp/css
    gulp.src('./media/**/*.*')
        .pipe(gulp.dest(outDir + '/media'));
});

/**
 * Compile all sass files to css and add to the index html
 */
gulp.task('css', function() {

    // Compile all sass files into temp/css
    var sassFiles = gulp.src('./lib/**/*.scss', { base: "./lib" })
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(outDir + '/css'))

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(sassFiles, {
            starttag: '<!-- inject:css -->',
            relative: true,
            ignorePath: '../dist',
            //addPrefix:'css'
         }))
        .pipe(gulp.dest(outDir));
});

/**
 * Checks to see that all TS files listed exist
 */
gulp.task('check-files', function() {

    // Make sure the files exist
    for (var i = 0, l = tsFiles.length; i < l; i++ )
        if(!fs.existsSync(tsFiles[i]))
        {
            console.log("File does not exist:" + tsFiles[i] );
            process.exit();
        }
})

/**
 * Concatenates and builds all TS code into a single file
 */
gulp.task('ts-code', function() {

    return gulp.src(tsFiles, { base: "." })
        .pipe(ts({
            "module": "amd",
            "removeComments": false,
            "noEmitOnError": true,
            "declaration": true,
            "sourceMap": false,
            "preserveConstEnums": true,
            "target": "es5",
            "noImplicitAny": false
            }))
        .pipe(gulp.dest(outDir + '/js'));
});

/**
 * Builds the definition
 */
gulp.task('ts-code-declaration', function() {

    var requiredDeclarationFiles = gulp.src([
        "../common-definitions/webinate-users.d.ts",
        "../common-definitions/modepress-api.d.ts",
        "../common-definitions/app-engine.d.ts",
        './custom-definitions/engine-definitions.d.ts',
        './custom-definitions/external-interfaces.d.ts'
    ]);

    var tsDefinition = gulp.src(tsFiles, { base: "." })
        .pipe(ts({
            "module": "amd",
            "removeComments": false,
            "noEmitOnError": true,
            "declaration": true,
            "sourceMap": false,
            "preserveConstEnums": true,
            "target": "es5",
            "out":"definitions.js",
            "noImplicitAny": false
        })).dts;


     // Merge the streams
     merge(requiredDeclarationFiles, tsDefinition)
        .pipe(concat('definitions.d.ts'))
        .pipe(gulp.dest('../common-definitions/generated'));
});

/**
 * Concatenates and builds all TS code into a single file
 */
gulp.task('ts-code-release', function() {

    var jsFiles = tsProject.src()
        .pipe(ts(tsProject))
        .pipe(uglify())
        .pipe(concat('application.js'))
        .pipe(gulp.dest(outDir + '/js'));

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(jsFiles, {
            starttag: '<!-- inject:js -->',
            addRootSlash: false,
            relative: true
         }))
        .pipe(gulp.dest(outDir + '/js'));
});

/**
 * Deletes a folder and all its children recursively
 * @param {string} path The folder path to remove
 */
function deleteFolderRecursive(path) {
    if( fs.existsSync(path) ) {
        fs.readdirSync(path).forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            }
            else
                fs.unlinkSync(curPath);
        });
        fs.rmdirSync(path);
    }
};

/**
 * Downloads a tarbal from a given url and unzips it into a specified folder
 * @param {string} url The URL of the tarball to download
 * @param {string} folder The folder we are moving the contents to
 */
function downloadClient(url, folder){
    return new Promise(function(resolve, reject){
        gutil.log('Downloading file "'+ url +'" into folder "' + folder + '"');
        return request(url)
        .pipe(source('hello.tar.gz'))
        .on('end', function(){
            gutil.log('Unzipping... "'+ url +'"');
        })
        .pipe(gunzip())
        .pipe(untar())
        .pipe(gulp.dest(folder))
        .on('end', function() {
            var folders = fs.readdirSync(folder);
            gulp.src( folder + '/' + folders[0] + "/**/*.*" )
                .pipe(gulp.dest(folder))
                .on('end', function() {
                    deleteFolderRecursive(folder + '/' + folders[0]);
                    gutil.log(gutil.colors.green('Finished download of "'+ url +'"'));
                    resolve(true);
                });
        })
    });
}

/**
 * Downloads each of the third party archives and unzips them into the third-party folder respectively
 */
gulp.task('install-third-parties', function () {
    return Promise.all([
        downloadClient("https://github.com/jquery/jquery/tarball/2.2.1", './third-party/jquery'),
        downloadClient("https://github.com/jeresig/jquery.hotkeys/tarball/0.2.0", './third-party/jquery-hotkeys'),
        downloadClient("https://github.com/EastDesire/jscolor/tarball/v1.4.5", './third-party/jscolor'),
        downloadClient("https://github.com/EmKayDK/jstepper/tarball/1.5.0", './third-party/jstepper'),
        downloadClient("https://github.com/ajaxorg/ace-builds/tarball/v1.2.3", './third-party/ace'),
        downloadClient("https://github.com/jquery/jquery-ui/tarball/1.11.4", './third-party/jquery-ui'),
        downloadClient("https://github.com/stefanpenner/es6-promise/tarball/v3.1.2", './third-party/es6-promise'),
        downloadClient("https://github.com/jquery/jquery-mousewheel/tarball/3.1.13", './third-party/jquery-mousewheel'),
        downloadClient("https://github.com/flesler/jquery.scrollTo/tarball/2.1.2", './third-party/jquery-scrollTo')
    ]);
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
 * Use this task to install all third-party libraries from github and their respective authors
 */
gulp.task('install', ['install-third-parties', 'install-definitions']);

gulp.task('build-all', ['html', 'media', 'check-files', 'ts-code', 'ts-code-declaration', 'bower','css']);