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
		rs.$(function () {		
			rs.$('div[data-rs=true]').each(function () {
				var target = $(this);
				var keyword = target.attr('data-keyword');

				rs.doAjax(target, keyword);
			});
		});
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
};


rs.doAjax = function (target, keyword) {
	var callbackName = 'getRecs' + (new Date()).getTime();
	var fullCallbackName = 'rs.' + callbackName;

	rs[callbackName] = function (resp) {
		var recsStr = rs.renderRecs(resp.recs);
		target.html(recsStr);
	};

	rs.$.ajax({
        url: 'http://richanchors.com:8080/compositor/?f=jsonp&demo=1&v=' + keyword + '&callback=' + fullCallbackName,
        dataType: 'jsonp',
        callback: fullCallbackName
    });
};

rs.init = function () {
	rs.get$();
	rs.getSuggestions();
};

rs.init();
