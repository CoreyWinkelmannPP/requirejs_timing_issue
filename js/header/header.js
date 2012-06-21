define(
	['jquery', 'jqueryui', 'datatable', 'fullcalendar', 'modernizr', 'gritter'],
	function(jQuery) {
		var header = {
			initialize: function() {
				jQuery('#header1').on('click', function() {
					console.log('HEADER 1 SUCCESSFUL');
					alert('HEADER 1 SUCCESSFUL');
				});
				jQuery('#header2').on('click', function() {
					console.log('HEADER 2 SUCCESSFUL');
					alert('HEADER 2 SUCCESSFUL');
				});
				jQuery('#header3').on('click', function() {
					console.log('HEADER 3 SUCCESSFUL');
					alert('HEADER 3 SUCCESSFUL');
				});
			}
		};

		header.initialize();
	}
);
