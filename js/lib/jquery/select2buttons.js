define(
	['jquery'],
	function($) {
		jQuery.fn.select2Buttons = function(options) {
			var settings = $.extend(true, {
				noDefault : false,
				classes : {
					buttonsWrapper : 'radio-button-bar group',
					first : 'first',
					last : 'last',
					one : 'one-item',
					selectedItem : 'on',
					disabled : 'disabled',
					ul : 'select-buttons group'
				}
			}, options);
		  return this.each(function(){
				new $.Select2Buttons(this, settings);
		  });
		};

		$.Select2Buttons = function(selectElement, settings) {
			var select = $(selectElement);
			var multiselect = select.attr('multiple');
			select.hide();

			var buttonsHtml = $('<div></div>').addClass(settings.classes.buttonsWrapper);
			var selectIndex = 0;
			var firstIndex = 0;
			var addOptGroup = function(optGroup){
				if (optGroup.attr('label')){
					buttonsHtml.append('<strong>' + optGroup.attr('label') + '</strong>');
				}

				var ulHtml =  $('<ul>').addClass(settings.classes.ul);

				if ( settings.noDefault ) {
					ulHtml.addClass(settings.classes.disabled);
				}

				if ( optGroup.children('option[value=-1]').length > 0 ) {
					selectIndex = 1;
					firstIndex = 1;
				}

				optGroup.children('option').each(function(){
					if ( $(this).val() == '-1' ) {
						return true;
					}
				var liHtml = $('<li></li>');


				if ( selectIndex === firstIndex ) {
					liHtml.addClass(settings.classes.first);
				}
				if ( (selectIndex + 1) === optGroup.children('option').length ) {
					liHtml.addClass(settings.classes.last);
				}

				if ($(this).attr('disabled') || select.attr('disabled')){
					liHtml.addClass(settings.classes.disabled);
					liHtml.append('<span>' + $(this).html() + '</span>');
				}else{
					liHtml.append('<a href="#" data-select-index="' + selectIndex + '" data-select-value="' + $(this).val() + '">' + $(this).html() + '</a>');
				}

					// Mark current selection as "picked"
					if(! settings.noDefault && $(this).attr('selected')){
						liHtml.addClass(settings.classes.selectedItem);
					}
					ulHtml.append(liHtml);
					selectIndex++;
				});

				if ( ulHtml.find('li').length == 1 ) {
					buttonsHtml.addClass(settings.classes.one);
				}
				buttonsHtml.append(ulHtml);
			};

			var optGroups = select.children('optgroup');
			if (optGroups.length == 0) {
				addOptGroup(select);
			}else{
				optGroups.each(function(){
					addOptGroup($(this));
				});
			}

			select.after(buttonsHtml);

			buttonsHtml.find('ul li a')
			.bind('mousedown mouseup', function(e){
				e.preventDefault();
				e.stopPropagation();
			})
			.bind('click', function(e){
				e.preventDefault();
				e.stopPropagation();
				if (!jQuery(this).closest('ul').hasClass('disabled')) {
					var li = $(this).closest('li');

					var clickedOption = $(select.find('option')[$(this).attr('data-select-index')]);
					if(multiselect){
						if(clickedOption.attr('selected')) {
							li.removeClass(settings.classes.selectedItem);
							clickedOption.removeAttr('selected');
						}
						else {
							li.addClass(settings.classes.selectedItem);
							clickedOption.attr('selected', 'selected');
						}
					}
					else {
						buttonsHtml.find('li').removeClass(settings.classes.selectedItem);
						li.addClass(settings.classes.selectedItem);
						clickedOption.attr('selected', 'selected');
					}
					select.trigger('change');
				}

			});
		};
	}
);
