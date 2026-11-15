export interface ToBeRow {
  subject: string;
  toBe: 'am' | 'is' | 'are';
  group: 'I' | 'He / She / It' | 'You / We / They';
  idn: string;
}

export interface IngVerbItem {
  id: string;
  base: string;
  ing: string;
  meaning: string;
  icon: string;
  rule: 'regular' | 'drop_e' | 'double_consonant';
  ruleNote: string;
  example: string;
  exampleIdn: string;
}

export interface ContinuousMcqItem {
  id: number;
  prompt: string;
  options: { label: string; value: string }[];
  answer: string;
  explanationIdn: string;
}

export interface ContinuousFillItem {
  id: number;
  part: 1 | 2 | 3;
  partTitle: string;
  before: string;
  verbHint?: string;
  after: string;
  answer: string;
  choices: string[];
  explanationIdn: string;
}

export const PC_INTRO_EXAMPLES = [
  { en: 'I am eating.', idn: 'Saya sedang makan.', icon: '🍽️' },
  { en: 'She is reading.', idn: 'Dia sedang membaca.', icon: '📖' },
  { en: 'They are playing.', idn: 'Mereka sedang bermain.', icon: '⚽' }
];

export const TO_BE_TABLE: ToBeRow[] = [
  { subject: 'I', toBe: 'am', group: 'I', idn: 'Saya' },
  { subject: 'He', toBe: 'is', group: 'He / She / It', idn: 'Dia (laki-laki)' },
  { subject: 'She', toBe: 'is', group: 'He / She / It', idn: 'Dia (perempuan)' },
  { subject: 'It', toBe: 'is', group: 'He / She / It', idn: 'Dia (hewan/benda)' },
  { subject: 'You', toBe: 'are', group: 'You / We / They', idn: 'Kamu' },
  { subject: 'We', toBe: 'are', group: 'You / We / They', idn: 'Kami / Kita' },
  { subject: 'They', toBe: 'are', group: 'You / We / They', idn: 'Mereka' }
];

export const TO_BE_EXAMPLES = [
  { en: 'I am happy.', idn: 'Saya senang.' },
  { en: 'She is beautiful.', idn: 'Dia cantik.' },
  { en: 'They are students.', idn: 'Mereka adalah siswa.' }
];

export const FORMULA_TABLE_EXAMPLES = [
  { subject: 'I', toBe: 'am', verbIng: 'eating', sentence: 'I am eating.' },
  { subject: 'He', toBe: 'is', verbIng: 'sleeping', sentence: 'He is sleeping.' },
  { subject: 'She', toBe: 'is', verbIng: 'reading', sentence: 'She is reading.' },
  { subject: 'They', toBe: 'are', verbIng: 'playing', sentence: 'They are playing.' }
];

export const ING_VERBS: IngVerbItem[] = [
  {
    id: 'eat',
    base: 'Eat',
    ing: 'Eating',
    meaning: 'Makan',
    icon: '🍚',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'I am eating rice.',
    exampleIdn: 'Saya sedang makan nasi.'
  },
  {
    id: 'play',
    base: 'Play',
    ing: 'Playing',
    meaning: 'Bermain',
    icon: '⚽',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'They are playing football.',
    exampleIdn: 'Mereka sedang bermain sepak bola.'
  },
  {
    id: 'read',
    base: 'Read',
    ing: 'Reading',
    meaning: 'Membaca',
    icon: '📚',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'She is reading a book.',
    exampleIdn: 'Dia sedang membaca buku.'
  },
  {
    id: 'sleep',
    base: 'Sleep',
    ing: 'Sleeping',
    meaning: 'Tidur',
    icon: '😴',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'The baby is sleeping.',
    exampleIdn: 'Bayi itu sedang tidur.'
  },
  {
    id: 'walk',
    base: 'Walk',
    ing: 'Walking',
    meaning: 'Berjalan',
    icon: '🚶',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'He is walking to school.',
    exampleIdn: 'Dia sedang berjalan ke sekolah.'
  },
  {
    id: 'watch',
    base: 'Watch',
    ing: 'Watching',
    meaning: 'Menonton',
    icon: '📺',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'He is watching TV now.',
    exampleIdn: 'Dia sedang menonton TV sekarang.'
  },
  {
    id: 'drink',
    base: 'Drink',
    ing: 'Drinking',
    meaning: 'Minum',
    icon: '🥤',
    rule: 'regular',
    ruleNote: 'Langsung ditambah -ing',
    example: 'My mother is drinking tea.',
    exampleIdn: 'Ibu saya sedang minum teh.'
  },
  {
    id: 'write',
    base: 'Write',
    ing: 'Writing',
    meaning: 'Menulis',
    icon: '✍️',
    rule: 'drop_e',
    ruleNote: 'Huruf e dihilangkan + -ing',
    example: 'We are writing a story.',
    exampleIdn: 'Kami sedang menulis cerita.'
  },
  {
    id: 'run',
    base: 'Run',
    ing: 'Running',
    meaning: 'Berlari',
    icon: '🏃',
    rule: 'double_consonant',
    ruleNote: 'Huruf n digandakan + -ing',
    example: 'He is running in the park.',
    exampleIdn: 'Dia sedang berlari di taman.'
  },
  {
    id: 'swim',
    base: 'Swim',
    ing: 'Swimming',
    meaning: 'Berenang',
    icon: '🏊',
    rule: 'double_consonant',
    ruleNote: 'Huruf m digandakan + -ing',
    example: 'They are swimming right now.',
    exampleIdn: 'Mereka sedang berenang sekarang.'
  }
];

export const TENSE_COMPARISON_PAIRS = [
  {
    simplePresent: 'I eat rice.',
    presentContinuous: 'I am eating rice.',
    idnPresent: 'Saya makan nasi (rutinitas).',
    idnContinuous: 'Saya sedang makan nasi (sekarang).'
  },
  {
    simplePresent: 'She plays football.',
    presentContinuous: 'She is playing football.',
    idnPresent: 'Dia bermain sepak bola (kebiasaan).',
    idnContinuous: 'Dia sedang bermain sepak bola (sekarang).'
  },
  {
    simplePresent: 'They read books.',
    presentContinuous: 'They are reading books.',
    idnPresent: 'Mereka membaca buku (kebiasaan).',
    idnContinuous: 'Mereka sedang membaca buku (sekarang).'
  },
  {
    simplePresent: 'I go to school every day.',
    presentContinuous: 'I am studying English now.',
    idnPresent: 'Saya pergi ke sekolah setiap hari.',
    idnContinuous: 'Saya sedang belajar bahasa Inggris sekarang.'
  }
];

export const NEGATIVE_EXAMPLES = [
  { full: 'I am not sleeping.', short: "I'm not sleeping.", idn: 'Saya tidak sedang tidur.' },
  { full: 'She is not eating.', short: "She isn't eating.", idn: 'Dia tidak sedang makan.' },
  { full: 'They are not playing.', short: "They aren't playing.", idn: 'Mereka tidak sedang bermain.' }
];

export const PC_MULTIPLE_CHOICE: ContinuousMcqItem[] = [
  {
    id: 1,
    prompt: 'I ___ eating an apple.',
    options: [
      { label: 'A', value: 'am' },
      { label: 'B', value: 'is' },
      { label: 'C', value: 'are' },
      { label: 'D', value: 'be' }
    ],
    answer: 'am',
    explanationIdn: 'Subjek "I" selalu berpasangan dengan to be "am".'
  },
  {
    id: 2,
    prompt: 'She ___ reading a book.',
    options: [
      { label: 'A', value: 'am' },
      { label: 'B', value: 'is' },
      { label: 'C', value: 'are' },
      { label: 'D', value: 'be' }
    ],
    answer: 'is',
    explanationIdn: 'Subjek "She" (He/She/It) memakai to be "is".'
  },
  {
    id: 3,
    prompt: 'They ___ playing football.',
    options: [
      { label: 'A', value: 'am' },
      { label: 'B', value: 'is' },
      { label: 'C', value: 'are' },
      { label: 'D', value: 'be' }
    ],
    answer: 'are',
    explanationIdn: 'Subjek "They" (You/We/They) memakai to be "are".'
  },
  {
    id: 4,
    prompt: 'He is ___ TV now.',
    options: [
      { label: 'A', value: 'watch' },
      { label: 'B', value: 'watches' },
      { label: 'C', value: 'watching' },
      { label: 'D', value: 'watched' }
    ],
    answer: 'watching',
    explanationIdn: 'Setelah to be "is" + kata "now", gunakan Verb-ing → watching.'
  },
  {
    id: 5,
    prompt: 'We are ___ English.',
    options: [
      { label: 'A', value: 'study' },
      { label: 'B', value: 'studies' },
      { label: 'C', value: 'studying' },
      { label: 'D', value: 'studied' }
    ],
    answer: 'studying',
    explanationIdn: 'Setelah to be "are", kata kerja menggunakan bentuk -ing → studying.'
  },
  {
    id: 6,
    prompt: 'My mother ___ cooking now.',
    options: [
      { label: 'A', value: 'am' },
      { label: 'B', value: 'is' },
      { label: 'C', value: 'are' },
      { label: 'D', value: 'be' }
    ],
    answer: 'is',
    explanationIdn: '"My mother" sama dengan "She" (tunggal), sehingga memakai to be "is".'
  },
  {
    id: 7,
    prompt: 'The cat is ___.',
    options: [
      { label: 'A', value: 'sleep' },
      { label: 'B', value: 'sleeps' },
      { label: 'C', value: 'sleeping' },
      { label: 'D', value: 'slept' }
    ],
    answer: 'sleeping',
    explanationIdn: 'Setelah "is", kata kerja harus berbentuk -ing → sleeping.'
  },
  {
    id: 8,
    prompt: 'I ___ running now.',
    options: [
      { label: 'A', value: 'am' },
      { label: 'B', value: 'is' },
      { label: 'C', value: 'are' },
      { label: 'D', value: 'be' }
    ],
    answer: 'am',
    explanationIdn: 'Subjek "I" memakai to be "am".'
  },
  {
    id: 9,
    prompt: 'Which sentence describes an activity happening now?',
    options: [
      { label: 'A', value: 'I go to school every day.' },
      { label: 'B', value: 'She likes apples.' },
      { label: 'C', value: 'They are dancing now.' },
      { label: 'D', value: 'He plays football every Sunday.' }
    ],
    answer: 'They are dancing now.',
    explanationIdn: 'Kalimat "They are dancing now." memakai pola are + Verb-ing dan keterangan "now".'
  },
  {
    id: 10,
    prompt: 'Choose the correct sentence.',
    options: [
      { label: 'A', value: 'She are eating.' },
      { label: 'B', value: 'She am eating.' },
      { label: 'C', value: 'She is eating.' },
      { label: 'D', value: 'She eating.' }
    ],
    answer: 'She is eating.',
    explanationIdn: 'Rumus benar: Subject (She) + to be (is) + Verb-ing (eating).'
  },
  {
    id: 11,
    prompt: 'The negative form of "He is sleeping" is ...',
    options: [
      { label: 'A', value: 'He not is sleeping.' },
      { label: 'B', value: 'He is not sleeping.' },
      { label: 'C', value: 'He are not sleeping.' },
      { label: 'D', value: 'He does not sleeping.' }
    ],
    answer: 'He is not sleeping.',
    explanationIdn: 'Dalam kalimat negatif Present Continuous, tambahkan "not" setelah to be → He is not sleeping.'
  },
  {
    id: 12,
    prompt: 'The correct -ing form of "write" is ...',
    options: [
      { label: 'A', value: 'Writeing' },
      { label: 'B', value: 'Writting' },
      { label: 'C', value: 'Writing' },
      { label: 'D', value: 'Writes' }
    ],
    answer: 'Writing',
    explanationIdn: 'Untuk kata "write", huruf "e" di akhir dihilangkan sebelum menambah -ing → Writing.'
  }
];

export const PC_FILL_BLANKS: ContinuousFillItem[] = [
  // Part 1: Choose am, is, or are
  { id: 1, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'I ', after: ' eating.', answer: 'am', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "I" memakai am.' },
  { id: 2, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'She ', after: ' singing.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "She" memakai is.' },
  { id: 3, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'They ', after: ' playing.', answer: 'are', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "They" memakai are.' },
  { id: 4, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'He ', after: ' sleeping.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "He" memakai is.' },
  { id: 5, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'We ', after: ' studying.', answer: 'are', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "We" memakai are.' },
  { id: 6, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'You ', after: ' reading.', answer: 'are', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "You" memakai are.' },
  { id: 7, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'The dog ', after: ' running.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: '"The dog" = It → memakai is.' },
  { id: 8, part: 1, partTitle: 'Part 1: Choose am, is, or are', before: 'My father ', after: ' working.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: '"My father" = He → memakai is.' },

  // Part 2: Change the verbs into -ing form
  { id: 9, part: 2, partTitle: 'Part 2: Change the verbs into -ing form', before: 'I am ', verbHint: 'eat', after: ' rice.', answer: 'eating', choices: ['eating', 'eatting'], explanationIdn: 'eat + -ing → eating.' },
  { id: 10, part: 2, partTitle: 'Part 2: Change the verbs into -ing form', before: 'She is ', verbHint: 'read', after: ' a book.', answer: 'reading', choices: ['reading', 'readding'], explanationIdn: 'read + -ing → reading.' },
  { id: 11, part: 2, partTitle: 'Part 2: Change the verbs into -ing form', before: 'They are ', verbHint: 'play', after: ' football.', answer: 'playing', choices: ['playing', 'plaing'], explanationIdn: 'play + -ing → playing.' },
  { id: 12, part: 2, partTitle: 'Part 2: Change the verbs into -ing form', before: 'He is ', verbHint: 'run', after: ' in the park.', answer: 'running', choices: ['running', 'runing'], explanationIdn: 'Huruf n digandakan: run → running.' },
  { id: 13, part: 2, partTitle: 'Part 2: Change the verbs into -ing form', before: 'We are ', verbHint: 'write', after: ' a story.', answer: 'writing', choices: ['writing', 'writeing'], explanationIdn: 'Huruf e dihilangkan: write → writing.' },
  { id: 14, part: 2, partTitle: 'Part 2: Change the verbs into -ing form', before: 'The baby is ', verbHint: 'sleep', after: '.', answer: 'sleeping', choices: ['sleeping', 'sleepping'], explanationIdn: 'sleep + -ing → sleeping.' },

  // Part 3: Complete the sentences
  { id: 15, part: 3, partTitle: 'Part 3: Complete the sentences', before: 'I ', after: ' not watching TV.', answer: 'am', choices: ['am', 'is', 'are'], explanationIdn: 'Kalimat negatif dengan subjek "I": I am not watching TV.' },
  { id: 16, part: 3, partTitle: 'Part 3: Complete the sentences', before: 'She ', after: ' not cooking.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: 'Kalimat negatif dengan subjek "She": She is not cooking.' },
  { id: 17, part: 3, partTitle: 'Part 3: Complete the sentences', before: 'They ', after: ' not sleeping.', answer: 'are', choices: ['am', 'is', 'are'], explanationIdn: 'Kalimat negatif dengan subjek "They": They are not sleeping.' },
  { id: 18, part: 3, partTitle: 'Part 3: Complete the sentences', before: 'He ', after: ' playing basketball now.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "He" memakai is.' },
  { id: 19, part: 3, partTitle: 'Part 3: Complete the sentences', before: 'We ', after: ' learning English.', answer: 'are', choices: ['am', 'is', 'are'], explanationIdn: 'Subjek "We" memakai are.' },
  { id: 20, part: 3, partTitle: 'Part 3: Complete the sentences', before: 'My mother ', after: ' drinking tea.', answer: 'is', choices: ['am', 'is', 'are'], explanationIdn: '"My mother" = She → memakai is.' }
];

export const PC_OWN_STARTERS = [
  'I am studying English.',
  'I am eating an apple now.',
  'She is reading a book right now.',
  'They are playing football.',
  'He is watching TV now.',
  'We are learning English together.',
  'My cat is sleeping on the sofa.'
];

export const PC_FRIENDS_STARTERS = [
  'My friend is writing.',
  'My teacher is talking.',
  'My friends are sitting.',
  'My friend is reading a book.',
  'My friends are playing in the yard.',
  'My teacher is smiling.'
];
