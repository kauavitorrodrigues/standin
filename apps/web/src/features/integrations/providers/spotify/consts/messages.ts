// Messages of the system: what a toast or a state of the account says. The text
// of the components themselves stays in the component.
export const SpotifyMessages = {
    saved: "App do Spotify salvo.",
    saveFailed: "Não foi possível salvar o app do Spotify.",
    credentialsInvalid: "O Spotify não aceitou esse Client ID e Secret.",
    removePersonFailed: "Não foi possível remover essa pessoa.",
    removeAppFailed: "Não foi possível remover o app do Spotify.",
    disconnectFailed: "Não foi possível desconectar.",
    accountConnected: "Conectada a esta organização.",
    accountNotConfigured:
        "O dono da organização ainda não configurou o Spotify.",
    accountFull:
        "Todas as vagas do Spotify desta organização estão ocupadas. Peça ao dono para liberar uma.",
    accountNeedsReconnect:
        "Sua conexão não pode mais ser usada. Conecte sua conta de novo.",
    accountIdle: "Conecte sua conta para mostrar o que você está ouvindo.",
    disconnectHint:
        "Para tirar também o acesso do app, remova-o em spotify.com/account/apps.",
    result: {
        connected: "Spotify conectado.",
        denied: "Você não autorizou o Spotify.",
        limit_reached:
            "Todas as vagas do Spotify desta organização estão ocupadas.",
        not_allowed:
            "Essa conta não está na lista do app do Spotify. Peça ao dono da organização para adicioná-la.",
        account_taken:
            "Essa conta do Spotify já está conectada por outra pessoa desta organização.",
        not_configured: "O Spotify não está configurado nesta organização.",
        state_invalid: "A tentativa de conexão expirou. Tente de novo.",
        failed: "Não foi possível conectar o Spotify.",
    },
} as const;
