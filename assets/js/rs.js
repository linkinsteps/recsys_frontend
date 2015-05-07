(function (rs) {
	function log() {
		console.log(arguments);
	}

	rs.HOST_NAME = 'http://richanchors.com:8080';

	/**
	 * Check existing of jQuery and store jQuery in '$'. If not, will get jQuery 
	 * from jQuery CDN and make it noConflict with current website
	 */
	rs.get$ = function () {
		log('rs.get$');

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

	/**
	 * Check jQuery is ready or not. If not, will create a timeout for checking.
	 * @param {Function} callback The callback will be called when jQuery is ready
	 */
	rs.on$Ready = function (callback) {
		log('rs.on$Ready');

		if (!rs.$) {
			setTimeout(function () {
				rs.on$Ready(callback);
			}, 50);
		} else {
			rs.$(function () {
				callback.apply(this);
			});
		};
	};

	/**
	 * Get suggestion for each element on website which has 'data-rs' attribute
	 */
	rs.initSuggestions = function () {
		log('rs.initSuggestions');

		rs.on$Ready(function () {
			rs.$('div[data-rs]').each(function () {
				var target = $(this);
				var keyword = target.attr('data-keyword');

				rs.getRecommendations(target, keyword);
			});

			rs.initEventHandlers();
		});
	};

	/**
	 * Render recommendations from AJAX request
	 * @param {Array<Object>} recs The array list contains all recommendations
	 * @return {String}
	 */
	rs.renderRecs = function (recs) {
		log('rs.renderRecs', recs);

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

	/**
	 * Get recommendations from server and render them
	 * @param {jQuery} target The element which has 'data-rs' attribute
	 * @param {String} keyword The keyword for getting recommendations
	 */
	rs.getRecommendations = function (target, keyword) {
		log('rs.getRecommendations', target, keyword);

		var callbackName = 'getRecs' + (new Date()).getTime();
		var fullCallbackName = 'rs.' + callbackName;

		rs[callbackName] = function (resp) {
			log('rs.' + callbackName, resp);

			var recsStr = rs.renderRecs(resp.recs);
			target.html(recsStr);
		};

		rs.$.ajax({
	        url: rs.HOST_NAME + '/compositor/?f=jsonp&demo=1&v=' + keyword + '&callback=' + fullCallbackName,
	        dataType: 'jsonp',
	        callback: fullCallbackName
	    });
	};

	rs.initEventHandlers = function () {
		log('rs.initEventHandlers');

		$(document).on({
			click: function () {
				var a = $(this);
				var isRs = a.parents('[data-rs]')[0];
				var logData = {
					type: 'click',
					text: a.text(),
					url: a.attr('href')
				};

				if (isRs) {
					logData.isRs = true;
				}

				rs.log(logData);
			}
		}, 'a');
	};

	/**
	 * Rs log function
	 * @param {Object} data The log data
	 */
	rs.log = function (data) {
		log('rs.log', data);

		var queryString = rs.$.param(data);
		var img = document.createElement('img');
		img.src = rs.HOST_NAME + '/logger/?' + queryString;
	};

	/**
	 * Initial RS system
	 */
	rs.init = function () {
		log('rs.init');

		rs.get$();
		rs.initSuggestions();
	};
	rs.init();


})(rs = window.rs || {});