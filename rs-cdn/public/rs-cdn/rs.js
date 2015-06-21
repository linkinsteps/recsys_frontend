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

                if (rs.logArray) {
                    console.log(args);
                } else {
                    console.log.apply(console, args);
                }
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
    rs.HOST_NAME = 'http://richanchor.com';

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
    rs.DEFAULT_TEMPLATE = '<div class="recsys-item"><h4 class="recsys-title"><a class="recsys-link" href="{{url}}">{{title}}</a></h4><p class="recsys-description">{{meta}}</p></div>';

    /**
     * Check existing of jQuery and store jQuery in 'rs.$'. If not, will get jQuery 
     * from jQuery CDN and make it noConflict with current website
     */
    rs.getjQuery = function () {
        LOGGER.info('[getjQuery()]');

        if (window.jQuery) {
            LOGGER.info('jQuery is existed');
            rs.$ = jQuery;
        } else {
            var jQueryUrl = 'http://code.jquery.com/jquery.min.js';
            LOGGER.info('jQuery is not existed. Getting jQuery from ' + jQueryUrl);

            var jqueryScript = document.createElement('script');
            jqueryScript.onload = function () {
                LOGGER.info('Got jQuery from ' + jQueryUrl);
                rs.$ = window.jQuery.noConflict();
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
     * @param {Boolean} isFirstTime Is first time call onReady or not
     */
    rs.onReady = function (callback, isFirstTime) {
        if (isFirstTime) {
            rs.getjQuery();
        }

        if (!rs.$) {
            setTimeout(function () {
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
     * Init recommendations for each element on website which has 'data-rs' attribute
     */
    rs.initRecs = function () {
        LOGGER.info('[initRecs()]');

        rs.$('div[data-rs]').each(function () {
            var target = rs.$(this);
            
            rs.getRecs(target);
        });
    };

    /**
     * Get recommendations from server and render them
     * @param {jQuery} target The element which has 'data-rs' attribute
     */
    rs.getRecs = function (target) {
        LOGGER.info('[getRecs()]', target);

        var callbackName = 'getRecs' + (new Date()).getTime();
        var fullCallbackName = 'rs.' + callbackName;
        var url = rs.HOST_NAME + '/compositor/?f=jsonp&title=' + encodeURIComponent(document.title) + '&url=' + encodeURIComponent(window.location.href) + '&callback=' + fullCallbackName;
        if (rs.demo) {
            url += '&demo=1';
        }
        rs[callbackName] = function (resp) {
            LOGGER.info('Got recommendations from url: ' + url, resp);

            rs.renderRecs(target, resp.recs);
        };

        LOGGER.info('Starting get recommendations from url: ' + url);
        rs.$.ajax({
            url: url,
            dataType: 'jsonp',
            callback: fullCallbackName
        });
    };

    /**
     * Render recommendation by using 'rs.template'
     * @param {String} recsListTemplate The template string of recommendation
     * @param {Object} rec The recommendation object
     * @return {String}
     */
    rs.renderRec = function (recsListTemplate, rec) {
        LOGGER.debug('[renderRec()]', recsListTemplate, rec);

        var htmlStr = recsListTemplate;
        for (var prop in rec) {
            var regex = new RegExp('{{' + prop + '}}', 'g');

            htmlStr = htmlStr.replace(regex, rec[prop]);
        }

        LOGGER.debug('[renderRec() => ] \n', htmlStr);
        return htmlStr;
    };

    /**
     * Render recommendations from AJAX request
     * @param {jQuery} target The rs targeted object
     * @param {Array<Object>} recs The array list contains all recommendations
     * @return {String}
     */
    rs.renderRecs = function (target, recs) {
        LOGGER.info('[renderRecs()]', target, recs)

        var template = target.find('script[type="text\\/template"]').html();

        if (recs.length > 0) {
            if (template) {
                template = rs.$('<div />').html(template);
                var recsList = template.find('[data-rs-list]');
                var recsListTemplate = recsList.length > 0 ? recsList.html().trim() : '';
                if (!recsListTemplate) {
                    LOGGER.warn('There is not template for data list. Use default template for recommendations list');
                    recsListTemplate = rs.DEFAULT_TEMPLATE;
                } else {
                    LOGGER.debug('Template for recommendations: \n', recsListTemplate);
                }

                var recsListStr = '';
                for (var i = 0, rec; rec = recs[i]; i++) {
                    recsListStr += rs.renderRec(recsListTemplate, rec);
                }
                LOGGER.debug('Recommendations html: \n' + recsListStr);

                if (recsList.length > 0) {
                    recsList.html(recsListStr);
                } else {
                    template.append(recsListStr);
                }

                target.append(template.html());

                if (typeof rs.afterRender === 'function') {
                    rs.afterRender.call(null, target, rs.$);
                }
            } else {
                LOGGER.error('There is no template! [renderRecs()] skipped!')
            }
        } else {
            LOGGER.info('Recommendations from server is empty. [renderRecs()] skipped!');
        }
    };

    /**
     * Get information of href such as queryString, hash, etc...
     * @param {String} href
     * @return {Object}
     */
    rs.getHrefInfo = function (href) {
        LOGGER.debug('[getHrefInfo()]', href);

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

        var result = {
            hrefNoQuery: hrefNoQuery,
            queryString: queryString,
            hash: hash
        };

        LOGGER.debug('[getHrefInfo() => ]', result);
        return result;
    };

    /**
     * Get query string value of a href
     * @param {String} href
     * @param {String} key The key name of query string
     * @return {String|Null}
     */
    rs.getQueryString = function (href, key) {
        LOGGER.debug('[getQueryString()]', href, key);

        var value = null;
        var info = rs.getHrefInfo(href);
        var queryString = info.queryString;
        queryString = queryString.split('&');

        if (queryString[0]) {
            for (var i = 0; i < queryString.length; i++) {
                var pair = queryString[i].split('=');

                if (pair[0] === key) {
                    var value = decodeURIComponent(pair[1]);
                    break;
                }
            }
        }

        LOGGER.debug('[getQueryString() => ]', value);
        return value;
    };

    /**
     * Set query string value for a href
     * @param {String} href
     * @param {String} key
     * @param {String} value
     * @param {String}
     */
    rs.setQueryString = function (href, key, value) {
        LOGGER.debug('[setQueryString()]', href, key, value);

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

        var newHref = info.hrefNoQuery + '?' + queryString.join('&') + (info.hash ? '#' + info.hash : '');

        LOGGER.debug('[setQueryString() => ]', newHref);
        return newHref;
    };

    /**
     * Set query string values for a href
     * @param {String} href
     * @param {Object} data
     * @param {String}
     */
    rs.setQueryStrings = function (href, data) {
        LOGGER.debug('[setQueryStrings()]', href, data);

        for (var key in data) {
            var value = data[key];

            href = rs.setQueryString(href, key, value);
        }

        LOGGER.debug('[setQueryStrings() => ]', href);
        return href;
    };

    /**
     * Init event handler for all links in current HTML page
     */
    rs.initEventHandler = function () {
        LOGGER.info('[initEventHandler()]');

        rs.$(document).on({
            mousedown: function () {
                var a = rs.$(this);
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
        LOGGER.info('[initLogger()]');

        var href = window.location.href;
        var text = rs.getQueryString(href, rs.logKey.TEXT);
        var isRs = rs.getQueryString(href, rs.logKey.RS);
        var href = rs.getQueryString(href, rs.logKey.HREF);

        if (href) {
            var logData = {};
            logData[rs.logKey.TEXT] = text;
            logData[rs.logKey.RS] = isRs;
            logData[rs.logKey.HREF] = href;

            rs.log(logData);
        }
    };

    /**
     * Rs log function
     * @param {Object} data The log data
     */
    rs.log = function (data) {
        LOGGER.info('[log()]', data);

        var queryString = rs.$.param(data);
        var img = document.createElement('img');
        img.src = rs.HOST_NAME + '/logger/?' + queryString;
    };

    /**
     * Run RecSys after jQuery and 'document.body' are ready
     */
    rs.onReady(function () {
        rs.initLogger();
        rs.initRecs();
        rs.initEventHandler();
    }, true);


})(rs = window.rs || {});
