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

rs.renderRecs = function (recs) {
	var htmlStr = '';

	for (var i = 0; i < recs.length; i++) {
		var rec = recs[i];

        htmlStr += '<div class="media">';
        htmlStr += '    <div class="media-body">';
        htmlStr += '        <h4 class="media-heading">';
        htmlStr += '        	<a href="' + rec.url + '">' + rec.title + '</a>';
        htmlStr += '        </h4>';
        htmlStr += '        <p>' + rec.meta + '</p>';
        htmlStr += '    </div>';
        htmlStr += '</div>';
	}

	return htmlStr;
}

function getrecs(resp) {
	var recsStr = rs.renderRecs(resp.recs);

	$(function () {
		$('div[data-rs=true]').each(function () {
			var target = $(this);

			target.html(recsStr);
		});
	});
}


rs.doAjax = function () {	
	$.ajax({
        url: 'http://richanchors.com:3333/recs/?f=jsonp&demo=1&v=fuck&callback=getrecs',
        dataType: 'jsonp',
        callback: 'getrecs'
    });
};

rs.init = function () {
	rs.get$();
	rs.getSuggestions();
};

rs.init();