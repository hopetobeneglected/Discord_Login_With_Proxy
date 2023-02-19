const _chrome = window.chrome;

document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token');
    const proxyInput = document.getElementById('proxy');
    const openBtn = document.getElementById('openBtn');

    openBtn.addEventListener('click', () => {
        const $token = JSON.stringify(tokenInput.value);
        const $proxy = JSON.stringify(proxyInput.value);
        _chrome.runtime.sendMessage({$token, $proxy});
    });
});