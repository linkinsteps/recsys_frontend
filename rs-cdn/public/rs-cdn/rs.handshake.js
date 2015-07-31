(function (rs, Cookies, JSON) {
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
        var regex = new RegExp('[\\?&]url=([^&#]*)');
        var results = regex.exec(window.location.href);

        if (results == null) {
            return '';
        } else {
            return unescape(results[1]);
        }
    };

    /**
     * Let hand shake with other site!!!
     */
    rs.handshake = function () {
        var postUrl = rs.getPostMessageUrl();
        if (postUrl) {
            var globalUID = Cookies.get(rs.UID_NAME.RS);

            if (!globalUID) {
                globalUID = rs.getRandomString();
                Cookies.set(rs.UID_NAME.RS, globalUID, {
                    path: '/',
                    expires: 999
                });
            }

            var postData = {};
            postData[rs.UID_NAME.RS] = globalUID;

            window.postMessage(JSON.stringify(postData), postUrl);
        }
    };

    rs.handshake();

})(rs = window.rs || {}, Cookies, JSON);
