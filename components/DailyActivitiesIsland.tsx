import React, { useState, useEffect, useMemo } from 'react';
import { JournalEntry } from '../types';
import { safeSetItem } from '../services/storageService';
import {
  LESSON_USES,
  LESSON_INTRO_EXAMPLES,
  DAILY_VOCABULARY,
  SUBJECT_LAB_VERBS,
  VERB_RULES_TABLE,
  SHORT_ANSWER_CARDS,
  MULTIPLE_CHOICE_QUESTIONS,
  FILL_IN_THE_BLANKS_QUESTIONS,
  CORRECT_MISTAKES_QUESTIONS,
  DAILY_SENTENCE_STARTERS,
  FAMILY_SENTENCE_STARTERS
} from './DailyActivitiesData';

interface DailyActivitiesIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onWordLearned: (word: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onUnlockBadge?: (badgeId: string) => void;
  onMasteryUpdate?: (percent: number) => void;
}

type LessonTab = 'lesson' | 'lab' | 'mcq' | 'blanks' | 'mistakes' | 'write';
type SubjectKey = 'I' | 'You' | 'We' | 'They' | 'He' | 'She' | 'It';

const SUBJECTS: { key: SubjectKey; isThirdSingular: boolean; idn: string }[] = [
  { key: 'I', isThirdSingular: false, idn: 'Saya' },
  { key: 'You', isThirdSingular: false, idn: 'Kamu' },
  { key: 'We', isThirdSingular: false, idn: 'Kami/Kita' },
  { key: 'They', isThirdSingular: false, idn: 'Mereka' },
  { key: 'He', isThirdSingular: true, idn: 'Dia (lk)' },
  { key: 'She', isThirdSingular: true, idn: 'Dia (pr)' },
  { key: 'It', isThirdSingular: true, idn: 'Dia (benda/hewan)' }
];

const PDF_PATH = '/assets/aistudio/ENGLISH_FOR_KID4_21564899.pdf';

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '');

const checkSentenceFeedback = (sentence: string, isFamilySection: boolean): { ok: boolean; hint: string } => {
  const trimmed = sentence.trim();
  if (!trimmed) return { ok: false, hint: 'Tulis kalimatmu terlebih dahulu.' };
  const words = trimmed.split(/\s+/);
  if (words.length < 3) {
    return { ok: false, hint: 'Kalimat sebaiknya terdiri dari minimal 3 kata (Subject + Verb + Object/Time).' };
  }

  const lower = trimmed.toLowerCase();
  const thirdPersonStart = /^(he|she|it|my father|my mother|my brother|my sister|my cat|my dog|father|mother)\b/i;
  if (thirdPersonStart.test(lower)) {
    const commonBaseVerbs = [
      'wake', 'take', 'eat', 'drink', 'go', 'study', 'play', 'read', 'write',
      'watch', 'sleep', 'help', 'work', 'cook', 'clean', 'like', 'love'
    ];
    const secondOrThirdWord = (lower.startsWith('my ') ? words[2] : words[1])?.replace(/[.,!?]/g, '') || '';
    if (commonBaseVerbs.includes(secondOrThirdWord)) {
      return {
        ok: false,
        hint: `Perhatikan kata kerja "${secondOrThirdWord}"! Untuk subjek He/She/My father/My mother, tambahkan -s/-es (misal: ${secondOrThirdWord === 'go' ? 'goes' : secondOrThirdWord === 'watch' ? 'watches' : secondOrThirdWord === 'study' ? 'studies' : secondOrThirdWord + 's'}).`
      };
    }
  }

  if (isFamilySection && !/(father|mother|brother|sister|dad|mom|parent|family|uncle|aunt|grandma|grandpa|cat|he|she)/i.test(lower)) {
    return {
      ok: true,
      hint: 'Kalimat sudah bagus! Boleh juga pakai subjek anggota keluarga seperti My father, My mother, atau My brother.'
    };
  }

  if (!/^[A-Z]/.test(trimmed)) {
    return { ok: true, hint: 'Bagus! Jangan lupa awali kalimat dengan huruf besar ya.' };
  }

  return { ok: true, hint: 'Hebat! Struktur kalimat Simple Present kamu sudah tepat.' };
};

export const DailyActivitiesIsland: React.FC<DailyActivitiesIslandProps> = ({
  onBack,
  addPoints,
  onWordLearned,
  onSave,
  onUnlockBadge,
  onMasteryUpdate
}) => {
  const [activeTab, setActiveTab] = useState<LessonTab>('lesson');
  const [speechSlow, setSpeechSlow] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Stage 1: Learned vocabulary
  const [learnedVocabIds, setLearnedVocabIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('daily_act_learned_vocab');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Stage 2: Interactive Subject-Verb Lab & Rule filter
  const [labSubject, setLabSubject] = useState<SubjectKey>('She');
  const [labVerbIdx, setLabVerbIdx] = useState<number>(0);
  const [ruleFilter, setRuleFilter] = useState<'all' | 'add_s' | 'add_es' | 'change_ies'>('all');
  const [revealedShortAnswers, setRevealedShortAnswers] = useState<number[]>([]);

  // Stage 3: Multiple Choice (12 items)
  const [mcqIdx, setMcqIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('daily_act_mcq');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [mcqChecked, setMcqChecked] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('daily_act_mcq_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Stage 4: Fill in the Blanks (18 items)
  const [blankPartFilter, setBlankPartFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('daily_act_blanks');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [blankChecked, setBlankChecked] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('daily_act_blanks_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Stage 5: Correct the Mistakes (5 items)
  const [mistakeInputs, setMistakeInputs] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('daily_act_mistakes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [mistakeChecked, setMistakeChecked] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('daily_act_mistakes_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [selectedWrongWord, setSelectedWrongWord] = useState<Record<number, string>>({});

  // Stage 6: Make Your Own Sentences (5) & Bonus Challenge (3)
  const [ownSentences, setOwnSentences] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('daily_act_own_sentences');
      return saved ? JSON.parse(saved) : ['', '', '', '', ''];
    } catch {
      return ['', '', '', '', ''];
    }
  });
  const [familySentences, setFamilySentences] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('daily_act_family_sentences');
      return saved ? JSON.parse(saved) : ['', '', ''];
    } catch {
      return ['', '', ''];
    }
  });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Track awarded milestone keys to prevent duplicate point farming
  const [awardedMilestones, setAwardedMilestones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('daily_act_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist states safely
  useEffect(() => {
    safeSetItem('daily_act_learned_vocab', JSON.stringify(learnedVocabIds));
  }, [learnedVocabIds]);

  useEffect(() => {
    safeSetItem('daily_act_mcq', JSON.stringify(mcqAnswers));
    safeSetItem('daily_act_mcq_checked', JSON.stringify(mcqChecked));
  }, [mcqAnswers, mcqChecked]);

  useEffect(() => {
    safeSetItem('daily_act_blanks', JSON.stringify(blankAnswers));
    safeSetItem('daily_act_blanks_checked', JSON.stringify(blankChecked));
  }, [blankAnswers, blankChecked]);

  useEffect(() => {
    safeSetItem('daily_act_mistakes', JSON.stringify(mistakeInputs));
    safeSetItem('daily_act_mistakes_checked', JSON.stringify(mistakeChecked));
  }, [mistakeInputs, mistakeChecked]);

  useEffect(() => {
    safeSetItem('daily_act_own_sentences', JSON.stringify(ownSentences));
  }, [ownSentences]);

  useEffect(() => {
    safeSetItem('daily_act_family_sentences', JSON.stringify(familySentences));
  }, [familySentences]);

  useEffect(() => {
    safeSetItem('daily_act_rewards', JSON.stringify(awardedMilestones));
  }, [awardedMilestones]);

  const grantOnce = (milestoneKey: string, pointsAmount: number, reason: string) => {
    if (awardedMilestones.includes(milestoneKey)) return;
    setAwardedMilestones(prev => [...prev, milestoneKey]);
    addPoints(pointsAmount, reason);
  };

  // Speech synthesis helper
  const speakText = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = speechSlow ? 0.72 : 0.95;
    utterance.pitch = 1.05;
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang.startsWith('en-US')) || voices.find(v => v.lang.startsWith('en'));
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  };

  // Computed mastery metrics
  const mcqCorrectCount = useMemo(
    () => MULTIPLE_CHOICE_QUESTIONS.filter(q => mcqChecked[q.id] && mcqAnswers[q.id] === q.answer).length,
    [mcqAnswers, mcqChecked]
  );

  const blanksCorrectCount = useMemo(
    () =>
      FILL_IN_THE_BLANKS_QUESTIONS.filter(
        q => blankChecked[q.id] && normalizeText(blankAnswers[q.id] || '') === normalizeText(q.answer)
      ).length,
    [blankAnswers, blankChecked]
  );

  const mistakesCorrectCount = useMemo(
    () =>
      CORRECT_MISTAKES_QUESTIONS.filter(
        q => mistakeChecked[q.id] && normalizeText(mistakeInputs[q.id] || '') === normalizeText(q.correctSentence)
      ).length,
    [mistakeInputs, mistakeChecked]
  );

  const ownFilledCount = ownSentences.filter(s => s.trim().length > 4).length;
  const familyFilledCount = familySentences.filter(s => s.trim().length > 4).length;

  const totalUnits = DAILY_VOCABULARY.length + MULTIPLE_CHOICE_QUESTIONS.length + FILL_IN_THE_BLANKS_QUESTIONS.length + CORRECT_MISTAKES_QUESTIONS.length + 8;
  const completedUnits = learnedVocabIds.length + mcqCorrectCount + blanksCorrectCount + mistakesCorrectCount + ownFilledCount + familyFilledCount;
  const overallPercent = Math.min(100, Math.round((completedUnits / totalUnits) * 100));

  const lastReportedPercentRef = React.useRef<number>(-1);
  const badgeUnlockedRef = React.useRef<boolean>(false);

  useEffect(() => {
    if (onMasteryUpdate && overallPercent !== lastReportedPercentRef.current) {
      lastReportedPercentRef.current = overallPercent;
      onMasteryUpdate(overallPercent);
    }
    if (overallPercent >= 80 && onUnlockBadge && !badgeUnlockedRef.current) {
      badgeUnlockedRef.current = true;
      onUnlockBadge('daily_routine_star');
    }
  }, [overallPercent, onMasteryUpdate, onUnlockBadge]);

  // Handlers
  const handleMarkVocabLearned = (item: typeof DAILY_VOCABULARY[0]) => {
    speakText(`${item.english}. ${item.example}`);
    if (!learnedVocabIds.includes(item.id)) {
      setLearnedVocabIds(prev => [...prev, item.id]);
      onWordLearned(item.english);
      addPoints(10, `Learned "${item.english}"!`);
    }
  };

  const handleMcqSelect = (questionId: number, value: string) => {
    setMcqAnswers(prev => ({ ...prev, [questionId]: value }));
    setMcqChecked(prev => ({ ...prev, [questionId]: true }));
    const item = MULTIPLE_CHOICE_QUESTIONS.find(q => q.id === questionId);
    if (item && value === item.answer) {
      speakText(item.prompt.replace('_____', value));
      grantOnce(`mcq_${questionId}`, 15, `Benar Soal #${questionId}!`);
    }
  };

  const handleBlankCheck = (id: number) => {
    const item = FILL_IN_THE_BLANKS_QUESTIONS.find(q => q.id === id);
    if (!item) return;
    setBlankChecked(prev => ({ ...prev, [id]: true }));
    const userVal = normalizeText(blankAnswers[id] || '');
    if (userVal === normalizeText(item.answer)) {
      const fullSentence = `${item.before}${item.answer}${item.after}`;
      speakText(fullSentence);
      grantOnce(`blank_${id}`, 15, `Isian #${id} Tepat!`);
    }
  };

  const handleCheckAllBlanks = () => {
    const nextChecked: Record<number, boolean> = { ...blankChecked };
    let newCorrect = 0;
    FILL_IN_THE_BLANKS_QUESTIONS.forEach(q => {
      if ((blankAnswers[q.id] || '').trim()) {
        nextChecked[q.id] = true;
        if (normalizeText(blankAnswers[q.id] || '') === normalizeText(q.answer)) {
          if (!awardedMilestones.includes(`blank_${q.id}`)) {
            newCorrect += 1;
          }
        }
      }
    });
    setBlankChecked(nextChecked);
    if (newCorrect > 0) {
      const newlyEarnedKeys = FILL_IN_THE_BLANKS_QUESTIONS
        .filter(q => normalizeText(blankAnswers[q.id] || '') === normalizeText(q.answer) && !awardedMilestones.includes(`blank_${q.id}`))
        .map(q => `blank_${q.id}`);
      setAwardedMilestones(prev => [...prev, ...newlyEarnedKeys]);
      addPoints(newCorrect * 15, `${newCorrect} Isian Baru Benar!`);
    }
  };

  const handleCheckMistake = (id: number) => {
    const item = CORRECT_MISTAKES_QUESTIONS.find(q => q.id === id);
    if (!item) return;
    setMistakeChecked(prev => ({ ...prev, [id]: true }));
    if (normalizeText(mistakeInputs[id] || '') === normalizeText(item.correctSentence)) {
      speakText(item.correctSentence);
      grantOnce(`mistake_${id}`, 25, `Berhasil Memperbaiki Kalimat #${id}!`);
    }
  };

  const handleSaveToScrapbook = () => {
    const filledOwn = ownSentences.map(s => s.trim()).filter(Boolean);
    const filledFam = familySentences.map(s => s.trim()).filter(Boolean);
    if (filledOwn.length === 0 && filledFam.length === 0) {
      setSavedNotice('Tulis minimal 1 kalimat terlebih dahulu sebelum menyimpan.');
      setTimeout(() => setSavedNotice(null), 3000);
      return;
    }

    grantOnce('write_daily_complete', 50, 'Menulis Kalimat Daily Activities!');
    if (filledFam.length >= 3) {
      grantOnce('write_bonus_complete', 50, 'Menyelesaikan Bonus Challenge Keluarga!');
    }

    if (onSave) {
      const lines = [...filledOwn.slice(0, 5), ...filledFam.slice(0, 3)];
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <rect width="800" height="800" fill="#EFF6FF"/>
          <rect x="40" y="40" width="720" height="720" rx="36" fill="#FFFFFF" stroke="#3B82F6" stroke-width="6"/>
          <text x="400" y="110" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="bold" fill="#1D4ED8">My Daily Activities</text>
          <text x="400" y="150" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#64748B">Simple Present Tense Journal</text>
          ${lines
            .map(
              (line, idx) =>
                `<text x="80" y="${230 + idx * 62}" font-family="sans-serif" font-size="24" font-weight="600" fill="#1E293B">${idx + 1}. ${line
                  .replace(/&/g, '&amp;')
                  .replace(/</g, '&lt;')
                  .replace(/>/g, '&gt;')
                  .slice(0, 48)}</text>`
            )
            .join('')}
        </svg>
      `;
      const dataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
      onSave({
        type: 'story',
        english: filledOwn[0] || filledFam[0],
        indonesian: `${lines.length} kalimat Simple Present tentang kegiatanku`,
        data: dataUrl
      });
    }

    setSavedNotice('Hebat! Kalimatmu tersimpan dan masuk ke Scrapbook.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  const activeSubjectInfo = SUBJECTS.find(s => s.key === labSubject) || SUBJECTS[0];
  const activeVerb = SUBJECT_LAB_VERBS[labVerbIdx];
  const conjugatedLabVerb = activeSubjectInfo.isThirdSingular ? activeVerb.third : activeVerb.base;
  const liveLabSentence = `${activeSubjectInfo.key} ${conjugatedLabVerb} ${activeVerb.object}.`;

  const currentMcq = MULTIPLE_CHOICE_QUESTIONS[mcqIdx];
  const currentMcqSelected = mcqAnswers[currentMcq.id];
  const currentMcqChecked = mcqChecked[currentMcq.id];

  const filteredBlanks =
    blankPartFilter === 'all'
      ? FILL_IN_THE_BLANKS_QUESTIONS
      : FILL_IN_THE_BLANKS_QUESTIONS.filter(q => q.part === blankPartFilter);

  const filteredVerbRules =
    ruleFilter === 'all'
      ? VERB_RULES_TABLE
      : VERB_RULES_TABLE.filter(v => v.ruleGroup === ruleFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Clean Top Sub-Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              ⬅️ Kembali
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-tight">
                Simple Present Tense: Daily Activities
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                English for Kids · Materi A–J & Latihan Interaktif
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setSpeechSlow(!speechSlow)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                speechSlow
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
              title="Ubah kecepatan suara bahasa Inggris"
            >
              {speechSlow ? '🐢 Suara: Pelan' : '🔊 Suara: Normal'}
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              📄 Lihat PDF Asli
            </button>
          </div>
        </div>

        {/* Segmented Lesson Navigation */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'lesson' as LessonTab, label: 'A–B · Materi & Kosakata', count: `${learnedVocabIds.length}/12` },
            { id: 'lab' as LessonTab, label: 'C–F · Lab Kata Kerja', count: 'Interaktif' },
            { id: 'mcq' as LessonTab, label: 'G · Pilihan Ganda', count: `${mcqCorrectCount}/12` },
            { id: 'blanks' as LessonTab, label: 'H · Isian Singkat', count: `${blanksCorrectCount}/18` },
            { id: 'mistakes' as LessonTab, label: 'I · Perbaiki Kalimat', count: `${mistakesCorrectCount}/5` },
            { id: 'write' as LessonTab, label: 'J · Buat Kalimat', count: `${ownFilledCount + familyFilledCount}/8` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] tabular-nums font-bold ${
                  activeTab === tab.id ? 'text-sky-100' : 'text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Progress Summary Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kemajuan Belajar Lesson 4
            </div>
            <div className="text-lg font-bold text-slate-900 mt-0.5 tabular-nums">
              {completedUnits} dari {totalUnits} aktivitas selesai ({overallPercent}%)
            </div>
          </div>
          <div className="w-full sm:w-72 h-3 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${overallPercent}%` }}
            />
          </div>
        </div>

        {/* TAB 1: SECTION A & B */}
        {activeTab === 'lesson' && (
          <div className="space-y-10">
            {/* Section A */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian A · Pengenalan
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  What Is Simple Present Tense?
                </h2>
                <p className="text-slate-600 mt-1">
                  Simple Present Tense digunakan untuk menceritakan tiga hal utama dalam bahasa Inggris:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {LESSON_USES.map(use => (
                  <div
                    key={use.number}
                    className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="text-3xl mb-3">{use.icon}</div>
                      <h3 className="text-lg font-bold text-slate-900">
                        {use.number}. {use.title}
                      </h3>
                      <p className="text-sm text-slate-500 font-medium">{use.subtitle}</p>
                    </div>
                    <button
                      onClick={() => speakText(use.example)}
                      className="w-full text-left bg-white hover:bg-sky-50 border border-slate-200 rounded-xl p-3 transition-colors cursor-pointer"
                    >
                      <div className="text-sm font-bold text-sky-700 flex items-center justify-between">
                        <span>{use.example}</span>
                        <span>🔊</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{use.exampleIdn}</div>
                    </button>
                  </div>
                ))}
              </div>

              {/* Examples Box */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Contoh Kalimat (Klik untuk Mendengar Pengucapan):
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {LESSON_INTRO_EXAMPLES.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => speakText(ex.en)}
                      className="flex items-center justify-between gap-3 bg-sky-50/70 hover:bg-sky-100 border border-sky-200 rounded-2xl p-4 text-left transition-colors cursor-pointer"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{ex.en}</div>
                        <div className="text-xs text-slate-600 mt-0.5">{ex.idn}</div>
                      </div>
                      <span className="text-xl shrink-0">🔊</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Section B: Vocabulary */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                    Bagian B · Kosakata Aktivitas Sehari-hari
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Daily Activities Vocabulary (12 Kata Kerja)
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Pelajari dan dengarkan 12 kosakata berikut, lalu tandai kata yang sudah kamu kuasai!
                  </p>
                </div>
                <div className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl tabular-nums shrink-0">
                  Dikuasai: {learnedVocabIds.length} / {DAILY_VOCABULARY.length}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DAILY_VOCABULARY.map(item => {
                  const isLearned = learnedVocabIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors ${
                        isLearned ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <span className="text-3xl">{item.icon}</span>
                          <button
                            onClick={() => speakText(`${item.english}. ${item.example}`)}
                            className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 text-sky-700 text-xs font-bold transition-colors cursor-pointer"
                          >
                            🔊 Dengar
                          </button>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900">{item.english}</h3>
                        <p className="text-sm font-bold text-sky-700">{item.indonesian}</p>
                        <p className="text-xs text-slate-500 mt-2">
                          He/She/It: <span className="font-bold text-slate-700">{item.thirdPerson}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200/80 italic">
                          "{item.example}"
                        </p>
                      </div>

                      <button
                        onClick={() => handleMarkVocabLearned(item)}
                        className={`mt-4 w-full py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer ${
                          isLearned
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isLearned ? '✓ Sudah Dipelajari (+10 ⭐)' : 'Pelajari & Dengarkan (+10 ⭐)'}
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('lab')}
                  className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Lanjut ke Lab Kata Kerja (Bagian C–F) ➡️
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: SECTION C, D, E, F */}
        {activeTab === 'lab' && (
          <div className="space-y-8">
            {/* Section C: Interactive Subject + Verb Sandbox */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian C · Perbandingan Subjek
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  I, You, We, They vs He, She, It
                </h2>
                <p className="text-slate-600 mt-1">
                  Pilih subjek dan kata kerja di bawah ini untuk melihat kapan kata kerja ditambah <strong>-s</strong> atau <strong>-es</strong>!
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                {/* Left: Controls */}
                <div className="lg:col-span-7 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-5">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      1. Pilih Subject (Pelaku)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUBJECTS.map(sub => (
                        <button
                          key={sub.key}
                          onClick={() => {
                            setLabSubject(sub.key);
                            const v = SUBJECT_LAB_VERBS[labVerbIdx];
                            speakText(`${sub.key} ${sub.isThirdSingular ? v.third : v.base} ${v.object}`);
                          }}
                          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                            labSubject === sub.key
                              ? sub.isThirdSingular
                                ? 'bg-amber-600 text-white'
                                : 'bg-sky-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {sub.key} <span className="opacity-75 font-medium text-xs">({sub.idn})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      2. Pilih Kata Kerja (Action)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SUBJECT_LAB_VERBS.map((v, idx) => (
                        <button
                          key={v.base}
                          onClick={() => {
                            setLabVerbIdx(idx);
                            speakText(`${labSubject} ${activeSubjectInfo.isThirdSingular ? v.third : v.base} ${v.object}`);
                          }}
                          className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer text-left ${
                            labVerbIdx === idx
                              ? 'bg-slate-900 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div>{v.base}</div>
                          <div className="text-[11px] opacity-70 font-normal">{v.idn}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Live Sentence Stage */}
                <div className="lg:col-span-5 bg-sky-950 text-white rounded-2xl p-6 flex flex-col justify-between gap-5">
                  <div>
                    <div className="text-xs font-bold text-sky-300 uppercase tracking-wider">
                      Hasil Kalimat Langsung
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold mt-4 leading-snug">
                      <span>{activeSubjectInfo.key} </span>
                      <span className={activeSubjectInfo.isThirdSingular ? 'text-amber-300 underline decoration-2 underline-offset-4' : 'text-emerald-300 underline decoration-2 underline-offset-4'}>
                        {conjugatedLabVerb}
                      </span>
                      <span> {activeVerb.object}.</span>
                    </div>
                    <p className="text-sm text-sky-200 mt-3">
                      {activeSubjectInfo.isThirdSingular
                        ? `Subjek "${activeSubjectInfo.key}" termasuk He/She/It, jadi kata kerja berubah: ${activeVerb.base} → ${activeVerb.third} (${activeVerb.rule}).`
                        : `Subjek "${activeSubjectInfo.key}" memakai kata kerja bentuk dasar tanpa tambahan -s/-es: ${activeVerb.base}.`}
                    </p>
                  </div>

                  <button
                    onClick={() => speakText(liveLabSentence)}
                    className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-sm transition-colors cursor-pointer"
                  >
                    🔊 Dengarkan Kalimat Ini
                  </button>
                </div>
              </div>

              {/* Remember Table from PDF */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5">
                  <h3 className="font-bold text-sky-900 mb-2">1. I, You, We, They → Bentuk Dasar</h3>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li>• I <strong>play</strong> football.</li>
                    <li>• You <strong>read</strong> a book.</li>
                    <li>• We <strong>study</strong> English.</li>
                    <li>• They <strong>eat</strong> rice.</li>
                  </ul>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                  <h3 className="font-bold text-amber-900 mb-2">2. He, She, It → Tambah -s atau -es</h3>
                  <ul className="space-y-1.5 text-sm text-slate-700">
                    <li>• He <strong>plays</strong> football.</li>
                    <li>• She <strong>reads</strong> a book.</li>
                    <li>• It <strong>eats</strong> fish.</li>
                    <li>• He <strong>watches</strong> TV.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Section D: When Do We Add -s or -es? */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                    Bagian D · Aturan Perubahan Kata Kerja
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    When Do We Add -s or -es?
                  </h2>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { key: 'all' as const, label: 'Semua' },
                    { key: 'add_s' as const, label: 'Tambah -s' },
                    { key: 'add_es' as const, label: 'Akhiran -ch/-sh/-o (+ -es)' },
                    { key: 'change_ies' as const, label: 'Konsonan + y (-ies)' }
                  ].map(f => (
                    <button
                      key={f.key}
                      onClick={() => setRuleFilter(f.key)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                        ruleFilter === f.key
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4 font-bold">Verb Dasar</th>
                        <th className="py-3 px-4 font-bold">He / She / It</th>
                        <th className="py-3 px-4 font-bold">Arti</th>
                        <th className="py-3 px-4 font-bold text-right">Audio</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredVerbRules.map(row => (
                        <tr key={row.base} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-bold text-slate-800">{row.base}</td>
                          <td className="py-3 px-4 font-bold text-sky-700">{row.thirdPerson}</td>
                          <td className="py-3 px-4 text-slate-600">{row.meaning}</td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => speakText(`${row.base}, ${row.thirdPerson}`)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-sky-100 text-sky-700 text-xs font-bold cursor-pointer"
                            >
                              🔊
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:col-span-5 space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
                    <h3 className="font-bold text-slate-900">Tips Mudah Mengingat:</h3>
                    <p className="text-sm text-slate-700">
                      • <strong>Kebanyakan kata kerja</strong>: tambah <strong>-s</strong> (play → plays).
                    </p>
                    <p className="text-sm text-slate-700">
                      • <strong>Akhiran -ch, -sh, -s, -x, atau -o</strong>: tambah <strong>-es</strong> (watch → watches, go → goes, wash → washes).
                    </p>
                    <p className="text-sm text-slate-700">
                      • <strong>Akhiran konsonan + y</strong>: ubah <strong>y</strong> menjadi <strong>-ies</strong> (study → studies).
                    </p>
                  </div>
                  <div className="bg-sky-50 border border-sky-200 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-bold text-sky-700 uppercase">Examples:</div>
                    {['She studies English.', 'He watches TV.', 'My mother goes to work.'].map(ex => (
                      <button
                        key={ex}
                        onClick={() => speakText(ex)}
                        className="w-full flex items-center justify-between text-left bg-white hover:bg-sky-100/70 px-3 py-2 rounded-xl border border-sky-200 text-sm font-bold text-slate-800 cursor-pointer"
                      >
                        <span>{ex}</span>
                        <span>🔊</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section E & F: Negative & Questions */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section E */}
              <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                    Bagian E · Kalimat Negatif
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">
                    Negative Sentences: Don't and Doesn't
                  </h2>
                </div>

                <div className="space-y-3">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="font-bold text-sky-700 text-sm mb-2">I / You / We / They → DON'T</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• I don't play football.</li>
                      <li>• They don't drink coffee.</li>
                      <li>• We don't watch TV.</li>
                    </ul>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="font-bold text-amber-700 text-sm mb-2">He / She / It → DOESN'T</div>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• He doesn't play football.</li>
                      <li>• She doesn't drink coffee.</li>
                      <li>• My cat doesn't eat rice.</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2">
                  <div className="text-xs font-bold text-rose-700 uppercase">
                    IMPORTANT! Setelah doesn't, kata kerja kembali ke bentuk dasar:
                  </div>
                  <div className="text-sm font-bold text-rose-700">
                    ❌ She doesn't likes apples. (Salah)
                  </div>
                  <button
                    onClick={() => speakText("She doesn't like apples.")}
                    className="text-sm font-bold text-emerald-700 flex items-center gap-2 hover:underline cursor-pointer"
                  >
                    <span>✅ She doesn't like apples. (Benar)</span>
                    <span>🔊</span>
                  </button>
                </div>
              </section>

              {/* Section F */}
              <section className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
                <div>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                    Bagian F · Kalimat Tanya
                  </p>
                  <h2 className="text-xl font-bold text-slate-900">
                    Questions: Do and Does + Short Answers
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="font-bold text-sky-700 mb-1">DO + I / YOU / WE / THEY</div>
                    <div>• Do you like apples?</div>
                    <div>• Do they play football?</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="font-bold text-amber-700 mb-1">DOES + HE / SHE / IT</div>
                    <div>• Does he like apples?</div>
                    <div>• Does she play football?</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                    Klik Pertanyaan untuk Membuka Jawaban Singkat:
                  </div>
                  <div className="space-y-2">
                    {SHORT_ANSWER_CARDS.map((card, idx) => {
                      const open = revealedShortAnswers.includes(idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => {
                            if (!open) setRevealedShortAnswers(prev => [...prev, idx]);
                            speakText(`${card.q} ${card.a}`);
                          }}
                          className="w-full text-left bg-slate-50 hover:bg-indigo-50 border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{card.q}</div>
                            <div className="text-xs text-slate-500">{card.idn}</div>
                          </div>
                          <div className="shrink-0">
                            {open ? (
                              <span
                                className={`text-sm font-bold px-3 py-1 rounded-lg ${
                                  card.type === 'positive'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {card.a} 🔊
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-indigo-600">Lihat Jawaban</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <p className="text-xs font-bold text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  Remember: Setelah <strong>does</strong>, gunakan kata kerja dasar!
                </p>
              </section>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveTab('mcq')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Mulai Latihan G: Multiple Choice (12 Soal) ➡️
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SECTION G — MULTIPLE CHOICE (12 QUESTIONS) */}
        {activeTab === 'mcq' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian G · Multiple Choice
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Choose the correct answer! (12 Soal)
                </h2>
              </div>
              <div className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl tabular-nums">
                Benar: {mcqCorrectCount} / {MULTIPLE_CHOICE_QUESTIONS.length}
              </div>
            </div>

            {/* Question number selector */}
            <div className="flex flex-wrap gap-2">
              {MULTIPLE_CHOICE_QUESTIONS.map((q, idx) => {
                const isChecked = mcqChecked[q.id];
                const isCorrect = isChecked && mcqAnswers[q.id] === q.answer;
                return (
                  <button
                    key={q.id}
                    onClick={() => setMcqIdx(idx)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm tabular-nums transition-colors cursor-pointer border ${
                      mcqIdx === idx
                        ? 'bg-sky-600 text-white border-sky-600'
                        : isChecked
                        ? isCorrect
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {q.id}
                  </button>
                );
              })}
            </div>

            {/* Active Question Card */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2 tabular-nums">
                    Soal Nomor {currentMcq.id} dari {MULTIPLE_CHOICE_QUESTIONS.length}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {currentMcqChecked && currentMcqSelected === currentMcq.answer
                      ? currentMcq.prompt.replace('_____', currentMcq.answer)
                      : currentMcq.prompt}
                  </h3>
                </div>
                <button
                  onClick={() =>
                    speakText(
                      currentMcqChecked && currentMcqSelected === currentMcq.answer
                        ? currentMcq.prompt.replace('_____', currentMcq.answer)
                        : currentMcq.prompt.replace('_____', 'blank')
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-sky-50 text-sky-700 text-xs font-bold shrink-0 cursor-pointer"
                >
                  🔊 Baca
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMcq.options.map(opt => {
                  const selected = currentMcqSelected === opt.value;
                  const isCorrectOption = opt.value === currentMcq.answer;
                  let styleClass = 'bg-white border-slate-200 text-slate-800 hover:border-sky-400 hover:bg-sky-50';
                  if (currentMcqChecked) {
                    if (isCorrectOption) {
                      styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                    } else if (selected && !isCorrectOption) {
                      styleClass = 'bg-rose-50 border-rose-500 text-rose-900';
                    }
                  } else if (selected) {
                    styleClass = 'bg-sky-50 border-sky-500 text-sky-900';
                  }

                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleMcqSelect(currentMcq.id, opt.value)}
                      className={`p-4 rounded-xl border-2 text-left font-bold text-lg flex items-center justify-between transition-colors cursor-pointer ${styleClass}`}
                    >
                      <span>
                        <span className="inline-block w-7 text-slate-400 font-bold">{opt.label}.</span>
                        {opt.value}
                      </span>
                      {currentMcqChecked && isCorrectOption && <span className="text-sm">✓ Benar</span>}
                      {currentMcqChecked && selected && !isCorrectOption && <span className="text-sm">✕ Salah</span>}
                    </button>
                  );
                })}
              </div>

              {currentMcqChecked && (
                <div
                  className={`rounded-xl p-4 border text-sm font-medium ${
                    currentMcqSelected === currentMcq.answer
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      : 'bg-amber-50 border-amber-200 text-amber-900'
                  }`}
                >
                  <div className="font-bold mb-1">
                    {currentMcqSelected === currentMcq.answer
                      ? '✓ Jawaban Tepat!'
                      : `✕ Jawaban yang tepat adalah "${currentMcq.answer}".`}
                  </div>
                  <div>{currentMcq.explanationIdn}</div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setMcqIdx(i => Math.max(0, i - 1))}
                  disabled={mcqIdx === 0}
                  className="px-5 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm disabled:opacity-40 cursor-pointer"
                >
                  ⬅️ Sebelumnya
                </button>
                {mcqIdx < MULTIPLE_CHOICE_QUESTIONS.length - 1 ? (
                  <button
                    onClick={() => setMcqIdx(i => i + 1)}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Soal Berikutnya ➡️
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('blanks')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Lanjut ke Bagian H (Isian Singkat) ➡️
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: SECTION H — FILL IN THE BLANKS (18 QUESTIONS) */}
        {activeTab === 'blanks' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian H · Fill in the Blanks
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Complete the sentences with the correct form! (18 Soal)
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl tabular-nums">
                  Benar: {blanksCorrectCount} / 18
                </span>
                <button
                  onClick={handleCheckAllBlanks}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  Periksa Semua
                </button>
              </div>
            </div>

            {/* Part Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'Semua Bagian (1–18)' },
                { key: 1 as const, label: 'Part 1: -s / -es (1–8)' },
                { key: 2 as const, label: "Part 2: don't / doesn't (9–13)" },
                { key: 3 as const, label: 'Part 3: Do / Does (14–18)' }
              ].map(p => (
                <button
                  key={String(p.key)}
                  onClick={() => setBlankPartFilter(p.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    blankPartFilter === p.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {filteredBlanks.map((item, idx) => {
                const prevPart = idx > 0 ? filteredBlanks[idx - 1].part : null;
                const showPartHeader = item.part !== prevPart;
                const val = blankAnswers[item.id] || '';
                const isChecked = blankChecked[item.id];
                const isCorrect = isChecked && normalizeText(val) === normalizeText(item.answer);

                return (
                  <React.Fragment key={item.id}>
                    {showPartHeader && (
                      <div className="pt-2">
                        <h3 className="text-base font-bold text-sky-800">{item.partTitle}</h3>
                      </div>
                    )}
                    <div
                      className={`rounded-2xl border p-4 sm:p-5 transition-colors ${
                        isChecked
                          ? isCorrect
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-rose-50/60 border-rose-300'
                          : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex flex-wrap items-center gap-2 text-base sm:text-lg font-bold text-slate-800">
                          <span className="text-slate-400 tabular-nums w-7">{item.id}.</span>
                          {item.before && <span>{item.before}</span>}
                          <input
                            type="text"
                            value={val}
                            onChange={e => {
                              setBlankAnswers(prev => ({ ...prev, [item.id]: e.target.value }));
                              if (blankChecked[item.id]) {
                                setBlankChecked(prev => ({ ...prev, [item.id]: false }));
                              }
                            }}
                            placeholder={item.verbHint ? `(${item.verbHint})` : '...'}
                            aria-label={`Soal isian nomor ${item.id}`}
                            className="w-32 px-3 py-1.5 rounded-xl border-2 border-slate-300 focus:border-sky-500 bg-white text-center font-bold text-sky-700 outline-none"
                          />
                          {item.verbHint && (
                            <span className="text-xs font-medium text-slate-500">({item.verbHint})</span>
                          )}
                          <span>{item.after}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {/* Quick choice chips for easy mobile/kid selection */}
                          {item.choices.map(ch => (
                            <button
                              key={ch}
                              onClick={() => {
                                setBlankAnswers(prev => ({ ...prev, [item.id]: ch }));
                                setBlankChecked(prev => ({ ...prev, [item.id]: false }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                normalizeText(val) === normalizeText(ch)
                                  ? 'bg-sky-600 text-white border-sky-600'
                                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {ch}
                            </button>
                          ))}
                          <button
                            onClick={() => handleBlankCheck(item.id)}
                            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
                          >
                            Cek
                          </button>
                          <button
                            onClick={() => speakText(`${item.before}${item.answer}${item.after}`)}
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-sky-50 text-sky-700 text-xs font-bold cursor-pointer"
                            title="Dengarkan kalimat"
                          >
                            🔊
                          </button>
                        </div>
                      </div>

                      {isChecked && (
                        <div className={`mt-3 text-xs font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                          <strong>{isCorrect ? '✓ Benar!' : `✕ Jawaban tepat: "${item.answer}".`}</strong>{' '}
                          {item.explanationIdn}
                        </div>
                      )}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('mistakes')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Lanjut ke Bagian I (Correct the Mistakes) ➡️
              </button>
            </div>
          </section>
        )}

        {/* TAB 5: SECTION I — CORRECT THE MISTAKES (5 QUESTIONS) */}
        {activeTab === 'mistakes' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                  Bagian I · Correct the Mistakes
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Find and correct the mistakes! (5 Soal)
                </h2>
                <p className="text-slate-600 mt-1">
                  Ketuk kata yang salah pada kalimat, lalu tulis ulang kalimat yang benar!
                </p>
              </div>
              <div className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl tabular-nums shrink-0">
                Diperbaiki: {mistakesCorrectCount} / 5
              </div>
            </div>

            {/* PDF Example Card */}
            <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm">
                <span className="font-bold text-sky-800">Contoh dari Modul: </span>
                <span className="line-through text-rose-600 font-medium">She play football.</span>
                <span className="mx-2 font-bold text-slate-500">→</span>
                <span className="font-bold text-emerald-700">She plays football.</span>
              </div>
              <button
                onClick={() => speakText('She plays football.')}
                className="px-3 py-1.5 rounded-lg bg-white border border-sky-200 text-sky-700 text-xs font-bold cursor-pointer"
              >
                🔊 Dengar Contoh
              </button>
            </div>

            <div className="space-y-4">
              {CORRECT_MISTAKES_QUESTIONS.map(item => {
                const words = item.wrongSentence.split(' ');
                const pickedWord = selectedWrongWord[item.id];
                const isChecked = mistakeChecked[item.id];
                const userSentence = mistakeInputs[item.id] || '';
                const isCorrect = isChecked && normalizeText(userSentence) === normalizeText(item.correctSentence);

                return (
                  <div
                    key={item.id}
                    className={`rounded-2xl border p-5 space-y-4 transition-colors ${
                      isChecked
                        ? isCorrect
                          ? 'bg-emerald-50/50 border-emerald-300'
                          : 'bg-rose-50/50 border-rose-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                        Soal #{item.id} · Langkah 1: Klik kata yang salah pada kalimat ini:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {words.map((w, wIdx) => {
                          const cleanW = w.replace(/[?.!]/g, '');
                          const isTarget = cleanW.toLowerCase() === item.wrongWord.toLowerCase();
                          const isPicked = pickedWord === `${wIdx}_${w}`;
                          return (
                            <button
                              key={wIdx}
                              onClick={() => {
                                setSelectedWrongWord(prev => ({ ...prev, [item.id]: `${wIdx}_${w}` }));
                                if (isTarget && !mistakeInputs[item.id]) {
                                  setMistakeInputs(prev => ({ ...prev, [item.id]: item.wrongSentence }));
                                }
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-base border transition-colors cursor-pointer ${
                                isPicked
                                  ? isTarget
                                    ? 'bg-amber-100 border-amber-500 text-amber-900'
                                    : 'bg-rose-100 border-rose-400 text-rose-800'
                                  : 'bg-white border-slate-200 text-slate-800 hover:bg-slate-100'
                              }`}
                            >
                              {w}
                            </button>
                          );
                        })}
                      </div>
                      {pickedWord && (
                        <p className="text-xs font-bold mt-2 text-slate-600">
                          {pickedWord.split('_')[1].replace(/[?.!]/g, '').toLowerCase() === item.wrongWord.toLowerCase()
                            ? `✓ Betul! Kata "${item.wrongWord}" perlu diperbaiki menjadi "${item.correctWord}".`
                            : `Coba cek kata lain yang berhubungan dengan Subject & Verb!`}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        value={userSentence}
                        onChange={e => {
                          setMistakeInputs(prev => ({ ...prev, [item.id]: e.target.value }));
                          if (mistakeChecked[item.id]) {
                            setMistakeChecked(prev => ({ ...prev, [item.id]: false }));
                          }
                        }}
                        placeholder={`Ketik kalimat yang benar (contoh: ${item.wrongSentence})`}
                        aria-label={`Perbaikan kalimat nomor ${item.id}`}
                        className="flex-1 px-4 py-3 rounded-xl border-2 border-slate-300 focus:border-sky-500 bg-white font-bold text-slate-800 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCheckMistake(item.id)}
                          className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm cursor-pointer whitespace-nowrap"
                        >
                          Periksa
                        </button>
                        <button
                          onClick={() => speakText(item.correctSentence)}
                          className="px-3.5 py-3 rounded-xl bg-white border border-slate-200 hover:bg-sky-50 text-sky-700 font-bold text-sm cursor-pointer"
                          title="Dengarkan kalimat yang benar"
                        >
                          🔊
                        </button>
                      </div>
                    </div>

                    {isChecked && (
                      <div className={`text-xs font-medium ${isCorrect ? 'text-emerald-800' : 'text-rose-800'}`}>
                        <strong>
                          {isCorrect
                            ? '✓ Sempurna! Kalimatmu sudah benar.'
                            : `✕ Perbaikan yang tepat: "${item.correctSentence}"`}
                        </strong>{' '}
                        {item.explanationIdn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveTab('write')}
                className="px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Lanjut ke Bagian J & Bonus Challenge ➡️
              </button>
            </div>
          </section>
        )}

        {/* TAB 6: SECTION J — MAKE YOUR OWN SENTENCES & BONUS CHALLENGE */}
        {activeTab === 'write' && (
          <div className="space-y-8">
            {/* Part J */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Bagian J · Make Your Own Sentences
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Write five sentences about your daily activities!
                </h2>
                <p className="text-slate-600 mt-1">
                  Contoh dari modul: <strong>1. I wake up at six o'clock.</strong> ·{' '}
                  <strong>2. I eat breakfast every morning.</strong>
                </p>
              </div>

              {/* Starter Inspiration Chips */}
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Butuh ide? Klik contoh kalimat untuk mengisi slot kosong berikutnya:
                </div>
                <div className="flex flex-wrap gap-2">
                  {DAILY_SENTENCE_STARTERS.map((starter, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        const emptyIdx = ownSentences.findIndex(s => !s.trim());
                        const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
                        const next = [...ownSentences];
                        next[targetIdx] = starter;
                        setOwnSentences(next);
                        speakText(starter);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold cursor-pointer transition-colors"
                    >
                      + {starter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {ownSentences.map((sentence, idx) => {
                  const fb = sentence.trim() ? checkSentenceFeedback(sentence, false) : null;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-sky-600 text-white font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sentence}
                          onChange={e => {
                            const next = [...ownSentences];
                            next[idx] = e.target.value;
                            setOwnSentences(next);
                          }}
                          placeholder={
                            idx === 0
                              ? "Contoh: I wake up at six o'clock."
                              : idx === 1
                              ? 'Contoh: I eat breakfast every morning.'
                              : 'Tulis aktivitas harianmu dalam bahasa Inggris...'
                          }
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-sky-500 bg-white font-semibold text-slate-800 outline-none"
                        />
                        <button
                          onClick={() => sentence.trim() && speakText(sentence)}
                          disabled={!sentence.trim()}
                          className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-sky-50 text-sky-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
                        >
                          🔊
                        </button>
                      </div>
                      {fb && (
                        <p className={`text-xs font-medium pl-11 ${fb.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {fb.ok ? '✓ ' : '💡 '}
                          {fb.hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Bonus Challenge */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
                  Bonus Challenge
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Write three sentences about your family!
                </h2>
                <p className="text-slate-600 mt-1">
                  Ingat! Untuk <strong>My father / My mother / My brother / My sister</strong>, kata kerja ditambah <strong>-s</strong> atau <strong>-es</strong>.
                </p>
                <div className="mt-3 text-xs text-slate-500 space-y-1">
                  <div>• My father works every day.</div>
                  <div>• My mother cooks delicious food.</div>
                  <div>• My brother plays football.</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {FAMILY_SENTENCE_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const emptyIdx = familySentences.findIndex(s => !s.trim());
                      const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
                      const next = [...familySentences];
                      next[targetIdx] = starter;
                      setFamilySentences(next);
                      speakText(starter);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold cursor-pointer transition-colors"
                  >
                    + {starter}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {familySentences.map((sentence, idx) => {
                  const fb = sentence.trim() ? checkSentenceFeedback(sentence, true) : null;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-amber-500 text-white font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={sentence}
                          onChange={e => {
                            const next = [...familySentences];
                            next[idx] = e.target.value;
                            setFamilySentences(next);
                          }}
                          placeholder="Contoh: My mother cooks delicious food."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 bg-white font-semibold text-slate-800 outline-none"
                        />
                        <button
                          onClick={() => sentence.trim() && speakText(sentence)}
                          disabled={!sentence.trim()}
                          className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-amber-50 text-amber-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
                        >
                          🔊
                        </button>
                      </div>
                      {fb && (
                        <p className={`text-xs font-medium pl-11 ${fb.ok ? 'text-emerald-700' : 'text-amber-700'}`}>
                          {fb.ok ? '✓ ' : '💡 '}
                          {fb.hint}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    const all = [...ownSentences, ...familySentences].map(s => s.trim()).filter(Boolean);
                    if (all.length > 0) speakText(all.join(' '));
                  }}
                  className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-sm cursor-pointer"
                >
                  🔊 Bacakan Semua Kalimatku
                </button>
                <button
                  onClick={handleSaveToScrapbook}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm cursor-pointer"
                >
                  💾 Simpan & Klaim Bintang (+50 ⭐)
                </button>
              </div>

              {savedNotice && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 text-sm font-bold">
                  {savedNotice}
                </div>
              )}
            </section>
          </div>
        )}
      </div>

      {/* PDF Reference Modal */}
      {showPdfModal && (
        <div
          className="fixed inset-0 z-[180] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowPdfModal(false)}
        >
          <div
            className="bg-white w-full max-w-4xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-slate-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base">Modul PDF: Simple Present Tense – Daily Activities</h3>
                <p className="text-xs text-slate-300">Dokumen referensi asli (5 halaman)</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={PDF_PATH}
                  download="ENGLISH_FOR_KIDS_Simple_Present_Tense.pdf"
                  className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold"
                >
                  ⬇️ Unduh PDF
                </a>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100">
              <iframe
                src={PDF_PATH}
                title="English for Kids Simple Present Tense PDF"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyActivitiesIsland;
