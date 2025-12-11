import { LetterMap } from './types';

export const DEFAULT_HEBREW_MAP: LetterMap = {
  'א': { char: 'א', name: 'Aleph', pictograph: 'Ox', meaning: 'Strength, Leader', img: 'images/aleph.png' },
  'ב': { char: 'ב', name: 'Bet', pictograph: 'House, Tent', meaning: 'Family, In', img: 'images/bet.png' },
  'ג': { char: 'ג', name: 'Gimel', pictograph: 'Camel, Foot', meaning: 'Walk, Gather', img: 'images/gimel.png' },
  'ד': { char: 'ד', name: 'Dalet', pictograph: 'Door, Path', meaning: 'Move, Hang', img: 'images/dalet.png' },
  'ה': { char: 'ה', name: 'Hei', pictograph: 'Window, Behold', meaning: 'Reveal, Breath', img: 'images/hei.png' },
  'ו': { char: 'ו', name: 'Vav', pictograph: 'Nail, Hook', meaning: 'Add, Secure', img: 'images/vav.png' },
  'ז': { char: 'ז', name: 'Zayin', pictograph: 'Weapon, Cut', meaning: 'Food, Cut', img: 'images/zayin.png' },
  'ח': { char: 'ח', name: 'Chet', pictograph: 'Fence, Wall', meaning: 'Separate, Protect', img: 'images/chet.png' },
  'ט': { char: 'ט', name: 'Tet', pictograph: 'Basket, Snake', meaning: 'Surround, Twist', img: 'images/tet.png' },
  'י': { char: 'י', name: 'Yod', pictograph: 'Hand, Arm', meaning: 'Work, Throw', img: 'images/yod.png' },
  'כ': { char: 'כ', name: 'Kaf', pictograph: 'Palm, Open', meaning: 'Bend, Allow', img: 'images/kaf.png' },
  'ל': { char: 'ל', name: 'Lamed', pictograph: 'Staff, Shepherd', meaning: 'Teach, Yoke', img: 'images/lamed.png' },
  'מ': { char: 'מ', name: 'Mem', pictograph: 'Water, Chaos', meaning: 'Massive, Unknown', img: 'images/mem.png' },
  'נ': { char: 'נ', name: 'Nun', pictograph: 'Seed, Life', meaning: 'Continue, Heir', img: 'images/nun.png' },
  'ס': { char: 'ס', name: 'Samekh', pictograph: 'Prop, Support', meaning: 'Turn, Slow', img: 'images/samekh.png' },
  'ע': { char: 'ע', name: 'Ayin', pictograph: 'Eye, See', meaning: 'Watch, Know', img: 'images/ayin.png' },
  'פ': { char: 'פ', name: 'Pe', pictograph: 'Mouth, Speak', meaning: 'Blow, Scatter', img: 'images/pe.png' },
  'צ': { char: 'צ', name: 'Tsade', pictograph: 'Fishhook, Hunt', meaning: 'Side, Trail', img: 'images/tsade.png' },
  'ק': { char: 'ק', name: 'Qof', pictograph: 'Sun, Horizon', meaning: 'Circle, Time', img: 'images/qof.png' },
  'ר': { char: 'ר', name: 'Resh', pictograph: 'Head, Person', meaning: 'First, Top', img: 'images/resh.png' },
  'ש': { char: 'ש', name: 'Shin', pictograph: 'Tooth, Consume', meaning: 'Sharp, Press', img: 'images/shin.png' },
  'ת': { char: 'ת', name: 'Tav', pictograph: 'Mark, Sign', meaning: 'Signal, Monument', img: 'images/tav.png' },
};

// Map final forms (Sofit) to their root letters
export const SOFIT_MAP: Record<string, string> = {
  'ך': 'כ',
  'ם': 'מ',
  'ן': 'נ',
  'ף': 'פ',
  'ץ': 'צ'
};

export const BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Samuel", "Kings", "Isaiah", "Jeremiah", "Ezekiel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah", "Nahum", "Habakkuk",
  "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Psalms", "Proverbs", "Job", "Song of Songs", "Ruth", "Lamentations", "Ecclesiastes",
  "Esther", "Daniel", "Ezra", "Nehemiah", "Chronicles"
];