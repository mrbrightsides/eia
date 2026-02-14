
import React, { useState, useEffect, useRef } from 'react';
import { GameType, Badge, DailyQuest, IslandMastery, UserProfile, JournalEntry } from './types';
import { generateDailyQuest } from './services/geminiService';
import Header from './components/Header';
import VocabIsland from './components/VocabIsland';
import ChatIsland from './components/ChatIsland';
import QuestIsland from './components/QuestIsland';
import CameraIsland from './components/CameraIsland';
import MatchingIsland from './components/MatchingIsland';
import ScrambleIsland from './components/ScrambleIsland';
import CinemaIsland from './components/CinemaIsland';
import SingingIsland from './components/SingingIsland';
import RoleplayIsland from './components/RoleplayIsland';
import MimicIsland from './components/MimicIsland';
import ScavengerIsland from './components/ScavengerIsland';
import PetIsland from './components/PetIsland';
import TracingIsland from './components/TracingIsland';
import SimonSaysIsland from './components/SimonSaysIsland';
import ISpyIsland from './components/ISpyIsland';
import TutorialOverlay from './components/TutorialOverlay';

const LEVEL_THRESHOLDS = [0, 500, 1200, 2500, 5000, 10000];
const RANKS = ["Little Scout", "Junior Explorer", "Word Wizard", "Language Legend", "Island Master"];
const AVATARS = [
  { emoji: '🐯', name: 'Cool Tiger' },
  { emoji: '🐼', name: 'Happy Panda' },
  { emoji: '🐨', name: 'Sleepy Koala' },
  { emoji: '🦊', name: 'Smart Fox' },
  { emoji: '🐸', name: 'Jumping Frog' },
  { emoji: '🦁', name: 'Brave Lion' },
  { emoji: '🦄', name: 'Magic Unicorn' },
  { emoji: '🐵', name: 'Cheeky Monkey' }
];

const INITIAL_BADGES: Badge[] = [
  { id: 'first_login', name: 'First Arrival', icon: '🚢', description: 'Visited the island for the first time!', unlocked: true },
  { id: 'streak_3', name: 'Consistent Cub', icon: '🐾', description: 'Reached a 3-day streak!', unlocked: false },
  { id: 'vocab_master', name: 'Word Collector', icon: '📚', description: 'Completed a full vocabulary set!', unlocked: false },
  { id: 'artist', name: 'Magic Artist', icon: '🎨', description: 'Created 5 magical drawings!', unlocked: false },
  { id: 'singer', name: 'Pop Star', icon: '🎤', description: 'Sang your heart out on Singing Island!', unlocked: false },
  { id: 'dragon_master', name: 'Dragon Rider', icon: '🐲', description: 'Evolved Wordy to a Dragon!', unlocked: false },
  { id: 'writer', name: 'Letter Master', icon: '✍️', description: 'Traced 5 different letters perfectly!', unlocked: false },
];

const LEADERBOARD_NAMES = ["Budi 🚀", "Siti 🌈", "Andi 🐾", "Maya 🦄", "Eko 🦊", "Lina 🐘"];

const App: React.FC = () => {
  const [activeIsland, setActiveIsland] = useState<GameType | null>(() => {
    const saved = localStorage.getItem('activeIsland');
    if (saved && Object.values(GameType).includes(saved as GameType)) {
      return saved as GameType;
    }
    return null;
  });

  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('userProfile');
    return saved ? JSON.parse(saved) : null;
  });

  const [points, setPoints] = useState<number>(() => {
    const savedPoints = localStorage.getItem('userPoints');
    return savedPoints ? parseInt(savedPoints, 10) : 0;
  });

  const [streak, setStreak] = useState<number>(() => {
    const savedStreak = localStorage.getItem('streakCount');
    return savedStreak ? parseInt(savedStreak, 10) : 0;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    const saved = localStorage.getItem('userBadges');
    return saved ? JSON.parse(saved) : INITIAL_BADGES;
  });

  const [journal, setJournal] = useState<JournalEntry[]>(() => {
    const saved = localStorage.getItem('userJournal');
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyQuest, setDailyQuest] = useState<DailyQuest | null>(() => {
    const saved = localStorage.getItem('dailyQuest');
    return saved ? JSON.parse(saved) : null;
  });

  const [mastery, setMastery] = useState<Record<GameType, number>>(() => {
    const saved = localStorage.getItem('islandMastery');
    return saved ? JSON.parse(saved) : {
      [GameType.VOCAB]: 0,
      [GameType.CHAT]: 0,
      [GameType.IMAGE_QUEST]: 0,
      [GameType.CAMERA_QUEST]: 0,
      [GameType.MATCHING]: 0,
      [GameType.SCRAMBLE]: 0,
      [GameType.CINEMA]: 0,
      [GameType.SINGING]: 0,
      [GameType.ROLEPLAY]: 0,
      [GameType.MIMIC]: 0,
      [GameType.SCAVENGER]: 0,
      [GameType.PET]: 0,
      [GameType.TRACING]: 0,
      [GameType.SIMON_SAYS]: 0,
      [GameType.I_SPY]: 0
    };
  });

  const [isMuted, setIsMuted] = useState<boolean>(() => {
    const savedMute = localStorage.getItem('isMuted');
    return savedMute === 'true';
  });

  const [rewardMsg, setRewardMsg] = useState<{ text: string, points: number } | null>(null);
  const [levelUp, setLevelUp] = useState(false);
  const [showStreakSplash, setShowStreakSplash] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [showQuestModal, setShowQuestModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const [showJournal, setShowJournal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Derived stats
  const currentLevel = LEVEL_THRESHOLDS.filter(t => points >= t).length;
  const currentRank = RANKS[Math.min(currentLevel - 1, RANKS.length - 1)];
  const nextLevelPoints = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + 5000;
  const prevLevelPoints = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const levelProgress = ((points - prevLevelPoints) / (nextLevelPoints - prevLevelPoints)) * 100;

  // Pet logic
  const getPetEmoji = () => {
    if (points >= 5000) return '🐲';
    if (points >= 2500) return '🐉';
    if (points >= 500) return '🐣';
    return '🥚';
  };

  const handleCreateProfile = (data: UserProfile) => {
    setProfile(data);
    localStorage.setItem('userProfile', JSON.stringify(data));
  };

  const handleUpdateProfile = () => {
    if (!profile || !editName.trim()) return;
    const updated = { ...profile, name: editName.trim(), avatar: editAvatar };
    setProfile(updated);
    localStorage.setItem('userProfile', JSON.stringify(updated));
    setIsEditingProfile(false);
    addPoints(10, "Profile Updated! ✨");
  };

  const completeTutorial = () => {
    if (!profile) return;
    const updated = { ...profile, tutorialComplete: true };
    setProfile(updated);
    localStorage.setItem('userProfile', JSON.stringify(updated));
    addPoints(100, "Guided Tour Complete! 🗺️");
  };

  const addPoints = (amount: number, reason: string) => {
    setPoints(prev => {
      const newPoints = prev + amount;
      localStorage.setItem('userPoints', newPoints.toString());
      const oldLevel = LEVEL_THRESHOLDS.filter(t => prev >= t).length;
      const newLevel = LEVEL_THRESHOLDS.filter(t => newPoints >= t).length;
      if (newLevel > oldLevel) {
        setLevelUp(true);
        setTimeout(() => setLevelUp(false), 4000);
      }
      return newPoints;
    });
    setRewardMsg({ text: reason, points: amount });
    setTimeout(() => setRewardMsg(null), 3000);
  };

  const updateMastery = (type: GameType, increment: number) => {
    setMastery(prev => {
      const newVal = Math.min((prev[type] || 0) + increment, 100);
      const updated = { ...prev, [type]: newVal };
      localStorage.setItem('islandMastery', JSON.stringify(updated));
      return updated;
    });
  };

  const addLearnedWord = (word: string) => {
    if (!profile) return;
    setProfile(prev => {
      if (!prev || prev.learnedWords.includes(word)) return prev;
      const updated = { ...prev, learnedWords: [...prev.learnedWords, word] };
      localStorage.setItem('userProfile', JSON.stringify(updated));
      return updated;
    });
  };

  const addToJournal = (entry: Omit<JournalEntry, 'id' | 'date'>) => {
    const fullEntry: JournalEntry = {
      ...entry,
      id: Date.now().toString(),
      date: new Date().toLocaleDateString()
    };
    setJournal(prev => {
      const updated = [fullEntry, ...prev];
      localStorage.setItem('userJournal', JSON.stringify(updated));
      return updated;
    });
  };

  const getMasteryLevel = (percent: number): IslandMastery => {
    if (percent >= 100) return { percent, level: 'Master', idnLevel: 'Guru', color: 'bg-yellow-400' };
    if (percent >= 70) return { percent, level: 'Expert', idnLevel: 'Ahli', color: 'bg-purple-500' };
    if (percent >= 35) return { percent, level: 'Explorer', idnLevel: 'Penjelajah', color: 'bg-blue-500' };
    return { percent, level: 'Novice', idnLevel: 'Pemula', color: 'bg-green-500' };
  };

  const updateQuestProgress = (type: DailyQuest['type'], amount: number = 1) => {
    if (!dailyQuest || dailyQuest.isClaimed || dailyQuest.date !== new Date().toDateString()) return;
    if (dailyQuest.type === type || dailyQuest.type === 'any') {
      const newCurrent = Math.min(dailyQuest.current + amount, dailyQuest.goal);
      const updated = { ...dailyQuest, current: newCurrent };
      setDailyQuest(updated);
      localStorage.setItem('dailyQuest', JSON.stringify(updated));
    }
  };

  const claimDailyReward = () => {
    if (!dailyQuest || dailyQuest.current < dailyQuest.goal || dailyQuest.isClaimed) return;
    const updated = { ...dailyQuest, isClaimed: true };
    setDailyQuest(updated);
    localStorage.setItem('dailyQuest', JSON.stringify(updated));
    addPoints(dailyQuest.reward, `Daily Mission Completed! 🏆`);
    setShowQuestModal(false);
  };

  const unlockBadge = (id: string) => {
    setBadges(prev => {
      if (prev.find(b => b.id === id)?.unlocked) return prev;
      const updated = prev.map(b => b.id === id ? { ...b, unlocked: true } : b);
      localStorage.setItem('userBadges', JSON.stringify(updated));
      return updated;
    });
  };

  const startEditMode = () => {
    if (!profile) return;
    setEditName(profile.name);
    setEditAvatar(profile.avatar);
    setIsEditingProfile(true);
  };

  useEffect(() => {
    const audio = new Audio("https://cdn.pixabay.com/audio/2022/01/18/audio_d0a13f69d2.mp3");
    audio.loop = true;
    audio.volume = 0.2;
    audio.muted = isMuted;
    audioRef.current = audio;
    const playMusic = () => {
      if (audioRef.current) {
        audioRef.current.play().catch(err => console.log("Music play blocked", err));
        window.removeEventListener('mousedown', playMusic);
      }
    };
    window.addEventListener('mousedown', playMusic);
    return () => {
      audio.pause();
      audioRef.current = null;
      window.removeEventListener('mousedown', playMusic);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.muted = isMuted;
    localStorage.setItem('isMuted', isMuted.toString());
  }, [isMuted]);

  useEffect(() => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const lastLogin = localStorage.getItem('lastLogin');
    
    if (lastLogin !== today) {
      let newStreak = 1;
      if (lastLogin === yesterday) {
        newStreak = streak + 1;
      }
      
      setStreak(newStreak);
      localStorage.setItem('streakCount', newStreak.toString());
      localStorage.setItem('lastLogin', today);
      
      // Calculate Enhanced Streak Bonus
      const baseLoginBonus = 50;
      const streakBonus = newStreak * 25;
      const milestoneBonus = (newStreak % 7 === 0) ? 500 : 0;
      const totalAward = baseLoginBonus + streakBonus + milestoneBonus;
      
      setTimeout(() => {
        setShowStreakSplash(true);
        addPoints(totalAward, newStreak > 1 ? `${newStreak} Day Streak! 🔥` : "Welcome Back! 🎁");
        
        if (milestoneBonus > 0) {
          setTimeout(() => addPoints(0, "Weekly Milestone Bonus! 🏆"), 1500);
        }
        
        if (newStreak >= 3) unlockBadge('streak_3');
      }, 1000);

      generateDailyQuest().then(q => {
        const fullQuest: DailyQuest = {
          id: Date.now().toString(),
          title: q.title || "Word Wizard",
          idnTitle: q.idnTitle || "Penyihir Kata",
          goal: q.goal || 5,
          current: 0,
          reward: q.reward || 200,
          type: (q.type as any) || 'vocab',
          isClaimed: false,
          date: today
        };
        setDailyQuest(fullQuest);
        localStorage.setItem('dailyQuest', JSON.stringify(fullQuest));
      });
    }
  }, []);

  if (!profile) {
    return <OnboardingScreen onComplete={handleCreateProfile} />;
  }

  const renderIsland = () => {
    const back = () => setActiveIsland(null);
    switch (activeIsland) {
      case GameType.TRACING:
        return <TracingIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.TRACING, 10); }} onSave={(entry) => addToJournal(entry)} unlockBadge={() => unlockBadge('writer')} />;
      case GameType.PET:
        return <PetIsland onBack={back} profile={profile} onUpdateProfile={(p) => { setProfile(p); localStorage.setItem('userProfile', JSON.stringify(p)); }} addPoints={addPoints} updateMastery={() => updateMastery(GameType.PET, 10)} unlockBadge={unlockBadge} />;
      case GameType.VOCAB:
        return <VocabIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); unlockBadge('vocab_master'); updateQuestProgress('vocab'); updateMastery(GameType.VOCAB, 5); }} onWordLearned={addLearnedWord} />;
      case GameType.CHAT:
        return <ChatIsland onBack={back} points={points} streak={streak} addPoints={(amt, r) => { addPoints(amt, r); updateQuestProgress('chat'); updateMastery(GameType.CHAT, 2); }} avatar={profile.avatar} />;
      case GameType.IMAGE_QUEST:
        return <QuestIsland onBack={back} addPoints={(amt, r) => { 
          addPoints(amt, r); 
          updateMastery(GameType.IMAGE_QUEST, 10); 
          unlockBadge('artist'); 
        }} onSave={(entry) => addToJournal(entry)} />;
      case GameType.CAMERA_QUEST:
        return <CameraIsland onBack={back} addPoints={(amt, r) => { 
          addPoints(amt, r); 
          updateMastery(GameType.CAMERA_QUEST, 10); 
        }} onSave={(entry) => addToJournal(entry)} />;
      case GameType.MATCHING:
        return <MatchingIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.MATCHING, 8); }} />;
      case GameType.SCRAMBLE:
        return <ScrambleIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateQuestProgress('scramble'); updateMastery(GameType.SCRAMBLE, 8); }} />;
      case GameType.CINEMA:
        return <CinemaIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.CINEMA, 15); }} onSave={(entry) => addToJournal(entry)} />;
      case GameType.SINGING:
        return <SingingIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.SINGING, 12); unlockBadge('singer'); }} />;
      case GameType.ROLEPLAY:
        return <RoleplayIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.ROLEPLAY, 10); }} />;
      case GameType.MIMIC:
        return <MimicIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.MIMIC, 10); }} />;
      case GameType.SCAVENGER:
        return <ScavengerIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateQuestProgress('scavenger'); updateMastery(GameType.SCAVENGER, 15); }} onSave={(entry) => addToJournal(entry)} />;
      case GameType.SIMON_SAYS:
        return <SimonSaysIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.SIMON_SAYS, 10); }} />;
      case GameType.I_SPY:
        return <ISpyIsland onBack={back} addPoints={(amt, r) => { addPoints(amt, r); updateMastery(GameType.I_SPY, 15); }} />;
      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto mt-10 pb-12 relative z-10">
            <IslandCard title="Tracing Trails" subtitle="Jejak Huruf" icon="✍️" color="bg-cyan-500" description="Follow the magic dots to draw letters!" onClick={() => setActiveIsland(GameType.TRACING)} mastery={getMasteryLevel(mastery[GameType.TRACING])} />
            <IslandCard title="Simon Says" subtitle="Toby Berkata" icon="📢" color="bg-yellow-500" description="Follow Toby's commands and earn points!" onClick={() => setActiveIsland(GameType.SIMON_SAYS)} mastery={getMasteryLevel(mastery[GameType.SIMON_SAYS])} />
            <IslandCard title="Mystery Eye" subtitle="Mata Misteri" icon="👁️" color="bg-emerald-500" description="Solve riddles to find hidden items!" onClick={() => setActiveIsland(GameType.I_SPY)} mastery={getMasteryLevel(mastery[GameType.I_SPY])} />
            <IslandCard title="Mystery of Grammarton" subtitle="Misteri Grammarton" icon="🦉" color="bg-indigo-600" description="Roleplay with the Mayor to solve mysteries!" onClick={() => setActiveIsland(GameType.ROLEPLAY)} mastery={getMasteryLevel(mastery[GameType.ROLEPLAY])} />
            <IslandCard title="Echo Woods" subtitle="Hutan Gema" icon="👻" color="bg-teal-500" description="Mimic Toby's voice and unlock cool skins!" onClick={() => setActiveIsland(GameType.MIMIC)} mastery={getMasteryLevel(mastery[GameType.MIMIC])} />
            <IslandCard title="Scavenger Hunt" subtitle="Berburu Benda" icon="🎒" color="bg-amber-500" description="Find real objects around your home!" onClick={() => setActiveIsland(GameType.SCAVENGER)} mastery={getMasteryLevel(mastery[GameType.SCAVENGER])} />
            <IslandCard title="Puppet Theater" subtitle="Teater Boneka" icon="🎬" color="bg-indigo-500" description="Write scripts and make AI puppet movies!" onClick={() => setActiveIsland(GameType.CINEMA)} mastery={getMasteryLevel(mastery[GameType.CINEMA] || 0)} />
            <IslandCard title="Word Wizard" subtitle="Penyihir Kata" icon="🪄" color="bg-purple-400" description="Learn new words with magic cards!" onClick={() => setActiveIsland(GameType.VOCAB)} mastery={getMasteryLevel(mastery[GameType.VOCAB])} />
            <IslandCard title="Matching Mayhem" subtitle="Kekacauan Serasi" icon="🧩" color="bg-pink-400" description="Match English words with Indonesian!" onClick={() => setActiveIsland(GameType.MATCHING)} mastery={getMasteryLevel(mastery[GameType.MATCHING])} />
            <IslandCard title="Singing Stage" subtitle="Panggung Nyanyi" icon="🎤" color="bg-rose-500" description="Sing along and correct your pronunciation!" onClick={() => setActiveIsland(GameType.SINGING)} mastery={getMasteryLevel(mastery[GameType.SINGING] || 0)} />
            <IslandCard title="Chat Buddy" subtitle="Teman Bicara" icon="🐻" color="bg-orange-400" description="Talk to Toby the Bear in English!" onClick={() => setActiveIsland(GameType.CHAT)} mastery={getMasteryLevel(mastery[GameType.CHAT])} />
            <IslandCard title="Image Quest" subtitle="Misi Gambar" icon="🎨" color="bg-blue-400" description="Draw things with your words!" onClick={() => setActiveIsland(GameType.IMAGE_QUEST)} mastery={getMasteryLevel(mastery[GameType.IMAGE_QUEST])} />
            <IslandCard title="Magic Lens" subtitle="Lensa Ajaib" icon="🔍" color="bg-green-400" description="Discover English words around you!" onClick={() => setActiveIsland(GameType.CAMERA_QUEST)} mastery={getMasteryLevel(mastery[GameType.CAMERA_QUEST])} />
            <IslandCard title="Word Scramble" subtitle="Kata Acak" icon="🌪️" color="bg-red-400" description="Unscramble letters to find the word!" onClick={() => setActiveIsland(GameType.SCRAMBLE)} mastery={getMasteryLevel(mastery[GameType.SCRAMBLE])} />
          </div>
        );
    }
  };

  const pantryCount = (profile.learnedWords.length || 0) - (profile.eatenWords?.length || 0);

  return (
    <div className="min-h-screen pb-20 relative overflow-hidden bg-sky-50 flex flex-col">
      <div className="fixed inset-0 pointer-events-none z-0">
        <InteractiveWater />
      </div>

      <Header 
        points={points} 
        streak={streak} 
        level={currentLevel} 
        rank={currentRank} 
        progress={levelProgress}
        avatar={profile.avatar}
        petEmoji={getPetEmoji()}
        onProfileClick={() => setShowProfileModal(true)}
        onPetClick={() => setActiveIsland(GameType.PET)}
      />
      
      <main className="flex-1 relative z-10">
        {!profile.tutorialComplete && (
          <TutorialOverlay onComplete={completeTutorial} userName={profile.name} />
        )}

        {!activeIsland && (
          <div className="text-center mt-12 px-4 flex flex-col items-center">
             {/* Wordy the Pet Home Preview */}
            <div className="mb-6 group cursor-pointer" onClick={() => setActiveIsland(GameType.PET)}>
              <div className="relative inline-block">
                <div className={`text-8xl animate-character-breathe drop-shadow-lg group-hover:scale-110 transition-transform ${pantryCount === 0 ? 'grayscale opacity-60' : ''}`}>
                  <span className="animate-character-blink block">{getPetEmoji()}</span>
                </div>
                <div className="absolute -top-4 -right-4 bg-white px-3 py-1 rounded-full text-xs font-black text-blue-600 shadow-md border-2 border-blue-100">
                  WORDY
                </div>
                {pantryCount > 0 && (
                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[8px] px-2 py-0.5 rounded-full font-black animate-pulse whitespace-nowrap">
                     FEED ME {pantryCount} WORDS! 🥯
                   </div>
                )}
                {pantryCount === 0 && profile.learnedWords.length > 0 && (
                   <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-gray-400 text-white text-[8px] px-2 py-0.5 rounded-full font-black whitespace-nowrap">
                     I'M SLEEPY... 💤
                   </div>
                )}
              </div>
              <div className="mt-2 text-sm font-black text-blue-900/40 uppercase tracking-widest">
                {points < 500 ? "Egg Stage" : points < 2500 ? "Growing Strong!" : points < 5000 ? "Junior Dragon" : "Ancient Master!"}
              </div>
            </div>

            <h2 className="text-4xl font-bold text-blue-600 mb-2 animate-bounce-slow">Hi, {profile.name}! 🌟</h2>
            <p className="text-xl text-gray-600 mb-6">Explore the islands and become a Language Legend!</p>
            <div className="flex flex-wrap justify-center gap-4">
              <button onClick={() => setShowBadges(true)} className="bg-white px-6 py-3 rounded-2xl shadow-md font-bold text-blue-500 hover:scale-105 transition-all border border-blue-100 flex items-center gap-2">
                My Badges 🏆
              </button>
              <button onClick={() => setShowJournal(true)} className="bg-white px-6 py-3 rounded-2xl shadow-md font-bold text-purple-600 hover:scale-105 transition-all border border-purple-100 flex items-center gap-2">
                My Scrapbook 📓
                {journal.length > 0 && <span className="bg-purple-600 text-white text-[10px] px-2 py-0.5 rounded-full">{journal.length}</span>}
              </button>
              <button onClick={() => setShowLeaderboard(true)} className="bg-white px-6 py-3 rounded-2xl shadow-md font-bold text-green-600 hover:scale-105 transition-all border border-green-100 flex items-center gap-2">
                Leaderboard 📈
              </button>
              {dailyQuest && (
                <button onClick={() => setShowQuestModal(true)} className={`px-6 py-3 rounded-2xl shadow-md font-bold transition-all border flex items-center gap-2 relative ${dailyQuest.isClaimed ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-yellow-400 text-yellow-900 border-yellow-500 hover:scale-105'}`}>
                  Daily Mission 📜
                  {!dailyQuest.isClaimed && dailyQuest.current >= dailyQuest.goal && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full animate-pulse">!</span>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {renderIsland()}
      </main>

      {/* Streak Splash Modal */}
      {showStreakSplash && (
        <div 
          className="fixed inset-0 z-[200] bg-orange-600/30 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-500"
          onClick={() => setShowStreakSplash(false)}
        >
          <div className="bg-white p-12 rounded-[50px] shadow-2xl border-[10px] border-orange-400 text-center animate-level-up-pop max-w-sm">
            <div className="text-9xl mb-6 animate-bounce">🔥</div>
            <h2 className="text-4xl font-black text-orange-600 mb-2">{streak} DAY STREAK!</h2>
            <p className="text-xl font-bold text-gray-500 mb-8 italic">"You are on fire! Teruslah belajar!"</p>
            <div className="bg-orange-50 p-6 rounded-3xl mb-8 border-2 border-orange-100">
               <div className="text-xs font-black text-orange-400 uppercase tracking-widest mb-1">Today's Streak Bonus:</div>
               <div className="text-3xl font-black text-orange-600">+{streak * 25 + 50} ⭐</div>
            </div>
            <button onClick={() => setShowStreakSplash(false)} className="w-full bg-orange-600 text-white py-5 rounded-3xl font-black text-2xl shadow-lg hover:bg-orange-700 active:scale-95 transition-all">LET'S PLAY! 🚀</button>
          </div>
        </div>
      )}

      {/* Explorer Passport Modal (Profile Page) */}
      {showProfileModal && (
        <div 
          className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowProfileModal(false)}
        >
          <div 
            className="bg-white w-full max-w-2xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-[12px] border-blue-500 relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
             <div className="bg-blue-500 p-6 text-white text-center relative">
                <h2 className="text-2xl font-black uppercase tracking-widest">Explorer Passport 🚢</h2>
                <p className="text-xs opacity-80">Paspor Penjelajah</p>
                <button 
                  onClick={() => setShowProfileModal(false)} 
                  className="absolute top-4 right-4 text-white hover:scale-125 transition-all text-2xl"
                >
                  ✕
                </button>
             </div>
             
             <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div className="flex flex-col items-center text-center">
                    {isEditingProfile ? (
                        <div className="w-full space-y-6 animate-in fade-in duration-300">
                             <div className="grid grid-cols-4 gap-3">
                                {AVATARS.map(a => (
                                    <button
                                        key={a.emoji}
                                        onClick={() => setEditAvatar(a.emoji)}
                                        className={`p-3 rounded-2xl border-4 transition-all ${editAvatar === a.emoji ? 'bg-blue-500 border-blue-600 scale-105' : 'bg-gray-50 border-gray-100 grayscale'}`}
                                    >
                                        <span className="text-3xl">{a.emoji}</span>
                                    </button>
                                ))}
                             </div>
                             <input 
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                className="w-full p-4 bg-gray-50 rounded-2xl text-xl font-black text-blue-600 outline-none border-4 border-blue-100 focus:border-blue-400 text-center"
                                placeholder="Change your name..."
                             />
                             <div className="flex gap-4">
                                <button onClick={() => setIsEditingProfile(false)} className="flex-1 bg-gray-100 py-4 rounded-2xl font-black text-gray-400">CANCEL</button>
                                <button onClick={handleUpdateProfile} className="flex-2 bg-green-500 text-white py-4 rounded-2xl font-black text-xl shadow-lg">SAVE CHANGES! ✅</button>
                             </div>
                        </div>
                    ) : (
                        <>
                            <div className="relative group">
                                <div className="w-32 h-32 bg-sky-100 rounded-full flex items-center justify-center text-7xl mb-4 border-4 border-blue-100 shadow-inner animate-character-breathe">
                                    <span className="animate-character-blink block">{profile.avatar}</span>
                                </div>
                                <button 
                                    onClick={startEditMode}
                                    className="absolute bottom-4 right-0 bg-blue-600 text-white w-10 h-10 rounded-full border-4 border-white flex items-center justify-center text-sm shadow-lg hover:scale-110 transition-transform"
                                >
                                    ✏️
                                </button>
                            </div>
                            <h3 className="text-3xl font-black text-blue-600">{profile.name}</h3>
                            <div className="mt-2 bg-orange-100 text-orange-600 px-4 py-1 rounded-full font-black text-sm uppercase">
                                {currentRank}
                            </div>
                            
                            <div className="grid grid-cols-3 gap-4 w-full mt-8">
                                <div className="bg-gray-50 p-4 rounded-3xl">
                                    <div className="text-2xl font-black text-blue-500">{points}</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase">Points ⭐</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-3xl">
                                    <div className="text-2xl font-black text-orange-500">{streak}</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase">Streak 🔥</div>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-3xl">
                                    <div className="text-2xl font-black text-purple-500">{profile.learnedWords.length}</div>
                                    <div className="text-[9px] text-gray-400 font-bold uppercase">Words 📚</div>
                                </div>
                            </div>

                            <div className="w-full mt-10 text-left">
                                <h4 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                                    <span>My Word Collection</span>
                                    <div className="h-px bg-gray-100 flex-1"></div>
                                </h4>
                                {profile.learnedWords.length === 0 ? (
                                    <p className="text-gray-300 italic text-sm text-center py-6">Visit Vocab Island to start your collection!</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {profile.learnedWords.map(word => (
                                            <div 
                                                key={word} 
                                                className="bg-blue-50 px-4 py-2 rounded-2xl text-sm font-bold text-blue-600 border border-blue-100 shadow-sm animate-in zoom-in duration-300"
                                            >
                                                {word}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="w-full mt-10 text-left">
                                <h4 className="text-xs font-black text-gray-400 uppercase mb-4 flex items-center gap-2">
                                    <span>Mastery Overview</span>
                                    <div className="h-px bg-gray-100 flex-1"></div>
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    {Object.entries(mastery).map(([key, val]) => (
                                        <div key={key} className="bg-gray-50 p-3 rounded-2xl flex items-center justify-between">
                                            <span className="text-[10px] font-black text-gray-400 uppercase">{key.replace('_', ' ')}</span>
                                            <div className="flex items-center gap-2">
                                                <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{ width: `${val}%` }}></div>
                                                </div>
                                                <span className="text-[10px] font-black text-blue-600">{val}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => setShowProfileModal(false)}
                                className="mt-10 w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                            >
                                BACK TO ADVENTURE! 🚀
                            </button>
                        </>
                    )}
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Adventure Scrapbook Modal */}
      {showJournal && (
        <div 
          className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowJournal(false)}
        >
           <div 
             className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-[10px] border-purple-500 flex flex-col"
             onClick={(e) => e.stopPropagation()}
           >
              <div className="bg-purple-500 p-6 text-white text-center flex justify-between items-center px-10">
                <h2 className="text-3xl font-black uppercase tracking-widest">My Scrapbook 📓</h2>
                <button onClick={() => setShowJournal(false)} className="text-3xl hover:scale-125 transition-all">✕</button>
              </div>
              <div className="flex-1 overflow-y-auto p-10 bg-[#fdf2f8] bg-[url('https://www.transparenttextures.com/patterns/notebook.png')]">
                {journal.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <span className="text-9xl mb-4">📓</span>
                    <p className="text-2xl font-black text-purple-900">Your book is empty!</p>
                    <p className="text-purple-700 font-bold">Use the Magic Lens or Drawing Island to add pictures.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {journal.map(entry => (
                      <div key={entry.id} className="bg-white p-4 rounded-3xl shadow-xl border-4 border-white rotate-[1deg] hover:rotate-0 transition-transform group">
                        <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden mb-4 relative">
                          {entry.type === 'movie' ? (
                            <video src={entry.data} className="w-full h-full object-cover" controls />
                          ) : (
                            <img src={entry.data} alt={entry.english} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                          )}
                          <div className="absolute top-2 right-2 bg-purple-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase">
                            {entry.type === 'photo' ? '📷 PHOTO' : entry.type === 'movie' ? '🎬 MOVIE' : entry.type === 'tracing' ? '✍️ TRACING' : '🎨 DRAWING'}
                          </div>
                        </div>
                        <div className="text-center">
                          <h4 className="text-2xl font-black text-purple-600 uppercase leading-none">{entry.english}</h4>
                          <p className="text-sm font-bold text-gray-400 mb-2 italic">Artinya: {entry.indonesian}</p>
                          <div className="text-[10px] text-gray-300 font-black">{entry.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
           </div>
        </div>
      )}

      {/* Leaderboard Modal */}
      {showLeaderboard && (
        <div 
          className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowLeaderboard(false)}
        >
          <div 
            className="bg-white w-full max-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-[10px] border-green-500 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-green-500 p-8 text-white text-center relative">
              <h2 className="text-3xl font-black">TOP EXPLORERS 📈</h2>
              <button 
                onClick={() => setShowLeaderboard(false)} 
                className="absolute top-4 right-4 text-white text-3xl hover:scale-125 transition-all"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-8 space-y-4">
              {[...LEADERBOARD_NAMES, profile.name].sort((a, b) => {
                if (a === profile.name) return -1;
                return 0;
              }).map((name, i) => (
                <div key={i} className={`flex items-center justify-between p-4 rounded-2xl ${name === profile.name ? 'bg-green-100 border-2 border-green-500' : 'bg-gray-50'}`}>
                   <div className="flex items-center gap-4">
                      <span className="text-xl font-black text-gray-300">#{i + 1}</span>
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-xl shadow-sm border">
                        {name === profile.name ? profile.avatar : '👦'}
                      </div>
                      <span className={`font-bold ${name === profile.name ? 'text-green-700' : 'text-gray-700'}`}>{name}</span>
                   </div>
                   <div className="font-black text-green-600">{name === profile.name ? points : Math.floor(Math.random() * points + 500)} ⭐</div>
                </div>
              ))}
              <button onClick={() => setShowLeaderboard(false)} className="w-full mt-6 bg-green-500 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-green-600 active:scale-95 transition-all">BACK TO ISLANDS 🏝️</button>
            </div>
          </div>
        </div>
      )}

      {/* Daily Quest Modal */}
      {showQuestModal && dailyQuest && (
        <div 
          className="fixed inset-0 z-[160] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowQuestModal(false)}
        >
          <div 
            className="bg-white w-full max-md rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-8 border-yellow-400 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-yellow-400 p-8 text-yellow-900 text-center">
              <h2 className="text-3xl font-black uppercase tracking-tight">Today's Mission 📜</h2>
            </div>
            <div className="p-8 text-center">
              <div className="text-6xl mb-4 animate-character-breathe">✨</div>
              <h3 className="text-2xl font-black text-blue-600 mb-1">{dailyQuest.title}</h3>
              <p className="text-gray-500 font-bold mb-6">{dailyQuest.idnTitle}</p>
              <div className="bg-gray-50 p-6 rounded-3xl mb-8">
                <div className="flex justify-between text-sm font-black mb-2 uppercase text-gray-400">
                  <span>Progress</span>
                  <span>{dailyQuest.current} / {dailyQuest.goal}</span>
                </div>
                <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500" style={{ width: `${(dailyQuest.current / dailyQuest.goal) * 100}%` }} />
                </div>
              </div>
              {dailyQuest.isClaimed ? <div className="text-green-600 font-black text-xl bg-green-50 py-4 rounded-2xl">COMPLETED! ✅</div> : dailyQuest.current >= dailyQuest.goal ? <button onClick={claimDailyReward} className="w-full bg-green-500 text-white py-4 rounded-2xl font-black text-xl shadow-xl animate-bounce">CLAIM {dailyQuest.reward} POINTS!</button> : <button onClick={() => setShowQuestModal(false)} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black text-xl shadow-xl">LET'S GO! 🚀</button>}
            </div>
            <button onClick={() => setShowQuestModal(false)} className="absolute top-4 right-4 text-yellow-900/40 hover:text-yellow-900 transition-colors">✕</button>
          </div>
        </div>
      )}

      {rewardMsg && <div className="fixed bottom-10 right-10 bg-white border-4 border-yellow-400 p-4 rounded-3xl shadow-2xl animate-reward-toast z-[100] flex items-center gap-3"><span className="text-3xl animate-character-breathe">⭐</span><div><div className="font-black text-yellow-600 text-lg">+{rewardMsg.points} Points!</div><div className="text-sm text-gray-500 font-bold">{rewardMsg.text}</div></div></div>}
      
      {levelUp && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-blue-600/20 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-white p-12 rounded-[50px] shadow-[0_0_100px_rgba(255,255,255,0.5)] border-8 border-yellow-400 text-center animate-level-up-pop">
            <div className="text-9xl mb-4 animate-bounce">🎉</div>
            <h1 className="text-6xl font-black text-blue-600 mb-2">LEVEL {currentLevel}!</h1>
            <h2 className="text-3xl font-bold text-orange-500 uppercase tracking-widest">RANK: {currentRank}</h2>
            <p className="mt-4 text-gray-500 font-bold">You're getting so good! 🐻✨</p>
          </div>
        </div>
      )}

      {showBadges && (
        <div className="fixed inset-0 z-[150] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowBadges(false)}>
          <div className="bg-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative" onClick={(e) => e.stopPropagation()}>
            <div className="bg-blue-500 p-8 text-white flex justify-between items-center">
              <h2 className="text-3xl font-black">My Trophy Room 🏆</h2>
              <button onClick={() => setShowBadges(false)} className="text-4xl hover:scale-125 transition-all">✕</button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              {badges.map(badge => (
                <div key={badge.id} className={`flex flex-col items-center text-center p-4 rounded-3xl border-2 transition-all ${badge.unlocked ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-100 grayscale opacity-40'}`}>
                  <span className="text-5xl mb-2">{badge.icon}</span>
                  <div className="font-bold text-blue-800">{badge.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{badge.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setIsMuted(!isMuted)} className="fixed bottom-6 left-6 w-14 h-14 bg-white/80 backdrop-blur rounded-full shadow-lg border-4 border-blue-400 flex items-center justify-center text-2xl z-[100] hover:scale-110 active:scale-95 transition-all">
        {isMuted ? "🔇" : "🔊"}
      </button>

      {/* Credit Footer */}
      <footer className="relative z-20 py-8 flex flex-col items-center justify-center gap-4 opacity-40 hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-6">
          <a href="https://github.com/mrbrightsides" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <svg height="28" width="28" viewBox="0 0 16 16" className="text-blue-600"><path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
          </a>
          <a href="https://rantai.elpeef.com" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform">
            <span className="text-3xl text-blue-500">🌐</span>
          </a>
        </div>
        <p className="text-[10px] font-black text-blue-900/30 uppercase tracking-widest">Adventure Crafted by Toby's Friends</p>
      </footer>
      
      <style>{`
        @keyframes level-up-pop { 0% { transform: scale(0.5) rotate(-10deg); opacity: 0; } 70% { transform: scale(1.1) rotate(5deg); } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .animate-level-up-pop { animation: level-up-pop 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        @keyframes reward-toast { 0% { transform: translateX(100%) scale(0.5); opacity: 0; } 20% { transform: translateX(0) scale(1.1); opacity: 1; } 30% { transform: translateX(0) scale(1); } 80% { transform: translateX(0) opacity: 1; } 100% { transform: translateX(100%) opacity: 0; } }
        .animate-reward-toast { animation: reward-toast 3s ease-in-out forwards; }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
          50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
        }
        .animate-bounce-slow { animation: bounce-slow 2s infinite; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};

const OnboardingScreen: React.FC<{ onComplete: (profile: UserProfile) => void }> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('🐯');
  const [step, setStep] = useState(1);

  const handleFinish = () => {
    if (!name.trim()) return;
    onComplete({
      name: name.trim(),
      avatar,
      title: 'Little Scout',
      joinedDate: new Date().toISOString(),
      learnedWords: [],
      eatenWords: [],
      tutorialComplete: false
    });
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 font-['Quicksand'] relative overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20 flex flex-wrap gap-20 p-10 pointer-events-none">
        {AVATARS.map((a, i) => (
          <span key={i} className="text-8xl animate-character-breathe" style={{ animationDelay: `${i * 0.5}s` }}>
            <span className="animate-character-blink block">{a.emoji}</span>
          </span>
        ))}
      </div>
      
      <div className="bg-white w-full max-w-lg rounded-[50px] shadow-2xl p-10 text-center relative z-10 border-8 border-white">
        {step === 1 ? (
          <div className="animate-in slide-in-from-right duration-500">
            <h1 className="text-4xl font-black text-blue-600 mb-2">AHOY, EXPLORER! 🚢</h1>
            <p className="text-gray-500 font-bold mb-8 italic">What is your name? (Siapa namamu?)</p>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name here..."
              className="w-full p-6 bg-sky-50 rounded-3xl text-2xl font-black text-blue-700 outline-none border-4 border-transparent focus:border-blue-400 transition-all text-center placeholder:opacity-30"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && name.trim() && setStep(2)}
            />
            <button 
              disabled={!name.trim()}
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-blue-600 text-white py-5 rounded-3xl font-black text-2xl shadow-xl hover:bg-blue-700 disabled:opacity-30 disabled:translate-y-0 active:scale-95 transition-all"
            >
              NEXT (SELANJUTNYA) ➡️
            </button>
          </div>
        ) : (
          <div className="animate-in slide-in-from-right duration-500">
            <h1 className="text-3xl font-black text-blue-600 mb-2">CHOOSE AN AVATAR! 🐻</h1>
            <p className="text-gray-500 font-bold mb-8 italic">Pick your character (Pilih karaktermu)</p>
            <div className="grid grid-cols-4 gap-4 mb-8">
              {AVATARS.map(a => (
                <button
                  key={a.emoji}
                  onClick={() => setAvatar(a.emoji)}
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center border-4 transition-all ${avatar === a.emoji ? 'bg-blue-500 border-blue-600 scale-110 shadow-lg' : 'bg-gray-50 border-gray-100 grayscale hover:grayscale-0'}`}
                >
                  <span className="text-4xl animate-character-breathe">
                    <span className="animate-character-blink block">{a.emoji}</span>
                  </span>
                  <span className={`text-[8px] font-bold mt-1 ${avatar === a.emoji ? 'text-white' : 'text-gray-400'}`}>{a.name}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-500 py-4 rounded-3xl font-black text-lg hover:bg-gray-200 transition-all"
              >
                BACK
              </button>
              <button 
                onClick={handleFinish}
                className="flex-2 bg-green-500 text-white py-4 px-8 rounded-3xl font-black text-xl shadow-xl hover:bg-green-600 active:scale-95 transition-all"
              >
                START ADVENTURE! 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const IslandCard: React.FC<{ 
  title: string; 
  subtitle: string; 
  icon: string; 
  color: string; 
  description: string; 
  onClick: () => void;
  mastery: IslandMastery;
}> = ({ title, subtitle, icon, color, description, onClick, mastery }) => (
  <div 
    onClick={onClick}
    className="bg-white rounded-[40px] shadow-xl overflow-hidden cursor-pointer hover:scale-105 transition-all border-4 border-transparent hover:border-blue-200 group relative"
  >
    <div className={`${color} p-8 flex items-center justify-center relative overflow-hidden`}>
      <div className="text-8xl group-hover:rotate-12 group-hover:scale-110 transition-transform relative z-10 animate-character-breathe">
        <span className="animate-character-blink block">{icon}</span>
      </div>
      <div className="absolute bottom-0 right-0 p-4 opacity-10 text-9xl transform translate-x-1/4 translate-y-1/4">
        {icon}
      </div>
    </div>
    <div className="p-6 text-center">
      <h3 className="text-2xl font-black text-gray-800 leading-tight">{title}</h3>
      <p className="text-gray-400 font-bold text-sm mb-4">{subtitle}</p>
      <p className="text-xs text-gray-500 mb-6 font-medium italic">"{description}"</p>
      
      <div className="flex items-center gap-3">
        <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
          <div className={`h-full ${mastery.color} transition-all duration-1000`} style={{ width: `${mastery.percent}%` }} />
        </div>
        <div className="text-[10px] font-black text-gray-400 uppercase">{mastery.level}</div>
      </div>
    </div>
    {mastery.percent >= 100 && <div className="absolute top-4 right-4 bg-yellow-400 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg animate-bounce">👑</div>}
  </div>
);

const InteractiveWater: React.FC = () => (
  <div className="w-full h-full relative opacity-40 overflow-hidden pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <div 
        key={i}
        className="absolute bg-white/20 rounded-full animate-float-slow"
        style={{
          width: `${Math.random() * 200 + 50}px`,
          height: `${Math.random() * 200 + 50}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          animationDelay: `${Math.random() * 5}s`,
          animationDuration: `${10 + Math.random() * 20}s`
        }}
      />
    ))}
  </div>
);

export default App;
