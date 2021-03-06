'use strict';

module.exports = {
	app: {
		title: 'Advanced Budget',
		description: 'The Advanced Budget application provides a straight forward way for you to manage your finances as well as financial risks',
		keywords: 'finance, budget, personal finance, economy, cashflows'
	},
	port: process.env.PORT || 3000,
	templateEngine: 'swig',
	sessionSecret: 'MEAN',
	sessionCollection: 'sessions',
	assets: {
		lib: {
			css: [
				'public/lib/bootstrap/dist/css/bootstrap.css',
				'public/lib/bootstrap/dist/css/bootstrap-theme.css',
                'public/lib/bootswatch/slate/bootstrap.css',
                'public/lib/angular-ui-grid/ui-grid.css',
			],
			js: [
				'public/lib/angular/angular.js',
				'public/lib/angular-resource/angular-resource.js', 
				'public/lib/angular-cookies/angular-cookies.js', 
				'public/lib/angular-animate/angular-animate.js', 
				'public/lib/angular-touch/angular-touch.js', 
				'public/lib/angular-sanitize/angular-sanitize.js', 
				'public/lib/angular-ui-router/release/angular-ui-router.js',
				'public/lib/angular-ui-utils/ui-utils.js',
				'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
                'public/lib/angular-ui-grid/ui-grid.js',
                'public/lib/Chart.js/Chart.js',
                'public/lib/angular-chart.js/dist/angular-chart.js',
                'public/lib/jquery/dist/jquery.js',
                'public/lib/moment/moment.js'
                //'public/lib/angular-modal-service/dst/angular-modal-service.js'

			]
		},
		css: [
			'public/modules/**/css/*.css',
            'public/lib/angular-chart.js/dist/angular-chart.css'
		],
		js: [
			'public/config.js',
			'public/application.js',
			'public/modules/*/*.js',
			'public/modules/*/*[!tests]*/*.js'
		],
		tests: [
			'public/lib/angular-mocks/angular-mocks.js',
			'public/modules/*/tests/*.js'
		]
	}
};