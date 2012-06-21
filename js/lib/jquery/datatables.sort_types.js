jQuery.fn.dataTableExt.oSort['date-asc'] = function(a,b) {
	var x = Date.parse(a);
	var y = Date.parse(b);
	if (x == y) { return 0; }
	if (isNaN(x) || x < y) { return -1; }
	if (isNaN(y) || x > y) { return 1; }
};

jQuery.fn.dataTableExt.oSort['date-desc'] = function(a,b) {
	var x = Date.parse(a);
	var y = Date.parse(b);
	if (x == y) { return 0; }
	if (isNaN(x) || x < y) { return 1; }
	if (isNaN(y) || x > y) { return -1; }
};
