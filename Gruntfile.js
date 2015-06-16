module.exports = function ( grunt ) {
	'use strict';

	// Load all grunt tasks
	require( 'matchdep' ).filterDev( 'grunt-*' ).forEach( grunt.loadNpmTasks );

	var path = require('path');
	var home_dir = path.resolve();
	var svn_repo = 'https://camwyn.svn.beanstalkapp.com/tester/';

	// Project configuration
	grunt.initConfig( {
		pkg: grunt.file.readJSON( 'package.json' ),
		prompt: {
			gitbranch: {
				options: {
					questions: [
						{
							config: 'gitbranch',
							type: 'input',
							message: 'Please enter the branch to merge:',
							default: 'master',
						}
					]
				}
			},
			svn_message: {
				options: {
					questions: [
						{
							config: 'push_svn.options.message',
							type: 'input',
							message: 'Please enter the svn commit message:',
							default: 'Committed with grunt-push-svn.',
						}
					]
				}
			}
		},
		git: {
			checkout: {
				options: {
					simple: {
						cmd: 'checkout',
						args: [ '{{ gitbranch }}' ]
					}
				}
			},
			checkout_master: {
				options: {
					simple: {
						cmd: 'checkout',
						args: [ 'master' ]
					}
				}
			},
			pull: {
				options: {
					simple: {
						cmd: 'pull'
					}
				}
			},
			tag_archive: {
				options: {
					simple: {
						cmd: 'tag',
						args[ 'archive/{{ gitbranch }}' ]
					}
				}
			},
			mergeNo: {
				options: {
					simple: {
						cmd: 'merge',
						args: [ '{{ gitbranch }}', '--no-ff' ]
					}
				}
			},
			push_origin: {
				options: {
					simple: {
						cmd: 'push',
						args: ['origin', 'master']
					}
				}
			},
			delete_branch: {
				options: {
					simple: {
						cmd: 'branch',
						args[ '-D', '{{ gitbranch }}' ]
					}
				}
			},
			push_delete: {
				options: {
					simple: {
						cmd: 'push',
						args: ['origin', 'master', '--delete', '{{ gitbranch }}']
					}
				}
			}
		},
		svn_checkout: {
			set: {
				repos: [
					{
						path: ['..'],
						repo: svn_repo
					}
				]
			},
		},
		push_svn: {
			options: {
				remove: true,
				pushIgnore: [
					'.build/*',
					'.git/*',
					'.svn/*',
					'node_modules/*'
				],
				trymkdir: true
			},
			main: {
				src: home_dir,
				dest: svn_repo,
				tmp: './.build'
			},
		}
	});

	// Autoload allthethings in packages.json!
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

	//git checkout master && git pull && git merge --no-ff $1
	grunt.registerTask(
		'git-mm',
		'Merge a branch to master.',
		[
			'git:checkout_master',
			'git:pull',
			'git:mergeNo'
		]
	);

	//svn commit -m "$1" && git push origin master
	grunt.registerTask(
		'git-svnp',
		'Push to svn and git.',
		[
			'svn_checkout',
			'prompt:svn_message',
			'push_svn:main',
			'git:push_origin'
		]
	);

	//git checkout $1 && git tag archive/$1 && git push origin $1 && git checkout master && git branch -D $1 && git push origin --delete $1
	grunt.registerTask(
		'git-arch',
		'Archive branch.',
		[
			'git:checkout',
			'git:tag_archive',
			'git:push_origin',
			'git:checkout_master',
			'git:delete_branch',
			'git:push_delete'
		]
	);
};
