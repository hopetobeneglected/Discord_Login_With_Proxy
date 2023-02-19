sessionStorage.setItem('discordExt', 'true')

document.addEventListener('discord-token', ({ detail: { token, proxy } }) => {
    const message = JSON.stringify({ token, proxy })
    window.chrome.runtime.sendMessage(message)
})