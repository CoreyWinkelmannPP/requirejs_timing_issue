define(
	['jquery'],
	function($) {
		// get selection: fine in FF and Webkit, partly working in IE6+ (selecting from right-to-left is broken), broken in Opera
		// set selection: ???
		$.fn.textselection = function(start, end) {
			if (start !== undefined) {
				return this.each(function() {
					if( this.createTextRange ){
						var selRange = this.createTextRange();
						if (end === undefined || start == end) {
							selRange.move("character", start);
							selRange.select();
						} else {
							selRange.collapse(true);
							selRange.moveStart("character", start);
							selRange.moveEnd("character", end);
							selRange.select();
						}
					} else if( this.setSelectionRange ){
						this.setSelectionRange(start, end);
					} else if( this.selectionStart ){
						this.selectionStart = start;
						this.selectionEnd = end;
					}
				});
			}
			var field = this[0];
			if ( field.createTextRange ) {
				var range = document.selection.createRange(),
					orig = field.value,
					teststring = "<->",
					textLength = range.text.length;
				range.text = teststring;
				var caretAt = field.value.indexOf(teststring);
				field.value = orig;
				this.textselection(caretAt, caretAt + textLength);
				return {
					start: caretAt,
					end: caretAt + textLength
				}
			} else if( field.selectionStart !== undefined ){
				return {
					start: field.selectionStart,
					end: field.selectionEnd
				}
			}
		};
	}
);
