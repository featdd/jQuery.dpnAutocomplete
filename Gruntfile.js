'use strict';

module.exports = function (grunt) {

	require('load-grunt-tasks')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		sass: {
			dist: {
				options: {
					sourcemap: 'none'
				},
				files: {
					'.temp/base-styles.css': 'src/base-styles.scss'
				}
			}
		},
		postcss: {
			options: {
				map: true,
				processors: [
					require('autoprefixer')({browsers: ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1', 'ie 8', 'ie 9']})
				]
			},
			dist: {
				files: [{
					expand: true,
					cwd: '.temp/',
					src: '{,*/}*.css',
					dest: '.temp/'
				}]
			}
		},
		cssmin: {
			dist: {
				src: [
					'.temp/base-styles.css'
				],
				dest: 'dist/base-styles.min.css'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc',
				reporter: require('jshint-stylish')
			},
			all: [
				'Gruntfile.js',
				'src/*.js'
			]
		},
		uglify: {
			dist: {
				files: {
					'dist/dpnAutocomplete.min.js': [
						'src/dpnAutocomplete.js'
					]
				}
			}
		},
		watch: {
			styles: {
				files: ['src/base-styles.scss'],
				tasks: ['styles']
			},
			scripts: {
				files: [
					'src/dpnAutocomplete.js'
				],
				tasks: ['scripts']
			}
		},
		clean: [
			'.temp',
			'.sass-cache'
		]
	});

	grunt.registerTask('styles', ['sass', 'postcss', 'cssmin', 'clean']);
	grunt.registerTask('scripts', ['jshint', 'uglify', 'clean']);
	grunt.registerTask('build', ['styles', 'scripts']);
	grunt.registerTask('default', ['build', 'watch']);
};
