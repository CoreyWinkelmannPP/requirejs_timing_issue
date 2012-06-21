/*
 * jQuery Plugin: Inline Suggest
 * Version 1.0
 *
 * Copyright (c) 2009 Corey Winkelmann 
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 * 
 * Dependencies: jquery.textselection.js plugin
 */
// May have to place the div dropdown offscreen to do the scrolling then reposition it 
define(
	['jquery'],
	function($) {
		$.fn.inlineSuggest = function (options) {
			options = options || {};
			var settings = $.extend({
				indentDelimiter:'&nbsp;',
				searchDelayOn : false,
				searchDelay: 300,
				minChars: 1,
				alwaysOnTop: false
			}, options);

			settings.classes = $.extend({
				image: "inline-suggest-input-dropdown-image",
				imageWrapper: "inline-suggest-input-dropdown-image-wrapper",
				wrapper: "inline-suggest-input-wrapper",
				dropdown: "inline-suggest-input-dropdown",
				dropdownItem: "inline-suggest-input-dropdown-item",
				selectedDropdownItem: "inline-suggest-input-selected-dropdown-item"
			}, options.classes);

			return this.each(function () {
				$(this).data('inline-suggest', new $.SelectList(this, settings));
			});
		};

		$.SelectList = function (select, settings) {
			//
			// Variables
			//

			// Keys "enum"
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

			// Keep track of the timeout
			var timeout;

			var last_successful_match = '';
			var default_select_value = null;
			var select_search_contents = [];
			var select_display_contents = [];
			var selected_dropdown_item = null;
			var current_list_item = null;
			var visible = false;
			var button_clicked = false;
			// Keep a reference to the original select
			var hidden_select = $(select).hide();

			hidden_select.find('option')
						 .each(function(){
								 select_display_contents.push({"text":$(this).text(),"value":$(this).val()});
								 var trimmed_text = $.trim($(this).text().replace(new RegExp("^" + settings.indentDelimiter + "+"), ""));
								 select_search_contents.push({"text":trimmed_text,"value":$(this).val()});
							});

			// allow hidden dropdown to be changed programatically
			hidden_select.bind('selectItem', function(event, selectValue) {
				jQuery(selected_dropdown_item).removeClass('inline-suggest-input-selected-dropdown-item');
				selected_dropdown_item = jQuery('#' + selectValue);
				jQuery(selected_dropdown_item).addClass('inline-suggest-input-selected-dropdown-item');

				hidden_select.val(selectValue);
				input_box.val(selected_dropdown_item.html());
			});

			var input_box = $('<input type="text">')
				.css({
					outline: "none"
				})
				.focus(function () {
						$(this).select();
				})
				.blur(function () {
						var current_selected = find_search_content_by_value($(selected_dropdown_item).attr('id'));
						if ( current_selected.text !== $(this).val() ) {
							$(this).val(current_selected.text);
						}

						if ( ! button_clicked && visible ) {
							hide_dropdown();
						}
				})
				.keydown(function (event) {
					switch(event.keyCode) {
						case KEY.LEFT:
						case KEY.UP:
							if ( visible ) {
								// select the next option and update all necessary fields
								navigate_up();
							}
							else {
								show_dropdown();
							}
							return false;
							break;
						case KEY.RIGHT:
						case KEY.DOWN:
							if ( visible ) {
								// select the next option and update all necessary fields
								navigate_down();
							}
							else {
								show_dropdown();
							}
							return false;
							break;

						case KEY.BACKSPACE:
							// set a timeout just long enough to let this function finish.
							var current_text = $(this).val();
							var text_selection = $(this).textselection();
							if ( text_selection.start === 0 ) {
								$(this).val("");

							}
							else {
								$(this).val(current_text.slice(0, text_selection.start - 1));
							}

							last_successful_match = "";
							if ( $(this).val().length === 0 ) {
								update_hidden_select_selection(default_select_value);
								current_list_item = $(dropdown_ul).find("li#" + default_select_value);
								select_dropdown_item(current_list_item);
								if (visible) {
									scroll_to_item( current_list_item );
								}
								
								var default_item = find_search_content_by_value(default_select_value);
								$(this).val(default_item.text).textselection(0, default_item.text.length);
							}
							else {
								setTimeout(function(){do_search(settings.searchDelayOn);}, 5);
							}
							return false;
							break;

						case KEY.TAB:
							if ( visible ) {
								hide_dropdown();
							}
							return true;
							break
						case KEY.RETURN:
							if ( visible ) {
								hide_dropdown();
								return false;
							}
							else {
								return true;
							}
							break;

						case KEY.ESC:
							if ( visible ) {
								hide_dropdown();
							}
							return false;
							break;

						default:
							if(is_printable_character(event.keyCode)) {
							  // set a timeout just long enough to let this function finish.
							  setTimeout(function(){do_search(settings.searchDelayOn);}, 5);
							}
							break;
					}
				});
			
			var wrapper = $("<div>").addClass("ui-widget ui-helper-clearfix " + settings.classes.wrapper).html(input_box)
									.insertAfter(hidden_select);
			var widget_button = $('<span class="ui-icon ui-icon-circle-triangle-s ui-corner-right">&nbsp;&nbsp;&nbsp;&nbsp;</span>')
										.insertAfter(input_box)
										.addClass(settings.classes.image);

			var button_wrapper = $('<div class="ui-state-default ui-corner-right"></div>').prepend(widget_button).insertAfter(input_box)
			.hover(
				function(){ $(this).addClass('ui-state-hover'); },
				function(){ $(this).removeClass('ui-state-hover'); })
				.addClass(settings.classes.imageWrapper)
				.click(function(){
					if ( visible ) {
						hide_dropdown();
					}
					else {
						show_dropdown();
						button_clicked = true;
						input_box.focus();
					}
				});
			
			var dropdown = $("<div>").addClass("ui-corner-bottom " + settings.classes.dropdown)
			.mouseenter(function(){
				$(this).mouseleave(function(){
					hide_dropdown();
					// reselect the value that is selected if one exists
					if ( current_list_item ) {
						select_dropdown_item(current_list_item);
					}
					else {
						select_dropdown_item($(dropdown_ul).find("li:eq(0)"));
					}
				});
			})
			.hide();						 
			if (settings.alwaysOnTop) {
				dropdown.appendTo("body");
			}
			else {
				dropdown.insertAfter(button_wrapper);
			}

			position_dropdown();
			var dropdown_ul = null;

			initialize();

			//
			// Functions
			//
			function initialize() {
				if (settings.alwaysOnTop) {
					dropdown.css({position: "absolute"});
				}
				populate_dropdown(select_display_contents);
				if ( hidden_select.val() ) {
					default_select_value = hidden_select.val();
					current_list_item = $(dropdown_ul).find("li#" + hidden_select.val());
					input_box.val(find_search_content_by_value(hidden_select.val()).text);
					select_dropdown_item(current_list_item);
				}
			}
			function position_dropdown() {
				if (settings.alwaysOnTop) {
					var input_position = input_box.offset();
					var height = input_box.outerHeight();
					dropdown.css({"top":input_position.top + height, "left":input_position.left});
				}
			}
			function hide_dropdown() {
				dropdown.hide();
				dropdown_ul.hide();
				visible = false;
			}

			function show_dropdown() {
				dropdown.show();
				dropdown_ul.show();
				if ( current_list_item !== undefined ) {
					scroll_to_item( current_list_item );
				}
				visible = true;
			}

			function scroll_to_item( item ) {
					var li_item_location = (item.height() * get_item_index( item )) + 3;
					dropdown.scrollTop(li_item_location);
			}

			function get_item_index( li_item ) {
					var item_index = 0;
					li_item.prevAll("li").each(function(){
						item_index++;
					});

					return item_index;
			}

			function is_printable_character(keycode) {
				if((keycode >= 48 && keycode <= 90) ||      // 0-1a-z
				   (keycode >= 96 && keycode <= 111) ||     // numpad 0-9 + - / * .
				   (keycode >= 186 && keycode <= 192) ||    // ; = , - . / ^
				   (keycode >= 219 && keycode <= 222)       // ( \ ) '
				  ) {
					  return true;
				  } else {
					  return false;
				  }
			}

			// Get an element of a particular type from an event (click/mouseover etc)
			function get_element_from_event (event, element_type) {
				var target = $(event.target);
				var element = null;

				if(target.is(element_type)) {
					element = target;
				} else if(target.parent(element_type).length) {
					element = target.parent(element_type+":first");
				}

				return element;
			}

			// Highlight the query part of the search term
			function highlight_term(value, term) {
				return value.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + term + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
			}

			// Populate the results dropdown with some results
			function populate_dropdown (results) {
				if(results.length) {
					dropdown.empty();
					dropdown_ul = $("<ul>").css({"margin":"0px","padding":"0px"})
						.appendTo(dropdown)
						.mouseover(function (event) {
								select_dropdown_item(get_element_from_event(event, "li"));
						})
						.click(function (event) {
								// On click fill in the input with the selected text value
								var element = get_element_from_event(event, "li");
								var search_item = find_search_content_by_value( $(element).attr("id") );
								input_box.val( search_item.text ).focus();
								current_list_item = $(element);
								update_hidden_select_selection(search_item.value);
								hide_dropdown();
						})
						.mousedown(function (event) {
							// Stop user selecting text on tokens
							return false;
						}).hide();

					for(var i in results) {
						if (results.hasOwnProperty(i)) {
							var this_li = $("<li id=\"" + results[i].value + "\">"+results[i].text+"</li>")
												.addClass(settings.classes.dropdownItem)
												.appendTo(dropdown_ul);
						}
					}


				} 
			}

			function find_search_content_by_value( value ) {
				for ( var i = 0; i < select_search_contents.length; i++ ) {
					if ( value == select_search_contents[i].value ) {
						return select_search_contents[i];
					}
				}
			}

			// Highlight an item in the results dropdown
			function select_dropdown_item (item) {
				if(item) {
					if(selected_dropdown_item) {
						deselect_dropdown_item($(selected_dropdown_item));
					}

					item.addClass(settings.classes.selectedDropdownItem);
					selected_dropdown_item = item.get(0);
				}
			}

			// Remove highlighting from an item in the results dropdown
			function deselect_dropdown_item (item) {
				item.removeClass(settings.classes.selectedDropdownItem);
				selected_dropdown_item = null;
			}

			function navigate_down() {
				var last_item = dropdown_ul.find('li:last');

				if ( last_item.attr('id') != current_list_item.attr('id')) {
					current_list_item = current_list_item.next('li');
					update_hidden_select_selection(current_list_item.attr('id'));
					select_dropdown_item(current_list_item);
					var current = find_search_content_by_value( current_list_item.attr('id'));
					input_box.val(current.text).select();
					scroll_to_item( current_list_item );
					last_successful_match = current.text;
				}
			}

			function navigate_up() {
				var first_item = dropdown_ul.find('li:first');
				
				if ( first_item.attr('id') != current_list_item.attr('id')) {
					current_list_item = current_list_item.prev('li');
					update_hidden_select_selection(current_list_item.attr('id'));
					select_dropdown_item(current_list_item);
					var current = find_search_content_by_value( current_list_item.attr('id'));
					input_box.val(current.text).select();
					scroll_to_item( current_list_item );
					last_successful_match = current.text;
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
				}
			}

			function regex_escape(text) {
				if ( ! arguments.callee.sRE ) {

					var specials = [
						'/', '.', '*', '+', '?', '|',
						'(', ')', '[', ']', '{', '}', '\\'
					];

					arguments.callee.sRE = new RegExp(
							'(\\' + specials.join('|\\') + ')', 'g'
					);
				}

				return text.replace(arguments.callee.sRE, '\\$1');
			}
			// Do the actual search
			function run_search(query) {
				var search_regex = new RegExp("^" + regex_escape(query), "i");
				var search_results = new Array();
				$(select_search_contents).each(function(){
						if ( search_regex.test(this.text) ) {
							search_results.push(this);
							return false;
						}
				});

				if ( search_results.length > 0 ) {
					$(input_box).val(search_results[0].text).textselection(query.length,search_results[0].text.length);
					update_hidden_select_selection(search_results[0].value);
					current_list_item = $(dropdown_ul).find("li#" + search_results[0].value);
					select_dropdown_item(current_list_item);
					if (visible) {
						scroll_to_item( current_list_item );
					}
					last_successful_match = query;
				}
				else {
					if ( last_successful_match.length > 0 ) {
						var previous = find_search_content_by_value($(hidden_select).val());
						$(input_box).val(previous.text);
						if ( last_successful_match.length == previous.text.length ) {
							$(input_box).textselection(0, previous.text.length);
						}
						else {
							$(input_box).textselection(last_successful_match.length, previous.text.length);
						}
					}
					else {
						$(input_box).val(last_successful_match);
					}
					show_dropdown();
				}

			}

			// change the selected value in the hidden select
			function update_hidden_select_selection( value ) {
				$(hidden_select).val(value).change();
			}

			return {
				positionDropDown: function() {
					position_dropdown();
				}
			};
		};
	}
);

