module.exports = function(grunt) {
 
    require('jit-grunt')(grunt);
    require('time-grunt')(grunt);

    grunt.registerTask('default', [ 'newer:sass', 'watch' ]);
    grunt.registerTask('html',    [ 'jade', 'prettify']);
    grunt.registerTask('css',     [ 'sass', 'postcss' ]);
    grunt.registerTask('build',   [ 'sass', 'postcss', 'jade', 'prettify' ]);
    grunt.registerTask('svg',     [ 'svg_sprite', 'svgmin:sprite' ]);
    
    //
    // == Функции
    // ------------------------------------------------------------

    // Выводит заголовка для начала лога
    function printHeading(text) {
        console.log(
            '-------------------------------------------------\n'+
            text + '\n'+
            '-------------------------------------------------\n'
        );
    }

    
    //
    // == Вводная информация
    // ------------------------------------------------------------

    // Получаем параметры извне gruntfile'а
    var parameters     = grunt.file.readYAML('app/config/parameters.yml').parameters;

    // название темы в разных регистрах
    var theme          = grunt.option('theme') || parameters.theme;
    var themeLowerCase = theme ? theme.toLowerCase() : '';

    // Проверяем, является ли текущая тема базовой.
    // Базовая тема включена в этих случаях:
    //   - не задан параметр 'theme' в parameters.yml
    //   - grunt запущен с ключом --theme=base
    var isBaseTheme   = !theme || themeLowerCase === 'base';

    // если тема не задана, то собирать файл base.css, иначе theme.css
    var cssFile        = isBaseTheme ? 'base' : 'theme' ;

    // если тема не задана, то собирать jade у Автоплюса
    var jadeTheme      = isBaseTheme ? 'autoplus' : themeLowerCase;

    // порт для livereload
    var livereloadPort = parameters.livereload_port ? parseInt(parameters.livereload_port) : '';

    // Выводим название темы, в которой будем собирать 
    printHeading(
        isBaseTheme ?
            'Building with base styles' :
            'Building with theme "' +  theme + '"'
    );


    // Выводим данные об livereload
    console.log(
        livereloadPort ?
            'Livereload running on port ' + livereloadPort + '\n':
            'No livereload port in parameters.yml, livereload is disabled'
    );
    
    grunt.initConfig({

        //
        // == Variables
        // ------------------------------------------------------------
        
        cssFile: cssFile,

        dir: {
            // Уровни перепределения
            base:  'vendor/tradeins/corp-bundle/Tradeins/CorpBundle/Resources/',          // Базовые стили
            theme:  'vendor/tradeins/corp-theme/Tradeins/Theme/' + theme + '/Resources/', // Тема
            site:   'app/Resources/TradeinsCorpBundle/views/',                            // Сайт

            root: {
                src:  (isBaseTheme ? '<%= dir.base %>' : '<%= dir.theme %>') + 'public/',
                dest: '<%= dir.root.src %>'
            },

            css: {
                src:  '<%= dir.root.src %>scss/',
                dest: '<%= dir.root.dest %>css/',
                webPath: '/css/'
            },
            js: {
                src:  '<%= dir.root.src %>js/',
                dest: '<%= dir.root.dest %>js/'
            },
            images: {
                src:  '<%= dir.root.src %>images/',
                dest: '<%= dir.root.dest %>images/'
            },
            jade: {
                src:  'web/bundles/' + jadeTheme + '/html/source/jade/',
                dest: 'web/bundles/' + jadeTheme + '/html/web/'
            },
            svg: {
                src:  '<%= dir.root.src %>images/svg/source/',
                compressed: '<%= dir.root.src %>images/svg/compressed/'
            },
        },


        //
        // == CSS
        // ------------------------------------------------------------
        
        sass: {
            options: {
                sourceMap: false,
                includePaths: [
                    '<%= dir.base %>public/vendor/',       // стили из bower
                    '<%= dir.base %>public/scss/',         // базовые стили
                    './'                                    // корень проекта
                ]
            },
            dist: {
                files: {
                    '<%= dir.css.dest + cssFile %>.css': '<%= dir.css.src %>' + cssFile + '.scss',
                    '<%= dir.css.dest %>bootstrap.css':  '<%= dir.css.src %>bootstrap.scss',
                    '<%= dir.css.dest %>libs.css':       '<%= dir.css.src %>libs.scss',
                    '<%= dir.css.dest %>ckeditor.css':   '<%= dir.css.src %>ckeditor.scss'
                }
            }
        },

        postcss: {
            options: {
                processors: [
                    require('autoprefixer')({
                        browsers: 'ios >= 7, last 2 versions'
                    }), 
                ]
            },
            dist: {
                src: '<%= dir.css.dest %>*.css'
            }
        },

        //
        // == HTML
        // ------------------------------------------------------------
        
        jade: {
            options: {
                client: false,
                pretty: true,
                data: function(src, dest){
                  var bundles = "/bundles/";
                  var paths = {
                    themeName:      jadeTheme,
                    img:            "images/",
                    js:             "js/",
                    css:            "/bundles/" + jadeTheme + "/css/",
                    bower:          bundles + "tradeinscorp/vendor/",
                    base:           bundles + "tradeinscorp/",
                    theme:          bundles + jadeTheme + "/",
                    liveReloadPort: livereloadPort
                  }

                  if (grunt.option('verbose'))
                      console.log( paths );

                  return paths;
               }
            },
            compile: {
                files: [ {
                    expand: true,
                    flatten: true,
                    ext: ".html",
                    src: "<%= dir.jade.src %>*.jade",
                    dest: "<%= dir.jade.dest %>",
                    port: livereloadPort
                } ]
            },
            custom: {
                files: [ {
                    expand: true,
                    flatten: true,
                    ext: ".html",
                    src: "<%= dir.jade.src %>sell-car-4.jade",
                    dest: "<%= dir.jade.dest %>",
                    port: livereloadPort
                } ]
            },
        },

        prettify: {
            options: {
                config: '.prettifyrc'
            },
            files: {
                expand: true,
                src: "<%= dir.jade.dest %>*.html",
                dest: ".",
                ext: ".html"
            }
        },

        //
        // == SVG
        // ------------------------------------------------------------
        
        svg_sprite: {
            complex: {
                expand:  true,
                flatten: true,
                
                // не меняйте местами элементы массива src, важен их порядок, 
                // базовый уровень должен идти первым
                src:    [ '<%= dir.base %>public/images/svg/source/*.svg', '<%= dir.svg.src %>*.svg'],
                dest:   '<%= dir.svg.dest %>',
               
                // если svg-иконка существует и базовом шаблоне и в текущей теме
                // то выводить в спрайт только из текущей темы
                // (другими словами, заменяем базовую иконку на иконку из темы)
                filter: function(dest) {
                    var base, theme, name, isFileExistInBothLevels;

                    if (isBaseTheme) {
                        return true;
                    }

                    base  = grunt.task.current.data.src[0].replace('*.svg', '' );
                    theme = grunt.task.current.data.src[1].replace('*.svg', '' );
                    name  = dest.replace(base, '').replace(theme, '');
                    isFileExistInBothLevels = grunt.file.exists(base+name) && grunt.file.exists(theme+name);

                    if (isFileExistInBothLevels) {
                        return dest.indexOf(base) === -1 ;
                    } 
                    
                    return true;
                }
            },

            options: {
                shape: {
                    id: {
                        // выводим в спрайт только имена файлов, без путей
                        generator: function(name) {
                            var base  = grunt.task.current.data.src[0].replace('*.svg', '' );
                            var theme = grunt.task.current.data.src[1].replace('*.svg', '' );
                            return name.replace(base, '').replace(theme, '').replace('.svg', '');
                        }
                    },
                    dimension: {
                        maxWidth: 32,
                        maxHeight: 32
                    },
                    dest: 'intermediate-svg/'
                },
                mode: {
                    symbol: true
                }            
            }
        },
        
        // Очищенный svg-спрайт сохраняем сразу в twig-шаблон
        svgmin: {
            sprite: {
                files: {
                     '<%= dir.root.src %>../views/Layout/svg.html.twig': '<%= dir.svg.dest %>symbol/svg/sprite.symbol.svg'
                },
                options: {
                    plugins: [
                        {removeUselessDefs: false},
                        {removeComments: true},
                        {removeMetadata: true},
                        {removeUselessStrokeAndFill: true},
                        {cleanupIDs: false }
                    ]
                }
            },
            separate: {
                files: [{
                    expand: true,
                    cwd:    '<%= dir.svg.src %>',
                    src:    [ '*.svg' ],
                    dest:   '<%= dir.svg.compressed %>',
                    ext:    '.svg'
                }],
                options: {
                    plugins: [
                        {removeUselessDefs: false},
                        {removeComments: true},
                        {removeMetadata: true},
                        {removeUselessStrokeAndFill: true},
                        {cleanupIDs: false }
                    ]
                }
            }
        },



        //
        // == Other
        // ------------------------------------------------------------
        
        /*
        copy: {
            svg: {
                options: {
                    flatten: true,
                },
                files: {
                    '<%= dir.root.src %>/../views/Layout/svg.html.twig': '<%= dir.svg.dest %>symbol/svg/sprite.optimized.symbol.svg'
                }
            },
        },
        */

        modernizr: {
            dist: {
                "dest" : "web/javascript/modernizr-custom.js",
                "parseFiles": false,
                "crawl": false,
                "tests": [
                    "cssfilters",
                    "flexbox",
                    "flexboxlegacy",
                    "flexboxtweener",
                    "svgfilters",
                    "inlinesvg",
                    "touchevents"
                ],
                "options": [
                    "setClasses"
                ],
                "uglify": true
            }
        },

        watch: {
            options: {
                livereload: livereloadPort,
            },
            jade: {
                files: ['<%= dir.jade.src %>*.jade'],
                tasks: ['newer:jade:compile'],
                //tasks: ['newer:jade:custom'],
            },
            jade_includes: {
                files: ['<%= dir.jade.src %>includes/**/*.jade'],
                tasks: ['jade:compile'],
            },
            html: {
                files: ['<%= dir.jade.dest %>*.html'],
                tasks: ['newer:prettify'],
            },
            scss: {
                options: {
                    livereload: false,
                },
                files: ['<%= dir.css.src %>**/*.scss', '<%= dir.base %>public/scss/**/*.scss' ],
                tasks: ['css']
            },
            css: {
                files: ['<%= dir.css.dest %>*.css'],
                tasks: []
            },
            svg: {
                files: ['<%= dir.svg.src %>*.svg'],
                tasks: ['svg']
            },
        }
    });
};
