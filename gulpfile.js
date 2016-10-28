var gulp = require( 'gulp' );
var concat = require( 'gulp-concat' );
var uglify = require( 'gulp-uglify' );
var ts = require( 'gulp-typescript' );
var util = require( 'util' );
var inject = require( 'gulp-inject' );
var sass = require( 'gulp-sass' );
var filter = require( 'gulp-filter' );
var print = require( 'gulp-print' );
var merge = require( 'merge-stream' );
var fs = require( 'fs' );
var download = require( 'gulp-download' );
var gunzip = require( 'gulp-gunzip' );
var request = require( 'request' );
var source = require( 'vinyl-source-stream' )
var untar = require( 'gulp-untar' );
var gutil = require( 'gulp-util' );
var rename = require( 'gulp-rename' );
var rimraf = require( 'rimraf' );
var tslint = require( 'gulp-tslint' );
var typedoc = require( 'gulp-typedoc' );
var rollup = require( 'gulp-rollup' );
var utils = require( './gulp/utils.js' );

// Read the contents of the tsconfig file so we dont have to specify the files twice
const tsProject = ts.createProject( 'tsconfig.json' );
var tsProjectWithDeclarations = ts.createProject( 'tsconfig.json', { declaration: true });

/**
 * Adds fonts to the dist folder
 */
gulp.task( 'deploy-fonts', function() {

    return gulp.src( [ './third-party/font-awesome/fonts/**/*.*' ], { base: './third-party/font-awesome/fonts' })
        .pipe( gulp.dest( './dist/fonts' ) );
});

/**
 * Adds all HTML files to the temp/index.html
 */
gulp.task( 'html', function() {
    const target = gulp.src( './lib/index.html' );
    const sources = gulp.src( [ './lib/**/*.html', '!./lib/**/index.html' ] );

    const targetWithInjectedHTML = target.pipe( inject( sources, {
        starttag: '<!-- inject:html -->',
        transform: function( filePath, file ) {
            return file.contents.toString( 'utf8' )
        }
    }) ).pipe( gulp.dest( './dist' ) );

    const thirdParties = gulp.src( [
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
        './third-party/react/react-with-addons.js',
        './third-party/react/react-dom.js',
        './third-party/redux/redux.js',
        './third-party/react-redux/react-redux.js',
        './third-party/react-router/react-router.js',
        './third-party/react-router-redux/react-router-redux.js',
        './third-party/es6-promise/dist/es6-promise.js',
        './third-party/jscolor/*.*',
        './third-party/ace/src-noconflict/*.js',
        './third-party/ace/src-noconflict/snippets/javascript.js',
        './third-party/ace/src-noconflict/snippets/typescript.js',
        './third-party/ace/src-noconflict/snippets/html.js',
        './third-party/ace/src-noconflict/snippets/json.js',
        './polyfills/assign.js',
        './polyfills/es6-promise.js'
    ], { base: '.' })
        .pipe( gulp.dest( './dist' ) );

    const sourceNoAce = thirdParties.pipe( filter( [ '**/*.js', '!third-party/ace/**/*.js' ] ) );
    const sourceWithAce = gulp.src( [ 'third-party/ace/src-noconflict/ace.js' ], { base: '.' }).pipe( gulp.dest( './dist' ) );
    const mergedStream = merge( sourceNoAce, sourceWithAce );

    // Add each of the third party files as a reference
    return targetWithInjectedHTML
        .pipe( inject( mergedStream, {
            starttag: '<!-- inject:third-party -->',
            relative: true,
            addRootSlash: true
        }) )
        .pipe( gulp.dest( './dist' ) );
});

/**
 * Copy all the media into the output folder
 */
gulp.task( 'media', function() {

    // Compile all sass files into temp/css
    gulp.src( './media/**/*.*' )
        .pipe( gulp.dest( './dist/media' ) );
});

/**
 * Compile all sass files to css and add to the index html
 */
gulp.task( 'css', function() {

    // Compile all sass files into temp/css
    return gulp.src( './lib/main.scss', { base: './lib' })
        .pipe( sass().on( 'error', sass.logError ) )
        .pipe( gulp.dest( './dist/css' ) );
});

/**
 * Builds the ts project and moves the js files to a temp directory in
 * the dist folder
 */
gulp.task( 'compile-typescript', function() {
    return tsProject.src()
        .pipe( tsProject() )
        .js
        .pipe( gulp.dest( './dist/js/tmp' ) );
})

/**
 * Concatenates and bundles the js files in dist into a single file
 */
gulp.task( 'bundle-js-files', [ 'compile-typescript' ], function() {

    return gulp.src( './dist/js/tmp/**/*.js', { base: './dist/js/tmp' })
        .pipe( rollup( {
            entry: './dist/js/tmp/main.js'
        }) )
        .pipe( gulp.dest( './dist/js' ) );
});

/**
 * Ensures the code quality is up to scratch
 */
gulp.task( 'tslint', [ 'bundle-js-files' ], function() {
    return tsProject.src()
        .pipe( tslint( {
            configuration: 'tslint.json',
            formatter: 'verbose'
        }) )
        .pipe( tslint.report( {
            emitError: false
        }) )
});

/**
 * Creates an API document in a folder called 'docs' folder within /dist
 */
gulp.task( 'tsdocs', function() {
    return gulp
        .src( tsFiles, { base: '.' })
        .pipe( typedoc( {
            // TypeScript options (see typescript docs)
            'noUnusedParameters': tsConfig.compilerOptions.noUnusedParameters,
            'noUnusedLocals': tsConfig.compilerOptions.noUnusedLocals,
            'strictNullChecks': tsConfig.compilerOptions.strictNullChecks,
            'experimentalDecorators': tsConfig.compilerOptions.experimentalDecorators,
            'jsx': tsConfig.compilerOptions.jsx,
            'module': tsConfig.compilerOptions.module,
            'noEmitOnError': tsConfig.compilerOptions.noEmitOnError,
            'preserveConstEnums': tsConfig.compilerOptions.preserveConstEnums,
            'target': tsConfig.compilerOptions.target,
            'noImplicitAny': tsConfig.compilerOptions.noImplicitAny,
            'allowUnreachableCode': tsConfig.compilerOptions.allowUnreachableCode,
            'allowUnusedLabels': tsConfig.compilerOptions.allowUnusedLabels,

            // Output options (see typedoc docs)
            out: './dist/docs',
            mode: 'file',
            theme: 'default',

            // TypeDoc options (see typedoc docs)
            name: 'Hatchery Editor',
            plugins: [],
            ignoreCompilerErrors: false,
            version: true,
        }) )
        ;
});

/**
 * Builds the definition
 */
gulp.task( 'ts-code-declaration', function() {

    var requiredDeclarationFiles = gulp.src( [
        './lib/definitions/custom/engine-definitions.d.ts',
        './lib/definitions/custom/external-interfaces.d.ts',
        './lib/definitions/custom/export-token.d.ts'
    ], { base: 'lib/definitions/custom' });

    var tsDefinition = tsProject.src().pipe( tsProjectWithDeclarations() );


    // Merge the streams
    return merge( requiredDeclarationFiles, tsDefinition.dts )
        .pipe( concat( 'hatchery-editor.d.ts' ) )
        .pipe( gulp.dest( 'lib/definitions/generated' ) );
});

/**
 * Concatenates and builds all TS code into a single file
 */
gulp.task( 'ts-code-release', function() {

    var jsFiles = tsProject.src()
        .pipe( ts( tsProject ) )
        .pipe( uglify() )
        .pipe( concat( 'application.js' ) )
        .pipe( gulp.dest( './dist/js' ) );

    // Add each css file in temp to the index in temp/index.html
    return target.pipe( inject( jsFiles, {
        starttag: '<!-- inject:js -->',
        addRootSlash: false,
        relative: true
    }) )
        .pipe( gulp.dest( './dist/js' ) );
});


/**
 * Downloads each of the third party archives and unzips them into the third-party folder respectively
 */
gulp.task( 'install-third-parties', function() {
    rimraf.sync( './third-party' )

    return Promise.all( [
        utils.downloadClient( 'https://github.com/FortAwesome/Font-Awesome/tarball/v4.6.3', './third-party/font-awesome' ),
        utils.downloadClient( 'https://github.com/jquery/jquery/tarball/2.2.1', './third-party/jquery' ),
        utils.downloadClient( 'https://github.com/jeresig/jquery.hotkeys/tarball/0.2.0', './third-party/jquery-hotkeys' ),
        utils.downloadClient( 'https://github.com/EastDesire/jscolor/tarball/v1.4.5', './third-party/jscolor' ),
        utils.downloadClient( 'https://github.com/EmKayDK/jstepper/tarball/1.5.0', './third-party/jstepper' ),
        utils.downloadClient( 'https://github.com/ajaxorg/ace-builds/tarball/v1.2.3', './third-party/ace' ),
        utils.downloadClient( 'https://github.com/jquery/jquery-ui/tarball/1.11.4', './third-party/jquery-ui' ),
        utils.downloadClient( 'https://github.com/jquery/jquery-mousewheel/tarball/3.1.13', './third-party/jquery-mousewheel' ),
        utils.downloadClient( 'https://github.com/flesler/jquery.scrollTo/tarball/2.1.2', './third-party/jquery-scrollTo' ),

        utils.downloadFile( 'https://unpkg.com/react@15.3.2/dist/react-with-addons.js', './third-party/react/', 'react-with-addons.js' ),
        utils.downloadFile( 'https://unpkg.com/react-dom@15.3.2/dist/react-dom.js', './third-party/react/', 'react-dom.js' ),
        utils.downloadFile( 'https://unpkg.com/redux@3.6.0/dist/redux.js', './third-party/redux/', 'redux.js' ),
        utils.downloadFile( 'https://cdnjs.cloudflare.com/ajax/libs/react-redux/4.4.5/react-redux.js', './third-party/react-redux/', 'react-redux.js' ),
        utils.downloadFile( 'https://unpkg.com/react-router@2.8.1/umd/ReactRouter.js', './third-party/react-router/', 'react-router.js' ),
        utils.downloadFile( 'https://cdnjs.cloudflare.com/ajax/libs/react-router-redux/4.0.6/ReactRouterRedux.js', './third-party/react-router-redux/', 'react-router-redux.js' )
    ] );
});



/**
 * Downloads the definition files used in the development of the application and moves them into the definitions folder
 */
gulp.task( 'install-definitions', function() {
    return Promise.all( [
        utils.downloadFile( 'https://raw.githubusercontent.com/PixelSwarm/hatchery-runtime/dev/lib/definitions/generated/hatchery-runtime.d.ts', 'lib/definitions/required/', 'hatchery-runtime.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/PixelSwarm/hatchery-server/dev/lib/definitions/generated/hatchery-server.d.ts', 'lib/definitions/required/', 'hatchery-server.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/Webinate/users/dev/src/definitions/generated/users.d.ts', 'lib/definitions/required/', 'users.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/Webinate/modepress/dev/src/definitions/generated/modepress.d.ts', 'lib/definitions/required/', 'modepress.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/react/react.d.ts', 'lib/definitions/required/react/', 'react.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/redux/redux.d.ts', 'lib/definitions/required/redux/', 'redux.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/react-redux/react-redux.d.ts', 'lib/definitions/required/react-redux/', 'react-redux.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/react-router/history.d.ts', 'lib/definitions/required/react-router/', 'history.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/react-router/react-router.d.ts', 'lib/definitions/required/react-router/', 'react-router.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/ace/ace.d.ts', 'lib/definitions/required/', 'ace.d.ts' ),
        utils.downloadFile( 'https://raw.githubusercontent.com/DefinitelyTyped/DefinitelyTyped/master/react-router-redux/react-router-redux.d.ts', 'lib/definitions/required/react-router-redux/', 'react-router-redux.d.ts' )
    ] );
});

/**
 * Watches for source file changes and calls the appropriate build calls
 * This is not the same as a build - its more like a quick build to cut
 * down on waiting times
 */
gulp.task( 'watch', function() {
    gulp.watch( 'lib/**/*.scss', [ 'css' ] );
    gulp.watch( [ 'lib/**/*.ts', 'lib/**/*.tsx' ], [ 'tslint' ] );
    gulp.watch( [ 'lib/**/*.html' ], [ 'html' ] );
    gulp.watch( [ 'lib/media/**/*.*' ], [ 'media' ] );
})


gulp.task( 'install', [ 'install-third-parties', 'install-definitions' ] );
gulp.task( 'quick-build', [ 'tslint' ] );
gulp.task( 'build', [ 'html', 'media', 'deploy-fonts', 'tslint', 'ts-code-declaration', 'css' ] );