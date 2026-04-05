// Lightweight i18n — add keys here as needed

export type Lang = 'en' | 'de' | 'fr' | 'es' | 'tr';

export const LANGUAGES: { code: Lang; label: string; flag: string }[] = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'es', label: 'Español',  flag: '🇪🇸' },
  { code: 'tr', label: 'Türkçe',   flag: '🇹🇷' },
];

type Translations = Record<string, Record<Lang, string>>;

export const T: Translations = {
  // Nav
  'nav.dashboard':   { en: 'Dashboard',   de: 'Dashboard',   fr: 'Tableau de bord', es: 'Panel',       tr: 'Gösterge' },
  'nav.create':      { en: 'Create',      de: 'Erstellen',   fr: 'Créer',           es: 'Crear',       tr: 'Oluştur'  },
  'nav.study':       { en: 'Study',       de: 'Lernen',      fr: 'Étudier',         es: 'Estudiar',    tr: 'Çalış'    },
  'nav.planner':     { en: 'Planner',     de: 'Planer',      fr: 'Planificateur',   es: 'Planificador',tr: 'Planlayıcı' },
  'nav.leaderboard': { en: 'Leaderboard', de: 'Rangliste',   fr: 'Classement',      es: 'Clasificación',tr: 'Sıralama' },
  'nav.analytics':   { en: 'Analytics',   de: 'Analytik',    fr: 'Analytique',      es: 'Análisis',    tr: 'Analitik' },
  'nav.settings':    { en: 'Settings',    de: 'Einstellungen',fr: 'Paramètres',     es: 'Ajustes',     tr: 'Ayarlar'  },
  'nav.tutor':       { en: 'AI Tutor',    de: 'KI-Tutor',    fr: 'Tuteur IA',       es: 'Tutor IA',    tr: 'AI Öğretmen' },
  'nav.groups':      { en: 'Study Groups',de: 'Lerngruppen', fr: 'Groupes d\'étude',es: 'Grupos de estudio',tr: 'Çalışma Grupları' },

  // Dashboard
  'dashboard.welcome':     { en: 'Welcome back',       de: 'Willkommen zurück', fr: 'Bon retour',        es: 'Bienvenido de nuevo', tr: 'Tekrar hoşgeldiniz' },
  'dashboard.studyNow':    { en: 'Study Now',          de: 'Jetzt lernen',      fr: 'Étudier maintenant',es: 'Estudiar ahora',       tr: 'Şimdi çalış'       },
  'dashboard.dueToday':    { en: 'Due today',          de: 'Heute fällig',      fr: 'Dû aujourd\'hui',   es: 'Para hoy',            tr: 'Bugün yapılacak'   },
  'dashboard.streak':      { en: 'Day streak',         de: 'Tagessträhne',      fr: 'Série de jours',    es: 'Racha de días',       tr: 'Gün serisi'        },
  'dashboard.cards':       { en: 'Cards learned',      de: 'Gelernte Karten',   fr: 'Cartes apprises',   es: 'Tarjetas aprendidas', tr: 'Öğrenilen kartlar' },
  'dashboard.noDecks':     { en: 'No decks yet',       de: 'Noch keine Decks',  fr: 'Pas encore de paquets', es: 'Aún sin mazos',  tr: 'Henüz kart destesi yok' },
  'dashboard.createFirst': { en: 'Create your first deck to get started', de: 'Erstelle dein erstes Deck', fr: 'Créez votre premier paquet', es: 'Crea tu primer mazo', tr: 'İlk deste kartını oluştur' },

  // Buttons
  'btn.save':     { en: 'Save',     de: 'Speichern', fr: 'Enregistrer', es: 'Guardar', tr: 'Kaydet'  },
  'btn.cancel':   { en: 'Cancel',   de: 'Abbrechen', fr: 'Annuler',     es: 'Cancelar',tr: 'İptal'   },
  'btn.delete':   { en: 'Delete',   de: 'Löschen',   fr: 'Supprimer',   es: 'Eliminar',tr: 'Sil'     },
  'btn.edit':     { en: 'Edit',     de: 'Bearbeiten',fr: 'Modifier',    es: 'Editar',  tr: 'Düzenle' },
  'btn.create':   { en: 'Create',   de: 'Erstellen', fr: 'Créer',       es: 'Crear',   tr: 'Oluştur' },
  'btn.back':     { en: 'Back',     de: 'Zurück',    fr: 'Retour',      es: 'Volver',  tr: 'Geri'    },
  'btn.continue': { en: 'Continue', de: 'Weiter',    fr: 'Continuer',   es: 'Continuar',tr: 'Devam'  },
  'btn.start':    { en: 'Start',    de: 'Starten',   fr: 'Commencer',   es: 'Empezar', tr: 'Başla'   },

  // Study session
  'study.again':       { en: 'Again',       de: 'Nochmal',     fr: 'Encore',        es: 'Otra vez',    tr: 'Tekrar'      },
  'study.hard':        { en: 'Hard',        de: 'Schwer',      fr: 'Difficile',     es: 'Difícil',     tr: 'Zor'         },
  'study.good':        { en: 'Good',        de: 'Gut',         fr: 'Bien',          es: 'Bien',        tr: 'İyi'         },
  'study.easy':        { en: 'Easy',        de: 'Leicht',      fr: 'Facile',        es: 'Fácil',       tr: 'Kolay'       },
  'study.showAnswer':  { en: 'Show Answer', de: 'Antwort zeigen',fr: 'Voir la réponse',es: 'Ver respuesta',tr: 'Cevabı göster' },
  'study.done':        { en: 'Session complete!', de: 'Sitzung abgeschlossen!', fr: 'Session terminée!', es: '¡Sesión completada!', tr: 'Oturum tamamlandı!' },
  'study.cardsStudied': { en: 'cards studied', de: 'Karten gelernt', fr: 'cartes étudiées', es: 'tarjetas estudiadas', tr: 'kart çalışıldı' },

  // Settings
  'settings.language':  { en: 'Language',        de: 'Sprache',         fr: 'Langue',          es: 'Idioma',           tr: 'Dil'             },
  'settings.theme':     { en: 'Theme',            de: 'Design',          fr: 'Thème',            es: 'Tema',             tr: 'Tema'            },
  'settings.dark':      { en: 'Dark mode',        de: 'Dunkelmodus',     fr: 'Mode sombre',      es: 'Modo oscuro',      tr: 'Karanlık mod'    },
  'settings.profile':   { en: 'Profile',          de: 'Profil',          fr: 'Profil',           es: 'Perfil',           tr: 'Profil'          },
  'settings.displayName': { en: 'Display name',   de: 'Anzeigename',     fr: 'Nom d\'affichage', es: 'Nombre de usuario',tr: 'Görünen ad'      },
};

export function t(key: string, lang: Lang = 'en'): string {
  return T[key]?.[lang] ?? T[key]?.en ?? key;
}

export function getLang(): Lang {
  return (localStorage.getItem('uiLanguage') as Lang) || 'en';
}

export function setLang(lang: Lang): void {
  localStorage.setItem('uiLanguage', lang);
  window.dispatchEvent(new Event('langchange'));
}
