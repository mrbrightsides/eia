import React, { useState, useEffect, useMemo, useRef } from 'react';
import { JournalEntry } from '../types';
import { safeSetItem } from '../services/storageService';
import {
  PC_INTRO_EXAMPLES,
  TO_BE_TABLE,
  TO_BE_EXAMPLES,
  FORMULA_TABLE_EXAMPLES,
  ING_VERBS,
  TENSE_COMPARISON_PAIRS,
  NEGATIVE_EXAMPLES,
  PC_MULTIPLE_CHOICE,
  PC_FILL_BLANKS,
  PC_OWN_STARTERS,
  PC_FRIENDS_STARTERS
} from './PresentContinuousData';

interface PresentContinuousIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
  onWordLearned: (word: string) => void;
  onSave?: (entry: Omit<JournalEntry, 'id' | 'date'>) => void;
  onUnlockBadge?: (badgeId: string) => void;
  onMasteryUpdate?: (percent: number) => void;
}

type ContinuousTab = 'intro' | 'verbs' | 'compare' | 'mcq' | 'blanks' | 'write';
type SubjectKey = 'I' | 'He' | 'She' | 'It' | 'You' | 'We' | 'They';

const SUBJECT_TO_BE: Record<SubjectKey, 'am' | 'is' | 'are'> = {
  I: 'am',
  He: 'is',
  She: 'is',
  It: 'is',
  You: 'are',
  We: 'are',
  They: 'are'
};

const PDF_PATH = '/assets/aistudio/ENGLISH_FOR_KID5_7ad3015d.pdf';

const normalizeText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?]+$/, '');

const checkContinuousSentence = (sentence: string): { ok: boolean; hint: string } => {
  const trimmed = sentence.trim();
  if (!trimmed) return { ok: false, hint: 'Tulis kalimatmu terlebih dahulu.' };
  const words = trimmed.split(/\s+/);
  if (words.length < 3) {
    return {
      ok: false,
      hint: 'Kalimat sebaiknya memiliki minimal 3 kata: Subject + am/is/are + Verb-ing.'
    };
  }

  const hasToBe = /\b(am|is|are|'m|'s|'re|isn't|aren't)\b/i.test(trimmed);
  const hasIng = /\b[a-z]+ing\b/i.test(trimmed);

  if (!hasToBe) {
    return {
      ok: false,
      hint: 'Jangan lupa kata bantu to be (am, is, atau are) sebelum kata kerja -ing!'
    };
  }

  if (!hasIng) {
    return {
      ok: false,
      hint: 'Tambahkan akhiran -ing pada kata kerjanya (contoh: studying, eating, writing).'
    };
  }

  if (/\b(i)\s+(is|are)\b/i.test(trimmed)) {
    return { ok: false, hint: 'Untuk subjek "I", gunakan "am" (contoh: I am ...).' };
  }
  if (/\b(he|she|it|my friend|my teacher|my mother|my father)\s+(am|are)\b/i.test(trimmed)) {
    return { ok: false, hint: 'Untuk subjek tunggal (He/She/It/My friend), gunakan "is".' };
  }
  if (/\b(you|we|they|my friends)\s+(am|is)\b/i.test(trimmed)) {
    return { ok: false, hint: 'Untuk subjek jamak (You/We/They/My friends), gunakan "are".' };
  }

  return { ok: true, hint: 'Hebat! Rumus Subject + To Be + Verb-ing sudah tepat.' };
};

export const PresentContinuousIsland: React.FC<PresentContinuousIslandProps> = ({
  onBack,
  addPoints,
  onWordLearned,
  onSave,
  onUnlockBadge,
  onMasteryUpdate
}) => {
  const [activeTab, setActiveTab] = useState<ContinuousTab>('intro');
  const [speechSlow, setSpeechSlow] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

  // Interactive Sandbox (B & C & F)
  const [labSubject, setLabSubject] = useState<SubjectKey>('I');
  const [labVerbIdx, setLabVerbIdx] = useState<number>(0);
  const [labNegative, setLabNegative] = useState<boolean>(false);
  const [showShortNegative, setShowShortNegative] = useState<boolean>(false);

  // Section D: Learned -ing verbs & filter
  const [ingRuleFilter, setIngRuleFilter] = useState<'all' | 'regular' | 'drop_e' | 'double_consonant'>('all');
  const [learnedVerbIds, setLearnedVerbIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pc_learned_verbs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Section G: Multiple Choice (12 items)
  const [mcqIdx, setMcqIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('pc_mcq_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [mcqChecked, setMcqChecked] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pc_mcq_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Section H: Fill in the Blanks (20 items)
  const [blankPartFilter, setBlankPartFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [blankAnswers, setBlankAnswers] = useState<Record<number, string>>(() => {
    try {
      const saved = localStorage.getItem('pc_blank_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [blankChecked, setBlankChecked] = useState<Record<number, boolean>>(() => {
    try {
      const saved = localStorage.getItem('pc_blank_checked');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Section I & J: Own sentences (5) & Friends practice (3)
  const [ownSentences, setOwnSentences] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pc_own_sentences');
      return saved ? JSON.parse(saved) : ['', '', '', '', ''];
    } catch {
      return ['', '', '', '', ''];
    }
  });
  const [friendSentences, setFriendSentences] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pc_friend_sentences');
      return saved ? JSON.parse(saved) : ['', '', ''];
    } catch {
      return ['', '', ''];
    }
  });
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  // Reward milestones
  const [awardedMilestones, setAwardedMilestones] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pc_rewards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage safely
  useEffect(() => {
    safeSetItem('pc_learned_verbs', JSON.stringify(learnedVerbIds));
  }, [learnedVerbIds]);

  useEffect(() => {
    safeSetItem('pc_mcq_answers', JSON.stringify(mcqAnswers));
    safeSetItem('pc_mcq_checked', JSON.stringify(mcqChecked));
  }, [mcqAnswers, mcqChecked]);

  useEffect(() => {
    safeSetItem('pc_blank_answers', JSON.stringify(blankAnswers));
    safeSetItem('pc_blank_checked', JSON.stringify(blankChecked));
  }, [blankAnswers, blankChecked]);

  useEffect(() => {
    safeSetItem('pc_own_sentences', JSON.stringify(ownSentences));
  }, [ownSentences]);

  useEffect(() => {
    safeSetItem('pc_friend_sentences', JSON.stringify(friendSentences));
  }, [friendSentences]);

  useEffect(() => {
    safeSetItem('pc_rewards', JSON.stringify(awardedMilestones));
  }, [awardedMilestones]);

  const grantOnce = (key: string, pts: number, reason: string) => {
    if (awardedMilestones.includes(key)) return;
    setAwardedMilestones(prev => [...prev, key]);
    addPoints(pts, reason);
  };

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

  // Mastery computation
  const mcqCorrectCount = useMemo(
    () => PC_MULTIPLE_CHOICE.filter(q => mcqChecked[q.id] && mcqAnswers[q.id] === q.answer).length,
    [mcqAnswers, mcqChecked]
  );

  const blanksCorrectCount = useMemo(
    () =>
      PC_FILL_BLANKS.filter(
        q => blankChecked[q.id] && normalizeText(blankAnswers[q.id] || '') === normalizeText(q.answer)
      ).length,
    [blankAnswers, blankChecked]
  );

  const ownFilledCount = ownSentences.filter(s => s.trim().length > 4).length;
  const friendFilledCount = friendSentences.filter(s => s.trim().length > 4).length;

  const totalUnits = ING_VERBS.length + PC_MULTIPLE_CHOICE.length + PC_FILL_BLANKS.length + 8;
  const completedUnits = learnedVerbIds.length + mcqCorrectCount + blanksCorrectCount + ownFilledCount + friendFilledCount;
  const overallPercent = Math.min(100, Math.round((completedUnits / totalUnits) * 100));

  const lastReportedRef = useRef<number>(-1);
  const badgeUnlockedRef = useRef<boolean>(false);

  useEffect(() => {
    if (onMasteryUpdate && overallPercent !== lastReportedRef.current) {
      lastReportedRef.current = overallPercent;
      onMasteryUpdate(overallPercent);
    }
    if (overallPercent >= 80 && onUnlockBadge && !badgeUnlockedRef.current) {
      badgeUnlockedRef.current = true;
      onUnlockBadge('present_continuous_pro');
    }
  }, [overallPercent, onMasteryUpdate, onUnlockBadge]);

  // Handlers
  const handleLearnVerb = (item: typeof ING_VERBS[0]) => {
    speakText(`${item.base}, ${item.ing}. ${item.example}`);
    if (!learnedVerbIds.includes(item.id)) {
      setLearnedVerbIds(prev => [...prev, item.id]);
      onWordLearned(item.ing);
      addPoints(10, `Learned "${item.base} → ${item.ing}"!`);
    }
  };

  const handleMcqSelect = (id: number, value: string) => {
    setMcqAnswers(prev => ({ ...prev, [id]: value }));
    setMcqChecked(prev => ({ ...prev, [id]: true }));
    const q = PC_MULTIPLE_CHOICE.find(item => item.id === id);
    if (q && value === q.answer) {
      const spoken = q.prompt.includes('___') ? q.prompt.replace('___', value) : value;
      speakText(spoken);
      grantOnce(`pc_mcq_${id}`, 15, `Benar Soal #${id}!`);
    }
  };

  const handleBlankCheck = (id: number) => {
    const q = PC_FILL_BLANKS.find(item => item.id === id);
    if (!q) return;
    setBlankChecked(prev => ({ ...prev, [id]: true }));
    if (normalizeText(blankAnswers[id] || '') === normalizeText(q.answer)) {
      speakText(`${q.before}${q.answer}${q.after}`);
      grantOnce(`pc_blank_${id}`, 15, `Isian #${id} Benar!`);
    }
  };

  const handleCheckAllBlanks = () => {
    const nextChecked = { ...blankChecked };
    const newlyEarned: string[] = [];
    PC_FILL_BLANKS.forEach(q => {
      if ((blankAnswers[q.id] || '').trim()) {
        nextChecked[q.id] = true;
        if (
          normalizeText(blankAnswers[q.id] || '') === normalizeText(q.answer) &&
          !awardedMilestones.includes(`pc_blank_${q.id}`)
        ) {
          newlyEarned.push(`pc_blank_${q.id}`);
        }
      }
    });
    setBlankChecked(nextChecked);
    if (newlyEarned.length > 0) {
      setAwardedMilestones(prev => [...prev, ...newlyEarned]);
      addPoints(newlyEarned.length * 15, `${newlyEarned.length} Isian Baru Benar!`);
    }
  };

  const handleSaveToScrapbook = () => {
    const filledOwn = ownSentences.map(s => s.trim()).filter(Boolean);
    const filledFriends = friendSentences.map(s => s.trim()).filter(Boolean);
    if (filledOwn.length === 0 && filledFriends.length === 0) {
      setSavedNotice('Tulis minimal 1 kalimat dulu sebelum menyimpan.');
      setTimeout(() => setSavedNotice(null), 3000);
      return;
    }

    grantOnce('pc_write_own', 50, 'Menulis Kalimat Present Continuous!');
    if (filledFriends.length >= 3) {
      grantOnce('pc_write_friends', 50, 'Menyelesaikan Latihan Mengamati Sekitar!');
    }

    if (onSave) {
      const lines = [...filledOwn.slice(0, 5), ...filledFriends.slice(0, 3)];
      const svgContent = `
        <svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800">
          <rect width="800" height="800" fill="#ECFDF5"/>
          <rect x="40" y="40" width="720" height="720" rx="36" fill="#FFFFFF" stroke="#10B981" stroke-width="6"/>
          <text x="400" y="110" text-anchor="middle" font-family="sans-serif" font-size="34" font-weight="bold" fill="#047857">What Is Happening Now?</text>
          <text x="400" y="150" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#64748B">Present Continuous Tense Journal</text>
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
        english: filledOwn[0] || filledFriends[0],
        indonesian: `${lines.length} kalimat Present Continuous tentang kejadian sekarang`,
        data: dataUrl
      });
    }

    setSavedNotice('Keren! Kalimatmu berhasil disimpan ke Scrapbook.');
    setTimeout(() => setSavedNotice(null), 3500);
  };

  // Sandbox live values
  const labToBe = SUBJECT_TO_BE[labSubject];
  const labVerb = ING_VERBS[labVerbIdx];
  const labVerbIngLower = labVerb.ing.toLowerCase();
  const labSentence = labNegative
    ? `${labSubject} ${labToBe} not ${labVerbIngLower} now.`
    : `${labSubject} ${labToBe} ${labVerbIngLower} now.`;

  const filteredIngVerbs =
    ingRuleFilter === 'all' ? ING_VERBS : ING_VERBS.filter(v => v.rule === ingRuleFilter);

  const currentMcq = PC_MULTIPLE_CHOICE[mcqIdx];
  const currentMcqSelected = mcqAnswers[currentMcq.id];
  const currentMcqChecked = mcqChecked[currentMcq.id];

  const filteredBlanks =
    blankPartFilter === 'all'
      ? PC_FILL_BLANKS
      : PC_FILL_BLANKS.filter(q => q.part === blankPartFilter);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24">
      {/* Header */}
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
                Present Continuous Tense (Sedang Berlangsung)
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
            >
              {speechSlow ? '🐢 Suara: Pelan' : '🔊 Suara: Normal'}
            </button>
            <button
              onClick={() => setShowPdfModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              📄 Lihat PDF Asli
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-3 flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {[
            { id: 'intro' as ContinuousTab, label: 'A–C · Pengenalan & Rumus', count: 'Lab' },
            { id: 'verbs' as ContinuousTab, label: 'D · Kata Kerja -ing', count: `${learnedVerbIds.length}/10` },
            { id: 'compare' as ContinuousTab, label: 'E–F · Bandingkan & Negatif', count: 'Tips' },
            { id: 'mcq' as ContinuousTab, label: 'G · Pilihan Ganda', count: `${mcqCorrectCount}/12` },
            { id: 'blanks' as ContinuousTab, label: 'H · Isian Singkat', count: `${blanksCorrectCount}/20` },
            { id: 'write' as ContinuousTab, label: 'I–J · Buat Kalimat', count: `${ownFilledCount + friendFilledCount}/8` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] tabular-nums font-bold ${
                  activeTab === tab.id ? 'text-emerald-100' : 'text-slate-400'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Progress Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Kemajuan Belajar Lesson 5
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

        {/* TAB 1: SECTION A, B, C */}
        {activeTab === 'intro' && (
          <div className="space-y-8">
            {/* Section A */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Bagian A · Pengertian
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  What Is Present Continuous Tense?
                </h2>
                <p className="text-slate-600 mt-1">
                  Present Continuous Tense digunakan untuk menjelaskan kegiatan yang{' '}
                  <strong>sedang berlangsung sekarang</strong>. Kata keterangan yang sering dipakai:{' '}
                  <strong>now</strong> dan <strong>right now</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PC_INTRO_EXAMPLES.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => speakText(ex.en)}
                    className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 text-left transition-colors cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-3xl mb-2">{ex.icon}</div>
                      <div className="text-lg font-bold text-slate-900">{ex.en}</div>
                      <div className="text-sm text-slate-500 mt-0.5">{ex.idn}</div>
                    </div>
                    <span className="text-xl shrink-0">🔊</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Section B: Understanding To Be */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian B · Kata Bantu To Be
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Understanding To Be: Am, Is, Are
                </h2>
                <p className="text-slate-600 mt-1">
                  Sebelum kata kerja berakhiran <strong>-ing</strong>, kita wajib memakai kata bantu{' '}
                  <strong>to be</strong> yang sesuai dengan subjeknya.
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-6 overflow-hidden rounded-2xl border border-slate-200">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
                      <tr>
                        <th className="py-3 px-4 font-bold">Subject</th>
                        <th className="py-3 px-4 font-bold">To Be</th>
                        <th className="py-3 px-4 font-bold">Arti</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {TO_BE_TABLE.map(row => (
                        <tr key={row.subject} className="hover:bg-slate-50">
                          <td className="py-2.5 px-4 font-bold text-slate-900">{row.subject}</td>
                          <td className="py-2.5 px-4 font-bold text-emerald-700">{row.toBe}</td>
                          <td className="py-2.5 px-4 text-slate-600">{row.idn}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="lg:col-span-6 flex flex-col justify-between gap-4">
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 space-y-2">
                    <h3 className="font-bold text-emerald-900">Cara Mudah Mengingat:</h3>
                    <div className="text-sm font-bold text-slate-800">• I → am</div>
                    <div className="text-sm font-bold text-slate-800">• He, She, It → is</div>
                    <div className="text-sm font-bold text-slate-800">• You, We, They → are</div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase">Contoh Lain dengan To Be:</div>
                    {TO_BE_EXAMPLES.map((ex, i) => (
                      <button
                        key={i}
                        onClick={() => speakText(ex.en)}
                        className="w-full flex items-center justify-between text-left bg-white hover:bg-emerald-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-800 cursor-pointer"
                      >
                        <span>
                          {ex.en} <span className="font-normal text-slate-500">({ex.idn})</span>
                        </span>
                        <span>🔊</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Section C: Formula + Interactive Builder */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-1">
                  Bagian C · Rumus Kalimat Positif & Simulator
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Present Continuous Formula: Subject + am/is/are + Verb-ing
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-7 bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-5">
                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">1. Pilih Subject:</div>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(SUBJECT_TO_BE) as SubjectKey[]).map(sub => (
                        <button
                          key={sub}
                          onClick={() => {
                            setLabSubject(sub);
                            const tb = SUBJECT_TO_BE[sub];
                            speakText(
                              `${sub} ${tb}${labNegative ? ' not' : ''} ${ING_VERBS[labVerbIdx].ing.toLowerCase()} now`
                            );
                          }}
                          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors cursor-pointer ${
                            labSubject === sub
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">2. Pilih Bentuk Kalimat:</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setLabNegative(false)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                          !labNegative ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        Positif (+)
                      </button>
                      <button
                        onClick={() => setLabNegative(true)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                          labNegative ? 'bg-rose-600 text-white' : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        Negatif (+ not)
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-slate-500 uppercase mb-2">3. Pilih Aktivitas (Verb-ing):</div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {ING_VERBS.map((v, idx) => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setLabVerbIdx(idx);
                            speakText(
                              `${labSubject} ${labToBe}${labNegative ? ' not' : ''} ${v.ing.toLowerCase()} now`
                            );
                          }}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer text-left ${
                            labVerbIdx === idx
                              ? 'bg-sky-600 text-white'
                              : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div>{v.icon} {v.base}</div>
                          <div className="opacity-75 font-normal">{v.meaning}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Live Result Stage */}
                <div className="lg:col-span-5 bg-emerald-950 text-white rounded-2xl p-6 flex flex-col justify-between gap-5">
                  <div>
                    <div className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      Hasil Kalimat Langsung
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2 text-lg sm:text-xl font-bold">
                      <span className="px-3 py-1.5 rounded-xl bg-white/10">{labSubject}</span>
                      <span>+</span>
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-600">{labToBe}</span>
                      {labNegative && (
                        <>
                          <span>+</span>
                          <span className="px-3 py-1.5 rounded-xl bg-rose-600">not</span>
                        </>
                      )}
                      <span>+</span>
                      <span className="px-3 py-1.5 rounded-xl bg-sky-600">{labVerbIngLower}</span>
                    </div>

                    <div className="text-2xl sm:text-3xl font-bold mt-6 leading-snug text-emerald-100">
                      {labSentence}
                    </div>
                    <p className="text-sm text-emerald-200/80 mt-2">
                      Aturan kata kerja: {labVerb.base} → {labVerb.ing} ({labVerb.ruleNote}).
                    </p>
                  </div>

                  <button
                    onClick={() => speakText(labSentence)}
                    className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm transition-colors cursor-pointer"
                  >
                    🔊 Dengarkan Kalimat Ini
                  </button>
                </div>
              </div>

              {/* Formula Examples Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
                    <tr>
                      <th className="py-3 px-4 font-bold">Subject</th>
                      <th className="py-3 px-4 font-bold">To Be</th>
                      <th className="py-3 px-4 font-bold">Verb-ing</th>
                      <th className="py-3 px-4 font-bold">Sentence</th>
                      <th className="py-3 px-4 font-bold text-right">Audio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {FORMULA_TABLE_EXAMPLES.map(row => (
                      <tr key={row.sentence} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-bold">{row.subject}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{row.toBe}</td>
                        <td className="py-3 px-4 font-bold text-sky-700">{row.verbIng}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{row.sentence}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => speakText(row.sentence)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-100 text-emerald-700 text-xs font-bold cursor-pointer"
                          >
                            🔊
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('verbs')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
                >
                  Lanjut ke Bagian D: Kata Kerja -ing ➡️
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 2: SECTION D — ADDING -ING TO VERBS */}
        {activeTab === 'verbs' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Bagian D · Adding -ing to Verbs
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  10 Kata Kerja Bentuk -ing & Aturan Ejaan
                </h2>
                <p className="text-slate-600 mt-1">
                  Perhatikan perubahan huruf pada <strong>Write → Writing</strong>,{' '}
                  <strong>Run → Running</strong>, dan <strong>Swim → Swimming</strong>!
                </p>
              </div>
              <div className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl tabular-nums shrink-0">
                Dikuasai: {learnedVerbIds.length} / {ING_VERBS.length}
              </div>
            </div>

            {/* Rule Filter */}
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'Semua (10)' },
                { key: 'regular' as const, label: 'Langsung + -ing (7)' },
                { key: 'drop_e' as const, label: 'Hilangkan huruf e (Write)' },
                { key: 'double_consonant' as const, label: 'Gandakan huruf akhir (Run, Swim)' }
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setIngRuleFilter(f.key)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    ingRuleFilter === f.key
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Spelling Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <div className="font-bold text-amber-900">Write → Writing</div>
                <div className="text-xs text-amber-800 mt-1">Huruf <strong>e</strong> di akhir dihilangkan.</div>
              </div>
              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4">
                <div className="font-bold text-sky-900">Run → Running</div>
                <div className="text-xs text-sky-800 mt-1">Huruf <strong>n</strong> digandakan sebelum -ing.</div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4">
                <div className="font-bold text-indigo-900">Swim → Swimming</div>
                <div className="text-xs text-indigo-800 mt-1">Huruf <strong>m</strong> digandakan sebelum -ing.</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIngVerbs.map(v => {
                const isLearned = learnedVerbIds.includes(v.id);
                return (
                  <div
                    key={v.id}
                    className={`rounded-2xl border p-5 flex flex-col justify-between transition-colors ${
                      isLearned ? 'bg-emerald-50/50 border-emerald-300' : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <span className="text-3xl">{v.icon}</span>
                        <button
                          onClick={() => speakText(`${v.base}, ${v.ing}. ${v.example}`)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer"
                        >
                          🔊 Dengar
                        </button>
                      </div>
                      <div className="text-xl font-bold text-slate-900">
                        {v.base} <span className="text-slate-400 mx-1">→</span>{' '}
                        <span className="text-emerald-700">{v.ing}</span>
                      </div>
                      <div className="text-sm font-bold text-sky-700 mt-0.5">{v.meaning}</div>
                      <div className="text-xs text-slate-500 mt-2">{v.ruleNote}</div>
                      <div className="text-xs text-slate-700 mt-3 pt-2 border-t border-slate-200/80 italic">
                        "{v.example}" — {v.exampleIdn}
                      </div>
                    </div>

                    <button
                      onClick={() => handleLearnVerb(v)}
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

            <div className="flex justify-end">
              <button
                onClick={() => setActiveTab('compare')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
              >
                Lanjut ke Bagian E–F: Perbandingan & Kalimat Negatif ➡️
              </button>
            </div>
          </section>
        )}

        {/* TAB 3: SECTION E & F — COMPARISON & NEGATIVE SENTENCES */}
        {activeTab === 'compare' && (
          <div className="space-y-8">
            {/* Section E */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian E · Perbandingan Tense
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Simple Present vs Present Continuous
                </h2>
                <p className="text-slate-600 mt-1">
                  <strong>Simple Present</strong> menceritakan kebiasaan/rutinitas, sedangkan{' '}
                  <strong>Present Continuous</strong> menceritakan kegiatan yang sedang berlangsung sekarang.
                </p>
              </div>

              <div className="space-y-3">
                {TENSE_COMPARISON_PAIRS.map((pair, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4"
                  >
                    <button
                      onClick={() => speakText(pair.simplePresent)}
                      className="bg-white hover:bg-sky-50 border border-sky-200 rounded-xl p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-sky-600 uppercase">Simple Present (Kebiasaan)</div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">{pair.simplePresent}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{pair.idnPresent}</div>
                      </div>
                      <span>🔊</span>
                    </button>

                    <button
                      onClick={() => speakText(pair.presentContinuous)}
                      className="bg-white hover:bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div>
                        <div className="text-[11px] font-bold text-emerald-600 uppercase">
                          Present Continuous (Sedang Terjadi)
                        </div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">{pair.presentContinuous}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{pair.idnContinuous}</div>
                      </div>
                      <span>🔊</span>
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Section F */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
                    Bagian F · Negative Sentences
                  </p>
                  <h2 className="text-2xl font-bold text-slate-900">
                    Subject + am/is/are + not + Verb-ing
                  </h2>
                  <p className="text-slate-600 mt-1">
                    Untuk membuat kalimat negatif, tambahkan <strong>not</strong> tepat setelah{' '}
                    <strong>to be (am/is/are)</strong>.
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl shrink-0">
                  <button
                    onClick={() => setShowShortNegative(false)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      !showShortNegative ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Bentuk Lengkap
                  </button>
                  <button
                    onClick={() => setShowShortNegative(true)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                      showShortNegative ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                  >
                    Bentuk Singkat
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {NEGATIVE_EXAMPLES.map((ex, i) => {
                  const text = showShortNegative ? ex.short : ex.full;
                  return (
                    <button
                      key={i}
                      onClick={() => speakText(text)}
                      className="bg-rose-50/60 hover:bg-rose-100/70 border border-rose-200 rounded-2xl p-5 text-left flex items-center justify-between gap-3 cursor-pointer"
                    >
                      <div>
                        <div className="text-lg font-bold text-slate-900">{text}</div>
                        <div className="text-xs text-slate-600 mt-1">{ex.idn}</div>
                      </div>
                      <span>🔊</span>
                    </button>
                  );
                })}
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-wrap gap-6 text-sm font-bold text-slate-700">
                <div>
                  Bentuk singkat: <span className="text-rose-700">Is not → Isn't</span>
                </div>
                <div>
                  <span className="text-rose-700">Are not → Aren't</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => setActiveTab('mcq')}
                  className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
                >
                  Mulai Latihan G: Pilihan Ganda (12 Soal) ➡️
                </button>
              </div>
            </section>
          </div>
        )}

        {/* TAB 4: SECTION G — MULTIPLE CHOICE (12 QUESTIONS) */}
        {activeTab === 'mcq' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Bagian G · Multiple Choice
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Choose the correct answer! (12 Soal)
                </h2>
              </div>
              <div className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl tabular-nums">
                Benar: {mcqCorrectCount} / {PC_MULTIPLE_CHOICE.length}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {PC_MULTIPLE_CHOICE.map((q, idx) => {
                const isChecked = mcqChecked[q.id];
                const isCorrect = isChecked && mcqAnswers[q.id] === q.answer;
                return (
                  <button
                    key={q.id}
                    onClick={() => setMcqIdx(idx)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm tabular-nums transition-colors cursor-pointer border ${
                      mcqIdx === idx
                        ? 'bg-emerald-600 text-white border-emerald-600'
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

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-500 uppercase mb-2 tabular-nums">
                    Soal Nomor {currentMcq.id} dari {PC_MULTIPLE_CHOICE.length}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">
                    {currentMcqChecked && currentMcqSelected === currentMcq.answer && currentMcq.prompt.includes('___')
                      ? currentMcq.prompt.replace('___', currentMcq.answer)
                      : currentMcq.prompt}
                  </h3>
                </div>
                <button
                  onClick={() =>
                    speakText(
                      currentMcqChecked && currentMcqSelected === currentMcq.answer && currentMcq.prompt.includes('___')
                        ? currentMcq.prompt.replace('___', currentMcq.answer)
                        : currentMcq.prompt.replace('___', 'blank')
                    )
                  }
                  className="px-3 py-2 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold shrink-0 cursor-pointer"
                >
                  🔊 Baca
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentMcq.options.map(opt => {
                  const selected = currentMcqSelected === opt.value;
                  const isCorrectOption = opt.value === currentMcq.answer;
                  let styleClass = 'bg-white border-slate-200 text-slate-800 hover:border-emerald-400 hover:bg-emerald-50';
                  if (currentMcqChecked) {
                    if (isCorrectOption) {
                      styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-900';
                    } else if (selected && !isCorrectOption) {
                      styleClass = 'bg-rose-50 border-rose-500 text-rose-900';
                    }
                  }

                  return (
                    <button
                      key={opt.label}
                      onClick={() => handleMcqSelect(currentMcq.id, opt.value)}
                      className={`p-4 rounded-xl border-2 text-left font-bold text-base sm:text-lg flex items-center justify-between transition-colors cursor-pointer ${styleClass}`}
                    >
                      <span>
                        <span className="inline-block w-7 text-slate-400 font-bold">{opt.label}.</span>
                        {opt.value}
                      </span>
                      {currentMcqChecked && isCorrectOption && <span className="text-sm shrink-0 ml-2">✓ Benar</span>}
                      {currentMcqChecked && selected && !isCorrectOption && <span className="text-sm shrink-0 ml-2">✕ Salah</span>}
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
                {mcqIdx < PC_MULTIPLE_CHOICE.length - 1 ? (
                  <button
                    onClick={() => setMcqIdx(i => i + 1)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Soal Berikutnya ➡️
                  </button>
                ) : (
                  <button
                    onClick={() => setActiveTab('blanks')}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm cursor-pointer"
                  >
                    Lanjut ke Bagian H (20 Soal Isian) ➡️
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: SECTION H — FILL IN THE BLANKS (20 QUESTIONS) */}
        {activeTab === 'blanks' && (
          <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Bagian H · Fill in the Blanks
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Complete the sentences with the correct form! (20 Soal)
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-700 bg-slate-100 px-4 py-2 rounded-xl tabular-nums">
                  Benar: {blanksCorrectCount} / 20
                </span>
                <button
                  onClick={handleCheckAllBlanks}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer whitespace-nowrap shrink-0"
                >
                  Periksa Semua
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all' as const, label: 'Semua Bagian (1–20)' },
                { key: 1 as const, label: 'Part 1: am / is / are (1–8)' },
                { key: 2 as const, label: 'Part 2: Bentuk -ing (9–14)' },
                { key: 3 as const, label: 'Part 3: Lengkapi Kalimat (15–20)' }
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
                        <h3 className="text-base font-bold text-emerald-800">{item.partTitle}</h3>
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
                          <span>{item.before}</span>
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
                            className="w-32 px-3 py-1.5 rounded-xl border-2 border-slate-300 focus:border-emerald-500 bg-white text-center font-bold text-emerald-700 outline-none"
                          />
                          {item.verbHint && (
                            <span className="text-xs font-medium text-slate-500">({item.verbHint})</span>
                          )}
                          <span>{item.after}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          {item.choices.map(ch => (
                            <button
                              key={ch}
                              onClick={() => {
                                setBlankAnswers(prev => ({ ...prev, [item.id]: ch }));
                                setBlankChecked(prev => ({ ...prev, [item.id]: false }));
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                                normalizeText(val) === normalizeText(ch)
                                  ? 'bg-emerald-600 text-white border-emerald-600'
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
                            className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold cursor-pointer"
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
                onClick={() => setActiveTab('write')}
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm cursor-pointer"
              >
                Lanjut ke Bagian I–J (Buat Kalimat) ➡️
              </button>
            </div>
          </section>
        )}

        {/* TAB 6: SECTION I & J — MAKE YOUR OWN SENTENCES & LET'S PRACTICE */}
        {activeTab === 'write' && (
          <div className="space-y-8">
            {/* Section I */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
                  Bagian I · Make Your Own Sentences
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Make five sentences about activities happening now!
                </h2>
                <p className="text-slate-600 mt-1">
                  Contoh dari modul: <strong>1. I am studying English.</strong>
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-slate-500 uppercase mb-2">
                  Klik contoh untuk mengisi slot kosong berikutnya:
                </div>
                <div className="flex flex-wrap gap-2">
                  {PC_OWN_STARTERS.map((starter, idx) => (
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
                      className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold cursor-pointer"
                    >
                      + {starter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {ownSentences.map((sentence, idx) => {
                  const fb = sentence.trim() ? checkContinuousSentence(sentence) : null;
                  return (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
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
                          placeholder={idx === 0 ? 'Contoh: I am studying English.' : 'Tulis kegiatan yang sedang berlangsung...'}
                          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:border-emerald-500 bg-white font-semibold text-slate-800 outline-none"
                        />
                        <button
                          onClick={() => sentence.trim() && speakText(sentence)}
                          disabled={!sentence.trim()}
                          className="px-3 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-emerald-50 text-emerald-700 font-bold text-xs disabled:opacity-40 cursor-pointer"
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

            {/* Section J: Let's Practice */}
            <section className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div>
                <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">
                  Bagian J · Let's Practice!
                </p>
                <h2 className="text-2xl font-bold text-slate-900">
                  Look around you. What are your friends doing? Write three sentences!
                </h2>
                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  <div>• My friend is writing.</div>
                  <div>• My teacher is talking.</div>
                  <div>• My friends are sitting.</div>
                </div>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 text-sm text-sky-900">
                <div className="font-bold mb-1">Remember! Present Continuous = To Be + Verb-ing</div>
                <div className="flex flex-wrap gap-4 text-xs font-bold">
                  <span>• I am</span>
                  <span>• He / She / It is</span>
                  <span>• You / We / They are</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {PC_FRIENDS_STARTERS.map((starter, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const emptyIdx = friendSentences.findIndex(s => !s.trim());
                      const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
                      const next = [...friendSentences];
                      next[targetIdx] = starter;
                      setFriendSentences(next);
                      speakText(starter);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 text-xs font-bold cursor-pointer"
                  >
                    + {starter}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                {friendSentences.map((sentence, idx) => {
                  const fb = sentence.trim() ? checkContinuousSentence(sentence) : null;
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
                            const next = [...friendSentences];
                            next[idx] = e.target.value;
                            setFriendSentences(next);
                          }}
                          placeholder="Contoh: My friend is writing."
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

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200">
                <button
                  onClick={() => {
                    const all = [...ownSentences, ...friendSentences].map(s => s.trim()).filter(Boolean);
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

      {/* PDF Modal */}
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
                <h3 className="font-bold text-base">Modul PDF: Present Continuous Tense</h3>
                <p className="text-xs text-slate-300">Dokumen referensi asli (6 halaman)</p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={PDF_PATH}
                  download="ENGLISH_FOR_KIDS_Present_Continuous_Tense.pdf"
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold"
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
                title="English for Kids Present Continuous Tense PDF"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PresentContinuousIsland;
