// src/services/NotificationService.js

export const NotificationService = {
  solicitarPermissao: async () => {
    if (!("Notification" in window)) {
      console.log("Este navegador não suporta notificações.");
      return false;
    }
    
    // Se já foi concedida, não precisa perguntar de novo
    if (Notification.permission === "granted") {
      return true;
    }
    
    // Se foi negada, não adianta perguntar (o navegador não deixa)
    if (Notification.permission === "denied") {
      console.warn("Permissão de notificação foi negada pelo usuário.");
      return false;
    }

    // Pede a permissão
    const permission = await Notification.requestPermission();
    return permission === "granted";
  },

  enviar: (titulo, mensagem) => {
    if (Notification.permission === "granted") {
      new Notification(titulo, {
        body: mensagem,
        icon: '/pwa-192x192.png',      // Ícone principal (grande)
        badge: '/pwa-192x192.png',     // Ícone pequeno na barra de status (Android)
        vibrate: [200, 100, 200],      // Padrão de vibração: vibra, pausa, vibra
        tag: 'alerta-eclochick',       // Agrupa notificações (não empilha várias)
        requireInteraction: true,      // A notificação não some sozinha (usuário precisa clicar)
      });
    } else {
      console.warn("Permissão de notificação não concedida.");
      // Fallback opcional: você pode usar um toast aqui se quiser
    }
  }
};