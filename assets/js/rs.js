var rs = rs || {};

rs.get$ = function () {
	if (jQuery) {
		rs.$ = jQuery;
	} else {
		var jqueryScript = document.createElement('script');
		jqueryScript.onload = function () {
			rs.$ = jQuery.noConflict();
		};
		jqueryScript.src = 'http://code.jquery.com/jquery.min.js';

		document.body.appendChild(jqueryScript);
	}
};

rs.check$ = function (callback) {
	if (!rs.$) {
		setTimeout(function () {
			rs.check$(callback);
		}, 50);
	} else {
		callback.apply(this);
	};
};

rs.getSuggestions = function () {
	rs.check$(function () {
		rs.doAjax();
	});
};

rs.doAjax = function () {
	var target = $('div[data-rs=true]');
	
	$.ajax({
        url: 'http://demo.richanchors.com/recs/?f=json&demo=1&v=fuck',
        dataType: 'jsonp',
        success: function(resp) {
            console.log(resp);
        }
    });
};

rs.init = function () {
	rs.get$();
	rs.getSuggestions();
};

rs.init();