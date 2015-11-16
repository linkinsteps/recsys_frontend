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
    rs.URL_JQUERY = rs.HOST_NAME + '/rs-cdn/jquery-1.8.3.min.js';
    rs.URL_COOKIES = rs.HOST_NAME + '/rs-cdn/js.cookie-2.0.2.min.js';
    rs.URL_MUSTACHE = rs.HOST_NAME + '/rs-cdn/mustache-2.1.2.min.js';
    rs.URL_HANDSHAKE = rs.HOST_NAME + '/handshake/';

    // Log key for rs
    rs.LOG_KEY = {
        TEXT: 'rs_text',
        RS: 'rs_rs',
        HREF: 'rs_href',
        ACTION: 'rs_action'
    };

    // Cookie name
    rs.UID_NAME = {
        SITE: 'rs_uid_site',
        RS: 'rs_uid_rs'
    };

    // Delay time for waiting jQuery is ready
    rs.READY_DELAY = 50;

    /**
     * Default template of Recommendations
     */
    rs.DEFAULT_TEMPLATE = '<div class="recsys-item"><h4 class="recsys-title"><a class="recsys-link" href="{{url}}">{{title}}</a></h4><p class="recsys-description">{{meta}}</p></div>';

    /**
     * Get random string include digit and number with total length is 32
     * @return {String}
     */
    rs.getRandomString = function () {
        return (
            Math.random().toString(36).substr(2, 8) + 
            Math.random().toString(36).substr(2, 8) + 
            Math.random().toString(36).substr(2, 8) + 
            Math.random().toString(36).substr(2, 8)
        );
    };

    /**
     * Get global UID via iframe link to 'rs.URL_HANDSHAKE'
     */
    rs.getGlobalUID = function () {
        LOGGER.info('[getGlobalUID()]');

        var currentUrl = window.location.protocol + '//' + window.location.hostname;
        var onMessageHandler = function (e) {
            LOGGER.info('onMessage event');

            if (e.origin === rs.HOST_NAME) {
                LOGGER.info('Have got a valid post message', e);
                var data = JSON.parse(e.data);
                LOGGER.info('Data of post message =>', data);

                if (data[rs.UID_NAME.RS]) {
                    LOGGER.info('Global UID =>', data[rs.UID_NAME.RS]);
                    rs.rsCookie = data[rs.UID_NAME.RS];
                }
            }

            LOGGER.info('onMessage ended!');
        };

        if (window.addEventListener) {
            window.addEventListener('message', onMessageHandler, false);
        } else {
            window.attachEvent('onmessage', onMessageHandler);
        }

        var iframe = document.createElement('iframe');
        iframe.setAttribute('style', 'display: none !important;');
        iframe.src = rs.URL_HANDSHAKE + '?url=' + encodeURIComponent(currentUrl);
        document.body.appendChild(iframe);

        LOGGER.info('[getGlobalUID() !]');
    };

    /**
     * Getting a script with callback
     * @param {String} url The url script
     * @param {Funtion} callback The callback will be called after script is loaded
     */
    rs.getScript = function (url, callback) {
        var script = document.createElement('script');
        script.onload = callback;
        script.async = true;
        script.src = url;

        // First script tag
        var fScript = document.getElementsByTagName('script')[0];
        fScript.parentNode.insertBefore(script, fScript);
    }

    /**
     * Check existing of jQuery and store jQuery in 'rs.$'. If not, will get jQuery 
     * from RS CDN and make it noConflict with current website
     */
    rs.getjQuery = function () {
        LOGGER.info('[getjQuery()]');

        if (window.jQuery) {
            LOGGER.info('jQuery exists');
            rs.$ = jQuery;
        } else {
            LOGGER.info('jQuery does not exist');

            rs.getScript(rs.URL_JQUERY, function () {
                LOGGER.info('Got jQuery');
                rs.$ = window.jQuery.noConflict();
            });
        }
    };

    /**
     * Check existing of JSCookies and store Cookies in 'rs.Cookies'. If not, will get JSCookies
     * from RS CDN and make it noConflict with current website
     */
    rs.getJSCookies = function () {
        LOGGER.info('[getJSCookies()]');

        if (window.jQuery && window.jQuery.cookie) {
            LOGGER.info('JSCookies exists');
            rs.$ = jQuery;
        } else {
            LOGGER.info('JSCookies does not exist');

            rs.getScript(rs.URL_COOKIES, function () {
                LOGGER.info('Got JSCookies');
                rs.Cookies = window.Cookies.noConflict();
            });
        }
    };

    /**
     * Check existing of Mustache and store Mustache in 'rs.Mustache'. If not, will get Mustache 
     * from RS CDN
     */
    rs.getMustache = function () {
        LOGGER.info('[getMustache()]');

        if (window.Mustache) {
            LOGGER.info('Mustache exists');
        } else {
            LOGGER.info('Mustache does not exist');

            rs.getScript(rs.URL_MUSTACHE, function () {
                LOGGER.info('Got Mustache');
                rs.Mustache = window.Mustache;
            });
        }
    };


    /**
     * Check jQuery, Mustache, Cookies and 'document.body' is ready or not. If not, will create a timeout for checking.
     * @param {Function} callback The callback will be called when jQuery is ready
     * @param {Boolean} isFirstTime Is first time call onReady or not
     */
    rs.onReady = function (callback, isFirstTime) {
        if (isFirstTime) {
            rs.getGlobalUID();
            rs.getjQuery();
            rs.getJSCookies();
            rs.getMustache();
        }

        if (!rs.$ || !rs.Mustache || !rs.Cookies || !rs.rsCookie) {
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
        var title = document.title;
        var href = rs.removeRsQueryString(window.location.href);
        var url = rs.HOST_NAME + '/compositor/';
        var data = {
            f: 'jsonp',
            title: title,
            url: href
        };

        // Add UID for current site and entire RS
        data[rs.UID_NAME.SITE] = rs.siteCookie;
        data[rs.UID_NAME.RS] = rs.rsCookie;

        if (rs.demo) {
            data.url = 'http://vbuzz.vn';
            data.title = 'Sơn Tùng M-TP';
            data.demo = 1;
        }

        rs[callbackName] = function (resp) {
            LOGGER.info('Got recommendations from url: ' + url, resp);

            if (resp && resp.outputs && resp.outputs[0] && resp.outputs[0].recs) {
                rs.renderRecs(target, resp.outputs[0].recs);
            } else {
                LOGGER.info('There is no recommendation from server!');
            }
        };

        LOGGER.info('Starting get recommendations from url: ' + url);
        rs.$.ajax({
            url: url,
            data: data,
            dataType: 'jsonp',
            jsonpCallback: fullCallbackName
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

        var htmlStr = rs.Mustache.render(recsListTemplate, rec);        

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

        var urlRegex = /([^?#]+)(\?*)([^#]*)(#{0,1})(.*)/;
        var info = urlRegex.exec(href);
        var result = {
            hrefNoQuery: info[1],
            queryString: info[3],
            hash: info[5]
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
     * @return {String}
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
     * @return {String}
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
     * Remove all rs query string in url
     * @param {String} href
     * @return {String}
     */
    rs.removeRsQueryString = function (href) {
        LOGGER.debug('[removeRsQueryString()]', href);

        var info = rs.getHrefInfo(href);
        var isExisted = false;
        var queryString = info.queryString;
        queryString = queryString.split('&');
        var newHref = info.hrefNoQuery;

        if (queryString[0]) {
            var newQueryString = [];
            for (var i = 0; i < queryString.length; i++) {
                var pair = queryString[i].split('=');

                if (pair[0].indexOf('rs_') > 0) {
                    newQueryString.push(pair);
                }
            }

            if (newQueryString.length > 0) {
                newHref += '?' + newQueryString.join('&');
            }
        }

        LOGGER.debug('[removeRsQueryString() => ]', newHref);
        return newHref;
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
                logData[rs.LOG_KEY.TEXT] = a.text().trim().replace(/\s*([^\s]+\s?)\s*/g, '$1');
                logData[rs.LOG_KEY.RS] = !!a.parents('[data-rs]')[0];
                logData[rs.LOG_KEY.HREF] = href;
                logData[rs.LOG_KEY.ACTION] = 'click';
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

        var currentUrl = window.location.href;
        var text = rs.getQueryString(currentUrl, rs.LOG_KEY.TEXT);
        var isRs = rs.getQueryString(currentUrl, rs.LOG_KEY.RS);
        var href = rs.getQueryString(currentUrl, rs.LOG_KEY.HREF);
        var action = rs.getQueryString(currentUrl, rs.LOG_KEY.ACTION);

        // Send log data for visit action
        var visitData = {};
        visitData[rs.LOG_KEY.HREF] = rs.removeRsQueryString(currentUrl);
        visitData[rs.LOG_KEY.ACTION] = 'visit';        
        rs.log(visitData)

        // Send log data for click action to server
        if (href) {
            var clickData = {};
            clickData[rs.LOG_KEY.TEXT] = text;
            clickData[rs.LOG_KEY.RS] = isRs;
            clickData[rs.LOG_KEY.HREF] = href;
            clickData[rs.LOG_KEY.ACTION] = action;

            rs.log(clickData);
        }
    };

    /**
     * Rs log function
     * @param {Object} data The log data
     */
    rs.log = function (data) {
        LOGGER.info('[log()]', data);

        // Add UID for current site and entire RS
        data[rs.UID_NAME.SITE] = rs.siteCookie;
        data[rs.UID_NAME.RS] = rs.rsCookie;

        var queryString = rs.$.param(data);
        var img = document.createElement('img');
        img.src = rs.HOST_NAME + '/logger/?' + queryString;
    };

    /**
     * Init cookie for current site and entire RecSys
     */
    rs.initCookie = function () {
        rs.siteCookie = rs.Cookies.get(rs.UID_NAME.SITE);

        if (!rs.siteCookie) {
            LOGGER.info('Cookie for current site does not exits')

            rs.siteCookie = rs.getRandomString();
            rs.Cookies.set(rs.UID_NAME.SITE, rs.siteCookie, {
                path: '/',
                expires: 999
            });
            LOGGER.info('Stored cookie "' + rs.siteCookie + '" for current site');
        } else {
            LOGGER.info('Cookie for current site is: "' + rs.siteCookie + '"');
        }
    };
    
    rs.onReady(function () {
        rs.initCookie();
        rs.initLogger();
        rs.initRecs();
        rs.initEventHandler();
    }, true);


})(rs = window.rs || {});
