export interface DailyVocabItem {
  id: string;
  english: string;
  indonesian: string;
  icon: string;
  example: string;
  exampleIdn: string;
  thirdPerson: string;
}

export interface VerbRuleRow {
  base: string;
  thirdPerson: string;
  ruleGroup: 'add_s' | 'add_es' | 'change_ies';
  meaning: string;
}

export interface McqItem {
  id: number;
  prompt: string;
  options: { label: string; value: string }[];
  answer: string;
  explanationIdn: string;
}

export interface FillBlankItem {
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

export interface MistakeItem {
  id: number;
  wrongSentence: string;
  wrongWord: string;
  correctWord: string;
  correctSentence: string;
  explanationIdn: string;
}

export const LESSON_USES = [
  {
    number: '1',
    title: 'Kegiatan sehari-hari',
    subtitle: 'Daily activities',
    icon: '☀️',
    example: 'I wake up every morning.',
    exampleIdn: 'Saya bangun tidur setiap pagi.'
  },
  {
    number: '2',
    title: 'Kebiasaan',
    subtitle: 'Habits',
    icon: '⚽',
    example: 'He plays football on Sunday.',
    exampleIdn: 'Dia bermain sepak bola pada hari Minggu.'
  },
  {
    number: '3',
    title: 'Fakta sederhana',
    subtitle: 'General facts',
    icon: '🥛',
    example: 'She drinks milk every morning.',
    exampleIdn: 'Dia minum susu setiap pagi.'
  }
];

export const LESSON_INTRO_EXAMPLES = [
  { en: 'I wake up every morning.', idn: 'Saya bangun tidur setiap pagi.' },
  { en: 'I go to school every day.', idn: 'Saya pergi ke sekolah setiap hari.' },
  { en: 'She drinks milk every morning.', idn: 'Dia (pr) minum susu setiap pagi.' },
  { en: 'He plays football on Sunday.', idn: 'Dia (lk) bermain sepak bola pada hari Minggu.' }
];

export const DAILY_VOCABULARY: DailyVocabItem[] = [
  { id: 'wake_up', english: 'Wake up', indonesian: 'Bangun tidur', icon: '⏰', example: 'I wake up at six o’clock.', exampleIdn: 'Saya bangun jam enam.', thirdPerson: 'wakes up' },
  { id: 'take_a_bath', english: 'Take a bath', indonesian: 'Mandi', icon: '🛁', example: 'She takes a bath every morning.', exampleIdn: 'Dia mandi setiap pagi.', thirdPerson: 'takes a bath' },
  { id: 'eat', english: 'Eat', indonesian: 'Makan', icon: '🍚', example: 'They eat rice together.', exampleIdn: 'Mereka makan nasi bersama.', thirdPerson: 'eats' },
  { id: 'drink', english: 'Drink', indonesian: 'Minum', icon: '🥛', example: 'She drinks milk every morning.', exampleIdn: 'Dia minum susu setiap pagi.', thirdPerson: 'drinks' },
  { id: 'go_to_school', english: 'Go to school', indonesian: 'Pergi ke sekolah', icon: '🎒', example: 'I go to school every day.', exampleIdn: 'Saya pergi ke sekolah setiap hari.', thirdPerson: 'goes to school' },
  { id: 'study', english: 'Study', indonesian: 'Belajar', icon: '📖', example: 'We study English at school.', exampleIdn: 'Kami belajar bahasa Inggris di sekolah.', thirdPerson: 'studies' },
  { id: 'play', english: 'Play', indonesian: 'Bermain', icon: '⚽', example: 'He plays football on Sunday.', exampleIdn: 'Dia bermain sepak bola di hari Minggu.', thirdPerson: 'plays' },
  { id: 'read', english: 'Read', indonesian: 'Membaca', icon: '📚', example: 'You read a book every evening.', exampleIdn: 'Kamu membaca buku setiap sore.', thirdPerson: 'reads' },
  { id: 'write', english: 'Write', indonesian: 'Menulis', icon: '✏️', example: 'I write in my notebook.', exampleIdn: 'Saya menulis di buku catatan.', thirdPerson: 'writes' },
  { id: 'watch_tv', english: 'Watch TV', indonesian: 'Menonton TV', icon: '📺', example: 'He watches TV at night.', exampleIdn: 'Dia menonton TV di malam hari.', thirdPerson: 'watches TV' },
  { id: 'sleep', english: 'Sleep', indonesian: 'Tidur', icon: '😴', example: 'The cat sleeps on the chair.', exampleIdn: 'Kucing itu tidur di atas kursi.', thirdPerson: 'sleeps' },
  { id: 'help', english: 'Help', indonesian: 'Membantu', icon: '🤝', example: 'She helps her mother at home.', exampleIdn: 'Dia membantu ibunya di rumah.', thirdPerson: 'helps' }
];

export const SUBJECT_LAB_VERBS = [
  { base: 'play', third: 'plays', object: 'football', idn: 'bermain sepak bola', rule: 'Umum: + -s' },
  { base: 'read', third: 'reads', object: 'a book', idn: 'membaca buku', rule: 'Umum: + -s' },
  { base: 'eat', third: 'eats', object: 'rice', idn: 'makan nasi', rule: 'Umum: + -s' },
  { base: 'drink', third: 'drinks', object: 'milk', idn: 'minum susu', rule: 'Umum: + -s' },
  { base: 'study', third: 'studies', object: 'English', idn: 'belajar bahasa Inggris', rule: 'Konsonan + y → -ies' },
  { base: 'watch', third: 'watches', object: 'TV', idn: 'menonton TV', rule: 'Akhiran -ch → + -es' },
  { base: 'go', third: 'goes', object: 'to school', idn: 'pergi ke sekolah', rule: 'Akhiran -o → + -es' },
  { base: 'wash', third: 'washes', object: 'hands', idn: 'mencuci tangan', rule: 'Akhiran -sh → + -es' }
];

export const VERB_RULES_TABLE: VerbRuleRow[] = [
  { base: 'Play', thirdPerson: 'Plays', ruleGroup: 'add_s', meaning: 'Bermain' },
  { base: 'Eat', thirdPerson: 'Eats', ruleGroup: 'add_s', meaning: 'Makan' },
  { base: 'Drink', thirdPerson: 'Drinks', ruleGroup: 'add_s', meaning: 'Minum' },
  { base: 'Read', thirdPerson: 'Reads', ruleGroup: 'add_s', meaning: 'Membaca' },
  { base: 'Sleep', thirdPerson: 'Sleeps', ruleGroup: 'add_s', meaning: 'Tidur' },
  { base: 'Watch', thirdPerson: 'Watches', ruleGroup: 'add_es', meaning: 'Menonton' },
  { base: 'Go', thirdPerson: 'Goes', ruleGroup: 'add_es', meaning: 'Pergi' },
  { base: 'Wash', thirdPerson: 'Washes', ruleGroup: 'add_es', meaning: 'Mencuci' },
  { base: 'Study', thirdPerson: 'Studies', ruleGroup: 'change_ies', meaning: 'Belajar' },
  { base: 'Do', thirdPerson: 'Does', ruleGroup: 'add_es', meaning: 'Melakukan' }
];

export const SHORT_ANSWER_CARDS = [
  { q: 'Do you like milk?', a: 'Yes, I do.', type: 'positive', idn: 'Apakah kamu suka susu? → Ya.' },
  { q: 'Do you like coffee?', a: "No, I don't.", type: 'negative', idn: 'Apakah kamu suka kopi? → Tidak.' },
  { q: 'Does she like apples?', a: 'Yes, she does.', type: 'positive', idn: 'Apakah dia suka apel? → Ya.' },
  { q: 'Does he play football?', a: "No, he doesn't.", type: 'negative', idn: 'Apakah dia bermain bola? → Tidak.' }
];

export const MULTIPLE_CHOICE_QUESTIONS: McqItem[] = [
  {
    id: 1,
    prompt: 'I _____ football every Sunday.',
    options: [
      { label: 'A', value: 'plays' },
      { label: 'B', value: 'play' },
      { label: 'C', value: 'playing' },
      { label: 'D', value: 'played' }
    ],
    answer: 'play',
    explanationIdn: 'Subjek "I" memakai kata kerja bentuk dasar tanpa -s/-es (play).'
  },
  {
    id: 2,
    prompt: 'She _____ milk every morning.',
    options: [
      { label: 'A', value: 'drink' },
      { label: 'B', value: 'drinking' },
      { label: 'C', value: 'drinks' },
      { label: 'D', value: 'drank' }
    ],
    answer: 'drinks',
    explanationIdn: 'Subjek "She" (He/She/It) memerlukan tambahan -s pada kata kerja → drinks.'
  },
  {
    id: 3,
    prompt: 'They _____ English at school.',
    options: [
      { label: 'A', value: 'studies' },
      { label: 'B', value: 'study' },
      { label: 'C', value: 'studying' },
      { label: 'D', value: 'studied' }
    ],
    answer: 'study',
    explanationIdn: 'Subjek "They" (I/You/We/They) memakai bentuk dasar → study.'
  },
  {
    id: 4,
    prompt: 'My father _____ TV every night.',
    options: [
      { label: 'A', value: 'watch' },
      { label: 'B', value: 'watches' },
      { label: 'C', value: 'watching' },
      { label: 'D', value: 'watched' }
    ],
    answer: 'watches',
    explanationIdn: '"My father" = He. Kata kerja berakhiran -ch ditambah -es → watches.'
  },
  {
    id: 5,
    prompt: 'He _____ to school every day.',
    options: [
      { label: 'A', value: 'go' },
      { label: 'B', value: 'goes' },
      { label: 'C', value: 'going' },
      { label: 'D', value: 'gone' }
    ],
    answer: 'goes',
    explanationIdn: 'Subjek "He" + kata kerja berakhiran -o ditambah -es → goes.'
  },
  {
    id: 6,
    prompt: 'We _____ like coffee.',
    options: [
      { label: 'A', value: "doesn't" },
      { label: 'B', value: "don't" },
      { label: 'C', value: "isn't" },
      { label: 'D', value: "aren't" }
    ],
    answer: "don't",
    explanationIdn: 'Subjek "We" (I/You/We/They) memakai don\'t untuk kalimat negatif.'
  },
  {
    id: 7,
    prompt: 'She _____ eat fish.',
    options: [
      { label: 'A', value: "don't" },
      { label: 'B', value: "doesn't" },
      { label: 'C', value: "isn't" },
      { label: 'D', value: "aren't" }
    ],
    answer: "doesn't",
    explanationIdn: 'Subjek "She" (He/She/It) memakai doesn\'t untuk kalimat negatif.'
  },
  {
    id: 8,
    prompt: "My brother doesn't _____ football.",
    options: [
      { label: 'A', value: 'plays' },
      { label: 'B', value: 'playing' },
      { label: 'C', value: 'play' },
      { label: 'D', value: 'played' }
    ],
    answer: 'play',
    explanationIdn: 'Ingat! Setelah doesn\'t, kata kerja kembali ke bentuk dasar (play, bukan plays).'
  },
  {
    id: 9,
    prompt: '_____ you like chocolate?',
    options: [
      { label: 'A', value: 'Does' },
      { label: 'B', value: 'Do' },
      { label: 'C', value: 'Is' },
      { label: 'D', value: 'Are' }
    ],
    answer: 'Do',
    explanationIdn: 'Pertanyaan untuk subjek "you" diawali dengan "Do".'
  },
  {
    id: 10,
    prompt: '_____ she read books?',
    options: [
      { label: 'A', value: 'Do' },
      { label: 'B', value: 'Does' },
      { label: 'C', value: 'Is' },
      { label: 'D', value: 'Am' }
    ],
    answer: 'Does',
    explanationIdn: 'Pertanyaan untuk subjek "she" (He/She/It) diawali dengan "Does".'
  },
  {
    id: 11,
    prompt: 'Does he _____ English?',
    options: [
      { label: 'A', value: 'speaks' },
      { label: 'B', value: 'speaking' },
      { label: 'C', value: 'speak' },
      { label: 'D', value: 'spoke' }
    ],
    answer: 'speak',
    explanationIdn: 'Setelah "Does", kata kerja kembali ke bentuk dasar (speak, tanpa -s).'
  },
  {
    id: 12,
    prompt: 'My sister _____ her room every day.',
    options: [
      { label: 'A', value: 'clean' },
      { label: 'B', value: 'cleans' },
      { label: 'C', value: 'cleaning' },
      { label: 'D', value: 'cleaned' }
    ],
    answer: 'cleans',
    explanationIdn: '"My sister" = She, sehingga kata kerja ditambah -s → cleans.'
  }
];

export const FILL_IN_THE_BLANKS_QUESTIONS: FillBlankItem[] = [
  // Part 1: Add -s or -es when necessary
  {
    id: 1,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'I ',
    verbHint: 'play',
    after: ' football.',
    answer: 'play',
    choices: ['play', 'plays'],
    explanationIdn: 'Subjek "I" memakai bentuk dasar → play.'
  },
  {
    id: 2,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'She ',
    verbHint: 'play',
    after: ' badminton.',
    answer: 'plays',
    choices: ['play', 'plays'],
    explanationIdn: 'Subjek "She" ditambah -s → plays.'
  },
  {
    id: 3,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'He ',
    verbHint: 'eat',
    after: ' rice.',
    answer: 'eats',
    choices: ['eat', 'eats'],
    explanationIdn: 'Subjek "He" ditambah -s → eats.'
  },
  {
    id: 4,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'They ',
    verbHint: 'drink',
    after: ' water.',
    answer: 'drink',
    choices: ['drink', 'drinks'],
    explanationIdn: 'Subjek "They" memakai bentuk dasar → drink.'
  },
  {
    id: 5,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'My mother ',
    verbHint: 'cook',
    after: ' every day.',
    answer: 'cooks',
    choices: ['cook', 'cooks'],
    explanationIdn: '"My mother" = She → cooks.'
  },
  {
    id: 6,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'We ',
    verbHint: 'study',
    after: ' English.',
    answer: 'study',
    choices: ['study', 'studies'],
    explanationIdn: 'Subjek "We" memakai bentuk dasar → study.'
  },
  {
    id: 7,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'My brother ',
    verbHint: 'watch',
    after: ' TV.',
    answer: 'watches',
    choices: ['watch', 'watches'],
    explanationIdn: '"My brother" = He, dan akhiran -ch ditambah -es → watches.'
  },
  {
    id: 8,
    part: 1,
    partTitle: 'Part 1: Add -s or -es when necessary',
    before: 'The cat ',
    verbHint: 'sleep',
    after: ' on the chair.',
    answer: 'sleeps',
    choices: ['sleep', 'sleeps'],
    explanationIdn: '"The cat" = It → sleeps.'
  },
  // Part 2: Complete with don't or doesn't
  {
    id: 9,
    part: 2,
    partTitle: "Part 2: Complete with don't or doesn't",
    before: 'I ',
    after: ' like coffee.',
    answer: "don't",
    choices: ["don't", "doesn't"],
    explanationIdn: 'Subjek "I" memakai don\'t.'
  },
  {
    id: 10,
    part: 2,
    partTitle: "Part 2: Complete with don't or doesn't",
    before: 'She ',
    after: ' eat fish.',
    answer: "doesn't",
    choices: ["don't", "doesn't"],
    explanationIdn: 'Subjek "She" memakai doesn\'t.'
  },
  {
    id: 11,
    part: 2,
    partTitle: "Part 2: Complete with don't or doesn't",
    before: 'They ',
    after: ' play basketball.',
    answer: "don't",
    choices: ["don't", "doesn't"],
    explanationIdn: 'Subjek "They" memakai don\'t.'
  },
  {
    id: 12,
    part: 2,
    partTitle: "Part 2: Complete with don't or doesn't",
    before: 'He ',
    after: ' watch TV.',
    answer: "doesn't",
    choices: ["don't", "doesn't"],
    explanationIdn: 'Subjek "He" memakai doesn\'t.'
  },
  {
    id: 13,
    part: 2,
    partTitle: "Part 2: Complete with don't or doesn't",
    before: 'We ',
    after: ' go to school on Sunday.',
    answer: "don't",
    choices: ["don't", "doesn't"],
    explanationIdn: 'Subjek "We" memakai don\'t.'
  },
  // Part 3: Complete with Do or Does
  {
    id: 14,
    part: 3,
    partTitle: 'Part 3: Complete with Do or Does',
    before: '',
    after: ' you like apples?',
    answer: 'Do',
    choices: ['Do', 'Does'],
    explanationIdn: 'Pertanyaan dengan subjek "you" memakai Do.'
  },
  {
    id: 15,
    part: 3,
    partTitle: 'Part 3: Complete with Do or Does',
    before: '',
    after: ' she study English?',
    answer: 'Does',
    choices: ['Do', 'Does'],
    explanationIdn: 'Pertanyaan dengan subjek "she" memakai Does.'
  },
  {
    id: 16,
    part: 3,
    partTitle: 'Part 3: Complete with Do or Does',
    before: '',
    after: ' they play football?',
    answer: 'Do',
    choices: ['Do', 'Does'],
    explanationIdn: 'Pertanyaan dengan subjek "they" memakai Do.'
  },
  {
    id: 17,
    part: 3,
    partTitle: 'Part 3: Complete with Do or Does',
    before: '',
    after: ' he drink milk?',
    answer: 'Does',
    choices: ['Do', 'Does'],
    explanationIdn: 'Pertanyaan dengan subjek "he" memakai Does.'
  },
  {
    id: 18,
    part: 3,
    partTitle: 'Part 3: Complete with Do or Does',
    before: '',
    after: ' your mother cook every day?',
    answer: 'Does',
    choices: ['Do', 'Does'],
    explanationIdn: '"your mother" = she, jadi memakai Does.'
  }
];

export const CORRECT_MISTAKES_QUESTIONS: MistakeItem[] = [
  {
    id: 1,
    wrongSentence: 'He eat rice every day.',
    wrongWord: 'eat',
    correctWord: 'eats',
    correctSentence: 'He eats rice every day.',
    explanationIdn: 'Subjek "He" membutuhkan -s pada kata kerja: eat → eats.'
  },
  {
    id: 2,
    wrongSentence: 'They plays basketball.',
    wrongWord: 'plays',
    correctWord: 'play',
    correctSentence: 'They play basketball.',
    explanationIdn: 'Subjek "They" memakai kata kerja bentuk dasar tanpa -s: plays → play.'
  },
  {
    id: 3,
    wrongSentence: "She don't like coffee.",
    wrongWord: "don't",
    correctWord: "doesn't",
    correctSentence: "She doesn't like coffee.",
    explanationIdn: 'Untuk subjek "She", bentuk negatifnya adalah doesn\'t, bukan don\'t.'
  },
  {
    id: 4,
    wrongSentence: 'My father go to work.',
    wrongWord: 'go',
    correctWord: 'goes',
    correctSentence: 'My father goes to work.',
    explanationIdn: '"My father" = He, dan "go" berakhiran -o sehingga ditambah -es → goes.'
  },
  {
    id: 5,
    wrongSentence: 'Does she likes chocolate?',
    wrongWord: 'likes',
    correctWord: 'like',
    correctSentence: 'Does she like chocolate?',
    explanationIdn: 'Setelah "Does", kata kerja kembali ke bentuk dasar (tanpa -s): likes → like.'
  }
];

export const DAILY_SENTENCE_STARTERS = [
  'I wake up at six o\'clock.',
  'I eat breakfast every morning.',
  'I take a bath every morning.',
  'I go to school at seven o\'clock.',
  'I study English every day.',
  'I play football in the afternoon.',
  'I read a book before sleep.',
  'I watch TV with my family.',
  'I help my mother at home.',
  'I sleep at nine o\'clock.'
];

export const FAMILY_SENTENCE_STARTERS = [
  'My father works every day.',
  'My mother cooks delicious food.',
  'My brother plays football.',
  'My sister reads a book every night.',
  'My father drinks coffee every morning.',
  'My mother helps me study.'
];
