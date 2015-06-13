(function (rs) {
    /**
     * Log function for rs
     */
    var LOGGER = {
        _log: function (methodName, logData) {
            if (console && console.log && typeof console.log === 'function') {
                var args = []; 
                args.push.apply(args, logData);
                args.unshift('[ResSys|' + (methodName.toUpperCase()) + ']');

                console.log.apply(console, args);
            }
        },

        info: function () {
            this._log('info', arguments);
        },

        debug: function () {
            if (rs.debug) {
                this._log('debug', arguments);
            }
        },

        error: function () {
            this._log('error', arguments);
        },

        warn: function () {
            this._log('warn', arguments);
        }
    };

    // Host name of rs
    rs.HOST_NAME = 'http://richanchors.com:8080';

    // Log key for rs
    rs.logKey = {
        TEXT: 'rs_text',
        RS: 'rs_rs',
        HREF: 'rs_href'
    };

    // Delay time for waiting jQuery is ready
    rs.READY_DELAY = 50;

    /**
     * Default template of Recommendations
     */
    rs.DEFAULT_TEMPLATE = '<div><h4><a href="{{url}}">{{title}}</a></h4><p>{{meta}}</p></div>';

    /**
     * Check existing of jQuery and store jQuery in '$'. If not, will get jQuery 
     * from jQuery CDN and make it noConflict with current website
     */
    rs.getjQuery = function () {
        if (jQuery) {
            LOGGER.info('jQuery is existed. Binding rs.$ = jQuery');
            rs.$ = jQuery;
        } else {
            var jQueryUrl = 'http://code.jquery.com/jquery.min.js';
            LOGGER.info('jQuery is not existed. Getting jQuery from ' + jQueryUrl);

            var jqueryScript = document.createElement('script');
            jqueryScript.onload = function () {
                rs.$ = jQuery.noConflict();
            };
            jqueryScript.async = true;
            jqueryScript.src = jQueryUrl;
            var s = document.getElementsByTagName('script')[0];
            s.parentNode.insertBefore(jqueryScript, s);
        }
    };

    /**
     * Check jQuery and 'document.body' is ready or not. If not, will create a timeout for checking.
     * @param {Function} callback The callback will be called when jQuery is ready
     */
    rs.onReady = function (callback) {
        rs.getjQuery();

        if (!rs.$) {
            setTimeout(function () {
                LOGGER.info('RecSys is not ready. Wait for ' + rs.READY_DELAY + ' ms...');
                rs.onReady(callback);
            }, rs.READY_DELAY);
        } else {
            rs.$(function () {
                LOGGER.info('RecSys is ready!');
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
            var regex = new RegExp('{{' + prop + '}}', 'g');

            htmlStr = htmlStr.replace(regex, rec[prop]);
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

    rs.onReady = function () {
        rs.initSuggestions();
        rs.initEventHandler();
        rs.initLogger();
    };


})(rs = window.rs || {});
