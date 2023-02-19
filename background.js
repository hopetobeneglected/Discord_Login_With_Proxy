const _chrome = chrome;

_chrome.runtime.onMessage.addListener((message) => {

    let proxy = {
        _scheme: null,
        _host: null,
        _port: null,
        _login: null,
        _pass: null
    };

    let {token, proxyInput} = {token: Object.values(message)[0], proxyInput: parseProxy(Object.values(message)[1])};

    function parseProxy(proxyString) {

        // Split the proxy string into its components
        const parts = proxyString.split(/:\/\/|:|\@/);

        if (parts.length === 4) {
            // Format: ip:port:username:password
            proxy._scheme = 'http';
            proxy._host = parts[0];
            proxy._port = parseInt(parts[1]);
            proxy._login = parts[2];
            proxy._pass = parts[3];
        } else if (parts.length === 5) {
            // Format: protocol://username:password@ip:port
            proxy._scheme = parts[0];
            proxy._host = parts[3];
            proxy._port = parseInt(parts[4]);
            proxy._login = parts[1];
            proxy._pass = parts[2];
        } else if (parts.length === 3) {
            // Format: username:password@ip:port
            proxy._scheme = 'http';
            proxy._host = parts[2];
            proxy._port = parseInt(parts[3]);
            proxy._login = parts[0];
            proxy._pass = parts[1];
        } else {
            throw new Error('Invalid proxy string format');
        }
        return proxy;
    }

    _chrome.proxy.settings.set(
        {
            value: {
                mode: 'pac_script',
                pacScript: {
                    data: 'function FindProxyForURL(url, host) { return "PROXY ' + proxy._host + ":" + proxy._port + '"; }'
                }
            },
            scope: 'regular'
        },
        function () {
            console.log('Прокси ' + proxy._host + ":" + proxy._port + ' установлен');
        }
    );

  // Автоматическая авторизация для установленного прокси:

    _chrome.webRequest.onAuthRequired.addListener(
        function (info, callback) {
            callback({
                authCredentials: {
                    username: proxy._login,
                    password: proxy._pass
                }
            });
        },
        {urls: ['<all_urls>']},
        ['asyncBlocking']
    );


    _chrome.tabs.create({url: 'https://discord.com/login'}, tab => {
            _chrome.tabs.executeScript(tab.id,
                {
                    code: "function login(token) {\n" +
                        "                        setInterval(() => {\n" +
                        "                            document.body.appendChild(document.createElement`iframe`)\n" +
                        "                                .contentWindow.localStorage.token = `\"${token}\"`;\n" +
                        "                        }, 50);\n" +
                        "                        setTimeout(() => {\n" +
                        "                            location.reload();\n" +
                        "                        }, 2500);\n" +
                        "                    }"
                }
            )
            _chrome.tabs.executeScript(tab.id, { code: "login(" + token + ")" })
        }
    )
});