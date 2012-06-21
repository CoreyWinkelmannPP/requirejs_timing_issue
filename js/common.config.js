requirejs.config({
	paths: {
		'autofilter' : 'lib/jquery/autofilter',
		'clearsearch' : 'lib/jquery/addclear',
		'cookie' : 'lib/jquery/cookie',
		'datatable' : 'lib/jquery/datatables',
		'datatable_sort_types' : 'lib/jquery/datatables.sort_types',
		'dom_ready' : 'lib/requirejs/domReady',
		'fullcalendar' : 'lib/jquery/fullcalendar',
		'gritter' : 'lib/jquery/gritter',
		'infieldlabel' : 'lib/jquery/infieldlabel',
		'jquery' : 'lib/requirejs/require-jquery',
		'jqueryui' : 'lib/jquery/jquery-ui',
		'json' : 'json2',
		'modernizr' : 'lib/modernizr/modernizr',
		'tokeninput' : 'lib/jquery/tokeninput',
		'validate' : 'lib/jquery/validate'
	},
	shim: {
		jqueryui: ['jquery']
	}
});
