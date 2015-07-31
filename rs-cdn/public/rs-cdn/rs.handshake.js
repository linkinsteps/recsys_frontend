(function (rs, Cookies, JSON) {
    rs.debug = true;

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

    rs.UID_NAME = {
        RS: 'rs_uid_rs'
    };

    /**
     * Get url which will post message to
     * @return {String}
     */
    rs.getPostMessageUrl = function () {
        LOGGER.debug('[getPostMessageUrl()]');

        var regex = new RegExp('[\\?&]url=([^&#]*)');
        var results = regex.exec(window.location.href) || '';
        results = decodeURIComponent(results[1]);

        LOGGER.debug('[getPostMessageUrl() => ]', results);

        return results;
    };

    /**
     * Let hand shake with other site!!!
     */
    rs.handshake = function () {
        LOGGER.info('[handshake()]');
        var postUrl = rs.getPostMessageUrl();

        if (postUrl) {
            LOGGER.info('Post url: ' + postUrl);

            var globalUID = Cookies.get(rs.UID_NAME.RS);

            if (!globalUID) {
                globalUID = rs.getRandomString();
                Cookies.set(rs.UID_NAME.RS, globalUID, {
                    path: '/',
                    expires: 999
                });
            }

            LOGGER.info('Global UID: ' + globalUID);

            var postData = {};
            postData[rs.UID_NAME.RS] = globalUID;

            window.postMessage(JSON.stringify(postData), postUrl);
            LOGGER.info('Posted message to "' + postUrl + '"');
        } else {
            LOGGER.info('There is no post url. [handshake()] skipped!')
        }
    };

    window.onload = function () {
        rs.handshake();
    };

})(rs = window.rs || {}, Cookies, JSON);
