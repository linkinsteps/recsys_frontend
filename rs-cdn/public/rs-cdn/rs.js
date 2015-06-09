(function (rs) {
    function log() {
        console.log(arguments);
    }

    rs.HOST_NAME = 'http://richanchor.com';
    rs.logKey = {
        TEXT: 'rs_text',
        RS: 'rs_rs',
        HREF: 'rs_href'
    };

    /**
     * Default template of Recommendations
     */
    rs.DEFAULT_TEMPLATE = '';
    rs.DEFAULT_TEMPLATE += '<div class="media">';
    rs.DEFAULT_TEMPLATE += '    <div class="media-body">';
    rs.DEFAULT_TEMPLATE += '        <h4 class="media-heading">';
    rs.DEFAULT_TEMPLATE += '            <a href="{{url}}">{{title}}</a>';
    rs.DEFAULT_TEMPLATE += '        </h4>';
    rs.DEFAULT_TEMPLATE += '        <p>{{meta}}</p>';
    rs.DEFAULT_TEMPLATE += '    </div>';
    rs.DEFAULT_TEMPLATE += '</div>';

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
        });
    };

    /**
     * Render recommendation by using 'rs.template'
     * @param {Object} rec The recommendation object
     * @return {String}
     */
    rs.renderRec = function (rec) {
        var htmlStr = rs.template || rs.DEFAULT_TEMPLATE;

        for (var prop in rec) {
            var value = rec[prop];
            var regex = new RegExp('{{' + prop + '}}', 'g');

            if (prop === 'url') {
                value = value.replace('http://vbuzz.vn/', 'http://richanchor.com/vbuzz/');
            }

            htmlStr = htmlStr.replace(regex, value);
        }

        return htmlStr;
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

            htmlStr += rs.renderRec(rec);
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
        var url = window.location.href.replace('http://richanchor.com/vbuzz/', 'http://vbuzz.vn/');

        rs[callbackName] = function (resp) {
            log('rs.' + callbackName, resp);

            var recsStr = rs.renderRecs(resp.recs);
            target.html(recsStr);
        };

        rs.$.ajax({
            url: rs.HOST_NAME + '/compositor/?f=jsonp&title=' + encodeURIComponent(document.title) + '&url=' + encodeURIComponent(url) + '&callback=' + fullCallbackName,
            dataType: 'jsonp',
            callback: fullCallbackName
        });
    };

    /**
     * Get information of href such as queryString, hash, etc...
     * @param {String} href
     * @return {Object}
     */
    rs.getHrefInfo = function (href) {
        log('rs.getHrefInfo', href);

        var hrefNoQuery = href;
        var queryString = '';
        var hash = '';

        var temp = href.split('?');

        if (temp[1]) {
            hrefNoQuery = temp[0];
            queryString = temp[1];

            temp = queryString.split('#');

            if (temp[1]) {
                queryString = temp[0];
                hash = temp[1];
            }
        }

        return {
            hrefNoQuery: hrefNoQuery,
            queryString: queryString,
            hash: hash
        };
    };

    /**
     * Get query string value of a href
     * @param {String} href
     * @param {String} key The key name of query string
     * @return {String|Null}
     */
    rs.getQueryString = function (href, key) {
        log('rs.getQueryString', href, key);

        var info = rs.getHrefInfo(href);
        var queryString = info.queryString;
        queryString = queryString.split('&');

        if (queryString[0]) {
            for (var i = 0; i < queryString.length; i++) {
                var pair = queryString[i].split('=');

                if (pair[0] === key) {
                    return decodeURIComponent(pair[1]);
                }
            }
        }

        return null;
    };

    /**
     * Set query string value for a href
     * @param {String} href
     * @param {String} key
     * @param {String} value
     * @param {String}
     */
    rs.setQueryString = function (href, key, value) {
        log('rs.setQueryString', href, key, value);

        var info = rs.getHrefInfo(href);
        var isExisted = false;
        var queryString = info.queryString;
        queryString = queryString.split('&');

        if (queryString[0]) {
            for (var i = 0; i < queryString.length; i++) {
                var pair = queryString[i].split('=');

                if (pair[0] === key) {
                    pair[0] = encodeURIComponent(value);
                    isExisted = true;
                    break;
                }
            }
        } else {
            queryString = [];
        }

        if (!isExisted) {
            queryString.push(key + '=' + encodeURIComponent(value));
        }

        return info.hrefNoQuery + '?' + queryString.join('&') + (info.hash ? '#' + info.hash : '');
    };

    /**
     * Set query string values for a href
     * @param {String} href
     * @param {Object} data
     * @param {String}
     */
    rs.setQueryStrings = function (href, data) {
        log('rs.setQueryStrings', href, data);

        for (var key in data) {
            var value = data[key];

            href = rs.setQueryString(href, key, value);
        }

        return href;
    };

    /**
     * Init event handler for all links in current HTML page
     */
    rs.initEventHandler = function () {
        log('rs.initEventHandler');

        $(document).on({
            mousedown: function () {
                var a = $(this);
                var href = a.prop('href');
                var logData = {};
                logData[rs.logKey.TEXT] = a.text().trim().replace(/\s*([^\s]+\s?)\s*/g, '$1');
                logData[rs.logKey.RS] = !!a.parents('[data-rs]')[0];
                logData[rs.logKey.HREF] = href;
                href = rs.setQueryStrings(href, logData);

                a.attr('href', href);
            }
        }, 'a');
    };

    /**
     * Init logger for current
     */
    rs.initLogger = function () {
        log('rs.initLogger');

        var href = window.location.href;
        var logData = {};
        logData[rs.logKey.TEXT] = rs.getQueryString(href, rs.logKey.TEXT);
        logData[rs.logKey.RS] = rs.getQueryString(href, rs.logKey.RS);
        logData[rs.logKey.HREF] = rs.getQueryString(href, rs.logKey.HREF);

        rs.log(logData);
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
        rs.initEventHandler();
        rs.initLogger();
    };

    window.onload = function () {
        rs.init();
    };


})(rs = window.rs || {});
