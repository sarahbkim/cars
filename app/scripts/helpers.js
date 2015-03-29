'use strict';
var helpers = function() {
	var parseDate = d3.time.format("%Y-%m-%d").parse;

	// start public methods
	return {
		print_filter: function(filter) {
				var f=eval(filter);
				if (typeof(f.length) != "undefined") {}else{}
				if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
				if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
				console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));	
		},
		truncate: function(number, digits) {
			var multiplier = Math.pow(10, digits),
				adjustedNum = number * multiplier,
				truncatedNum = Math[adjustedNum < 0 ? 'ceil' : 'floor'](adjustedNum);
			if(truncatedNum % multiplier == 0 ) {
				return (truncatedNum / multiplier).toFixed(digits)
			}
			return truncatedNum / multiplier;
		}
	};
	// end public methods
}();
