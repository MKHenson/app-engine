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

// Read the contents of the tsconfig file so we dont have to specify the files twice
var tsConfig = JSON.parse(fs.readFileSync('tsconfig.json'));
var tsFiles = tsConfig.files;

// Make sure the files exist
for (var i = 0, l = tsFiles.length; i < l; i++ )
    if(!fs.existsSync(tsFiles[i]))
    {
        console.log("File does not exist:" + tsFiles[i] );
        process.exit();
    }


// CONFIG
// ==============================
var outDir = "../client/resources";

// Create the type script project file
var tsProject = ts.createProject('tsconfig.json', { sortOutput: true });
var target = gulp.src('./lib/index.html');

// Adds the relevant bower files to the index html
gulp.task('bower', function() {

    var sources = gulp.src([
        './bower_components/jquery/dist/jquery.js',
        './bower_components/jquery.hotkeys/jquery.hotkeys.js',
        './bower_components/jquery-mousewheel/jquery.mousewheel.js',
        './bower_components/jstepper/jquery.jstepper.js',
        './bower_components/jquery.scrollTo/jquery.scrollTo.js',
        './bower_components/jquery-ui/ui/jquery.ui.core.js',
        './bower_components/jquery-ui/ui/jquery.ui.widget.js',
        './bower_components/jquery-ui/ui/jquery.ui.mouse.js',
        './bower_components/jquery-ui/ui/jquery.ui.draggable.js',
        './bower_components/jquery-ui/ui/jquery.ui.droppable.js',
        './bower_components/jquery-ui/ui/jquery.ui.resizable.js',
        './bower_components/es6-promise/es6-promise.js',
        './bower_components/google-recaptcha-api/index.js',
        './bower_components/jscolor/*.*',
        './bower_components/ace/src-noconflict/*.js',
        './bower_components/ace/src-noconflict/snippets/javascript.js',
        './bower_components/ace/src-noconflict/snippets/typescript.js',
        './bower_components/ace/src-noconflict/snippets/html.js',
        './bower_components/ace/src-noconflict/snippets/json.js',
        './bower_components/google-recptcha-api/index.js'
    ], { base: "." } )
        .pipe(gulp.dest(outDir));

    var sourceNoAce = sources.pipe( filter( ['**/*.js', '!bower_components/ace/**/*.js' ] ) );
    var sourceWithAce = gulp.src(['bower_components/ace/src-noconflict/ace.js'], { base: "." } )
        .pipe( gulp.dest( outDir ) );
    var mergedStream = merge(sourceNoAce, sourceWithAce);

    // Add each of the bower files as a reference
    return target.pipe(inject( mergedStream, {
            starttag: '<!-- inject:bower -->',
                relative: true
            }))
        .pipe(gulp.dest(outDir));
});

// Adds all HTML files to the temp/index.html
gulp.task('html', function() {
    var sources = gulp.src(['./lib/**/*.html', '!./lib/**/index.html']);

    return target.pipe(inject(sources, {
        starttag: '<!-- inject:html -->',
        transform: function (filePath, file) {
            return file.contents.toString('utf8')
        }}))
        .pipe(gulp.dest(outDir));
});

// Copy all the media into the output folder
gulp.task('media', function() {

    // Compile all sass files into temp/css
    gulp.src('./media/**/*.*')
        .pipe(gulp.dest(outDir + '/media'));
});

// Compile all sass files to css and add to the index html
gulp.task('css', function() {

    // Compile all sass files into temp/css
    var sassFiles = gulp.src('./lib/**/*.scss', { base: "./lib" })
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest(outDir + '/css'))

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject(sassFiles, {
            starttag: '<!-- inject:css -->',
            relative: true,
            ignorePath: '../../client/resources/css',
            addPrefix:'css'
         }))
        .pipe(gulp.dest(outDir));
});

// Concatenates and builds all TS code into a single file
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

// Builds the definition
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

// Concatenates and builds all TS code into a single file
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

gulp.task('watch', function () {
    gulp.watch('lib/**/*.ts', ['ts-code']);
});

gulp.task('build-all', ['html', 'media', 'ts-code', 'ts-code-declaration', 'bower','css']);