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

var tsFiles = [
    "./config.ts",
    "./custom-definitions/engine-definitions.d.ts",
    "./custom-definitions/external-interfaces.d.ts",
    "./definitions/ace.d.ts",
    "./definitions/es6-promise.d.ts",
    "./definitions/ExportToken.d.ts",
    "./definitions/FileUploader.d.ts",
    "./definitions/JQuery.d.ts",
    "./definitions/jquery.scrollTo.d.ts",
    "./definitions/jqueryui.d.ts",
    "./definitions/JSColor.d.ts",
    "./definitions/grecaptcha.d.ts",
    "../source-server/definitions/webinate-users.d.ts",
    "../source-server/definitions/modepress-api.d.ts",
    "../source-server/custom-definitions/app-engine.d.ts",


    "lib/core/compiler.ts",
    "lib/core/compiler-directives/repeater.ts",
    "lib/core/compiler-directives/if.ts",
    "lib/core/enums.ts",
    "lib/core/event-dispatcher.ts",
    "lib/core/project-resource.ts",
    "lib/core/events.ts",
    "lib/core/asset-class.ts",
    "lib/core/utils.ts",
    "lib/core/behaviour-manager.ts",
    "lib/core/plugin-manager.ts",
    "lib/core/import-export.ts",
    "lib/core/property-grid-editor.ts",
    "lib/core/project-resources/asset.ts",
    "lib/core/project-resources/container.ts",
    "lib/core/project-resources/group-array.ts",
    "lib/core/project-resources/file-resource.ts",
    "lib/core/project-resources/script-resource.ts",
    "lib/core/asset-class.ts",
    "lib/core/asset-template.ts",
    "lib/core/behaviour-definition.ts",
    "lib/core/data-token.ts",
    "lib/core/canvas-token.ts",
    "lib/core/db.ts",
    "lib/core/loaders/loader-base.ts",
    "lib/core/loaders/animate-loader.ts",
    "lib/core/loaders/binary-loader.ts",
    "lib/core/property-grid-editor.ts",
    "lib/core/portal-template.ts",
    "lib/core/project.ts",
    "lib/core/type-converter.ts",
    "lib/core/utils.ts",
    "lib/core/user.ts",
    "lib/core/page-loader.ts",
    "lib/core/file-visualizers/image-visualizer.ts",
    "lib/core/file-uploader.ts",

    "lib/core/properties/editable-set.ts",
    "lib/core/properties/prop.ts",
    "lib/core/properties/prop-enum.ts",
    "lib/core/properties/prop-file-resource.ts",
    "lib/core/properties/prop-num.ts",
    "lib/core/properties/prop-object.ts",
    "lib/core/properties/prop-asset.ts",
    "lib/core/properties/prop-group.ts",
    "lib/core/properties/prop-asset-list.ts",
    "lib/core/properties/prop-color.ts",

    "lib/gui/layouts/i-layout.ts",
    "lib/gui/layouts/percentile.ts",
    "lib/gui/layouts/fill.ts",
    "lib/gui/tooltip-manager.ts",
    "lib/gui/component.ts",
    "lib/gui/docker.ts",
    "lib/gui/split-panel.ts",
    "lib/gui/window.ts",
    "lib/gui/context-menu.ts",
    "lib/gui/treeview.ts",
    "lib/gui/tab.ts",
    "lib/gui/tab-pair.ts",
    "lib/gui/label.ts",
    "lib/gui/button.ts",
    "lib/gui/input-box.ts",
    "lib/gui/group.ts",
    "lib/gui/checkbox.ts",
    "lib/gui/label-val.ts",
    "lib/gui/listview-item.ts",
    "lib/gui/listview-header.ts",
    "lib/gui/listview.ts",
    "lib/gui/list.ts",
    "lib/gui/combo-box.ts",
    "lib/gui/menu-list.ts",
    "lib/gui/application.ts",

    "lib/gui/user-preferences.ts",
    "lib/gui/plugin-browser.ts",
    "lib/gui/project-loader.ts",
    "lib/gui/project-browser.ts",

    "lib/gui/canvas-items/canvas-item.ts",
    "lib/gui/canvas-items/behaviour.ts",
    "lib/gui/canvas-items/behaviour-portal.ts",
    "lib/gui/canvas-items/behaviour-shortcut.ts",
    "lib/gui/canvas-items/behaviour-asset.ts",
    "lib/gui/canvas-items/behaviour-comment.ts",
    "lib/gui/canvas-items/portal.ts",
    "lib/gui/canvas-items/behaviour-instance.ts",
    "lib/gui/canvas-items/behaviour-script.ts",
    "lib/gui/canvas-items/canvas.ts",
    "lib/gui/canvas-items/link.ts",
    "lib/gui/canvas-items/canvas-context.ts",

    "lib/gui/tree/treeview-scene.ts",
    "lib/gui/tree/nodes/treenode.ts",
    "lib/gui/tree/nodes/treeNode-resource.ts",
    "lib/gui/tree/nodes/treeNode-asset-class.ts",
    "lib/gui/tree/nodes/treeNode-asset-instance.ts",
    "lib/gui/tree/nodes/treeNode-behaviour.ts",
    "lib/gui/tree/nodes/treeNode-group.ts",
    "lib/gui/tree/nodes/treeNode-group-instance.ts",
    "lib/gui/tree/nodes/treeNode-plugin-behaviour.ts",

    "lib/gui/tabs/canvas-tab-pair.ts",
    "lib/gui/tabs/editor-pair.ts",
    "lib/gui/tabs/html-tab.ts",
    "lib/gui/tabs/css-tab.ts",
    "lib/gui/tabs/script-tab.ts",
    "lib/gui/tabs/scene-tab.ts",
    "lib/gui/tabs/canvas-tab.ts",

    "lib/gui/property-grid-group.ts",
    "lib/gui/property-editors/pg-textbox.ts",
    "lib/gui/property-editors/pg-number.ts",
    "lib/gui/property-editors/pg-combo-bool.ts",
    "lib/gui/property-editors/pg-combo-enum.ts",
    "lib/gui/property-editors/pg-file.ts",
    "lib/gui/property-editors/pg-options-window.ts",
    "lib/gui/property-editors/pg-combo-group.ts",
    "lib/gui/property-editors/pg-combo-asset.ts",
    "lib/gui/property-editors/pg-asset-list.ts",
    "lib/gui/property-editors/pg-color-picker.ts",
    "lib/gui/property-grid.ts",

    "lib/gui/toolbar/toolbar-buttons/toolbar-button.ts",
    "lib/gui/toolbar/toolbar-buttons/toolbar-number.ts",
    "lib/gui/toolbar/toolbar-buttons/toolbar-color-picker.ts",
    "lib/gui/toolbar/toolbar-buttons/toolbar-drop-down.ts",

    "lib/gui/forms/ok-cancel-form.ts",
    "lib/gui/forms/options-form/build-options-form.ts",
    "lib/gui/forms/file-viewer/file-viewer.ts",
    "lib/gui/forms/message-box/message-box.ts",
    "lib/gui/forms/portal-form/portal-form.ts",
    "lib/gui/forms/rename-form/rename-form.ts",
    "lib/gui/forms/user-privileges-form.ts",
    "lib/gui/forms/behaviour-picker.ts",

    "lib/gui/logger.ts",
    "lib/gui/toolbar/toolBar.ts",
    "lib/gui/splash/splash.ts",
    "lib/gui/application.ts",
    "lib/main.ts"];

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
    //return tsProject.src()
        .pipe(ts({
            "module": "amd",
            "removeComments": false,
            "noEmitOnError": true,
            "declaration": true,
            "sourceMap": false,
            "preserveConstEnums": true,
            "target": "es5"
            }))
        .pipe(gulp.dest(outDir + '/js'));
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
        .pipe(gulp.dest(outDir));
});

gulp.task('watch', function () {
    gulp.watch('lib/**/*.ts', ['ts-code']);
});

gulp.task('build-all', ['html', 'media', 'ts-code', 'bower','css']);