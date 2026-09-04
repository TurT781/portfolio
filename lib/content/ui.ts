export type I18nString = { fr: string; en: string };

export const ui = {
  nav: {
    label: { fr: "Navigation", en: "Navigation" },
    work: { fr: "Travaux", en: "Work" },
    contact: { fr: "Contact", en: "Contact" },
    home: { fr: "Accueil", en: "Home" },
    stages: { fr: "Étapes", en: "Stages" },
    scroll: { fr: "Scroll : avance", en: "Scroll to move" },
  },
  contact: {
    name: { fr: "Nom", en: "Name" },
    email: { fr: "Email", en: "Email" },
    message: { fr: "Message", en: "Message" },
    send: { fr: "Envoyer", en: "Send" },
    sending: { fr: "Envoi…", en: "Sending…" },
    success: { fr: "Message envoyé. Merci.", en: "Message sent. Thank you." },
    error: { fr: "Échec de l'envoi. Réessayez ou écrivez-moi directement.", en: "Send failed. Retry or email me directly." },
  },
  notFound: {
    title: { fr: "Cette page n'existe pas.", en: "This page does not exist." },
    back: { fr: "Retour à l'accueil", en: "Back home" },
  },
} as const;
