define(
	['jquery'],
	function(jQuery) {
		var test = {
			initialize: function() {
				console.log("Test 1: " + jQuery('#test1').length);
				jQuery('#test1').on('click', function() {
					console.log('TEST 1 SUCCESSFUL');
					alert('TEST 1 SUCCESSFUL');
				});
				console.log("Test 2: " + jQuery('#test2').length);
				jQuery('#test2').on('click', function() {
					console.log('TEST 2 SUCCESSFUL');
					alert('TEST 2 SUCCESSFUL');
				});
				console.log("Test 3: " + jQuery('#test3').length);
				jQuery('#test3').on('click', function() {
					console.log('TEST 3 SUCCESSFUL');
					alert('TEST 3 SUCCESSFUL');
				});
			}
		};

		test.initialize();
	}
)
