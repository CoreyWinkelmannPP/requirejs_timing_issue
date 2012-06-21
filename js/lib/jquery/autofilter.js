/*
 * jQuery Plugin: Autofilter will do a query search and display results in a tag
 * Version 1.0
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */
define(
	['jquery'],
	function($) {

		$.fn.autoFilter = function(url, options) {
			var settings = $.extend({
				url : url,
				displayId : null,
				searchDelay : 300,
				minChars : 2,
				queryParam : "q",
				contentType : "html",
				method : "GET",
				onResult : null,
				populateDisplay : null
			}, options);

			return this.each(function () {
				var list = new $.FilterList(this, settings);
			});

		};

		$.FilterList = function (input, settings) {
			// Variable Definitions
			
			// Input box position enumeration
			var POSITION = {
				BEFORE: 0,
				AFTER: 1,
				END: 2
			};

			// Keys enumeration
			var KEY = {
				BACKSPACE: 8,
				TAB: 9,
				RETURN: 13,
				ESC: 27,
				LEFT: 37,
				UP: 38,
				RIGHT: 39,
				DOWN: 40,
				COMMA: 188
			};

			var timeout;

			// Create a new text input and attach keyup events
			var input_box = $(input)
				.css({
					outline: "none"
				})
				.keydown(function (event) {
						switch(event.keyCode) {
							case KEY.UP:
							case KEY.DOWN:
							case KEY.TAB:
							case KEY.COMMA:
							case KEY.RETURN:
							case KEY.ESC:
								return false;
								break;
							case KEY.BACKSPACE:
								setTimeout(function(){do_search(false);}, 5);
								break;	
							default:
								if ( is_printable_character(event.keyCode)) {
									setTimeout(function(){do_search(false);}, 5);
								}
								break;
						}
				});
			
			var dropdown;
			if ( ! settings.displayId ) {
				dropdown = $("<div>")
					.insertAfter(input_box)
					.hide();
			}
			else {
				dropdown = $("#" + settings.displayId).hide();
			}

			function is_printable_character(keycode) {
				if((keycode >= 48 && keycode <= 90) ||      // 0-1a-z
				   (keycode >= 96 && keycode <= 111)      // numpad 0-9 + - / * .
				  ) {
					  return true;
				  } else {
					  return false;
				  }
			}

			// Do a search and show the "searching" dropdown if the input is longer
			// than settings.minChars
			function do_search(immediate) {
				var query = input_box.val().toLowerCase();

				if (query && query.length) {
					if (query.length >= settings.minChars) {
						if (immediate) {
							run_search(query);
						} else {
							clearTimeout(timeout);
							timeout = setTimeout(function(){run_search(query);}, settings.searchDelay);
						}
					} 
					else {
						dropdown.empty();
						dropdown.hide();
					}
				}
			}

			// Do the actual search
			function run_search(query) {
				var queryStringDelimiter = settings.url.indexOf("?") < 0 ? "?" : "&";
				var callback = function(results) {
					populate_display(query, results);

					if($.isFunction(settings.onResult)) {
					  settings.onResult.call(this, results);
					}
				};
				
				if(settings.method == "POST") {
					$.post(settings.url + queryStringDelimiter + settings.queryParam + "=" + query, {}, callback, settings.contentType);
				} else {
					$.get(settings.url + queryStringDelimiter + settings.queryParam + "=" + query, {}, callback);
				}
			}

			function populate_display(query, results) {
				if (results.length) {
					dropdown.empty();
					if ( $.isFunction(settings.populateDisplay) ) {
						settings.populateDisplay.call(this, dropdown, results);
					}
					else {
						dropdown.html( results );
					}
					dropdown.show();
				}
				else {
					dropdown.html("<p>" + settings.noResultsText + "</p>").show();
				}	
			}
		};
	}
);
