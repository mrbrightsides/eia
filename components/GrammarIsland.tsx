
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface GrammarIslandProps {
  onBack: () => void;
  addPoints: (amount: number, reason: string) => void;
}

interface Question {
  id: number;
  type: 'mcq';
  question: string;
  options: string[];
  answer: string;
  story?: string;
}

const SIMPLE_PRESENT_QUESTIONS: Question[] = [
  // Section 1: Sarah's Story (Reading Comprehension)
  {
    id: 1,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "What time does Sarah wake up in the morning?",
    options: ["6:00 AM", "6:15 AM", "6:30 AM", "7:00 AM"],
    answer: "6:30 AM"
  },
  {
    id: 2,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "How does Sarah go to work?",
    options: ["By car", "By bus", "By bike", "On foot"],
    answer: "By bus"
  },
  {
    id: 3,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "What does Sarah usually have for breakfast?",
    options: ["Toast and coffee", "Eggs and milk", "Cereal and juice", "Fruit and tea"],
    answer: "Toast and coffee"
  },
  {
    id: 4,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "Does Sarah enjoy her job? Why or why not?",
    options: [
      "No, she hates her job.",
      "Yes, because she works with friendly colleagues.",
      "No, she wants to be a doctor.",
      "Yes, because she likes the office building."
    ],
    answer: "Yes, because she works with friendly colleagues."
  },
  {
    id: 5,
    type: 'mcq',
    story: "Every morning, Sarah wakes up at 6:30 AM. She gets out of bed and goes to the kitchen to prepare breakfast. She usually has toast and coffee for breakfast. After eating, she goes to work by bus. Sarah works in an office from 9:00 AM to 5:00 PM. She enjoys her job because she works with friendly colleagues. In the evening, Sarah likes to relax by reading a book or watching TV. She goes to bed at around 10:00 PM.",
    question: "What does Sarah do in the evening?",
    options: [
      "She goes to the gym.",
      "She works overtime.",
      "She likes to relax by reading a book or watching TV.",
      "She goes out with friends."
    ],
    answer: "She likes to relax by reading a book or watching TV."
  },
  {
    id: 6,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "6. Every weekend, Jack ___ to the gym to stay healthy.",
    options: ["go", "goes"],
    answer: "goes"
  },
  {
    id: 7,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "7. He ___ up at 7:00 AM on Saturdays and Sundays.",
    options: ["wake", "wakes"],
    answer: "wakes"
  },
  {
    id: 8,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "8. After he ___ his breakfast...",
    options: ["finish", "finishes"],
    answer: "finishes"
  },
  {
    id: 9,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "9. ...he ___ to the gym.",
    options: ["drive", "drives"],
    answer: "drives"
  },
  {
    id: 10,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "10. He ___ out for an hour...",
    options: ["work", "works"],
    answer: "works"
  },
  {
    id: 11,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "11. ...and then he ___ a shower.",
    options: ["take", "takes"],
    answer: "takes"
  },
  {
    id: 12,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "12. After the gym, Jack ___ home...",
    options: ["go", "goes"],
    answer: "goes"
  },
  {
    id: 13,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "13. ...and ___ by watching TV or reading a book.",
    options: ["relax", "relaxes"],
    answer: "relaxes"
  },
  {
    id: 14,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "14. On Sundays, he ___ his friends for lunch...",
    options: ["meet", "meets"],
    answer: "meets"
  },
  {
    id: 15,
    type: 'mcq',
    story: "Every weekend, Jack ___ to the gym to stay healthy. He ___ up at 7:00 AM on Saturdays and Sundays. After he ___ his breakfast, he ___ to the gym. He ___ out for an hour and then he ___ a shower. After the gym, Jack ___ home and ___ by watching TV or reading a book. On Sundays, he ___ his friends for lunch at a restaurant. They ___ about their week and have a great time together.",
    question: "15. They ___ about their week...",
    options: ["talk", "talks"],
    answer: "talk"
  },
  {
    id: 16,
    type: 'mcq',
    question: "Which sentence is in the present tense?",
    options: ["She is studying now.", "She studied yesterday.", "She studies every day.", "She will study tomorrow."],
    answer: "She studies every day."
  },
  {
    id: 17,
    type: 'mcq',
    question: "Choose the correct form of the verb: “My brother __ (like) to play soccer.”",
    options: ["likes", "like", "liking", "is liking"],
    answer: "likes"
  },
  {
    id: 18,
    type: 'mcq',
    question: "Choose the correct sentence:",
    options: ["She don’t like coffee.", "She doesn’t like coffee.", "She doesn’t likes coffee.", "She don’t likes coffee."],
    answer: "She doesn’t like coffee."
  },
  {
    id: 19,
    type: 'mcq',
    question: "Complete the sentence: “I __ (go) to the park every Saturday.”",
    options: ["goes", "going", "go", "gone"],
    answer: "go"
  },
  {
    id: 20,
    type: 'mcq',
    question: "Choose the correct sentence:",
    options: ["They plays basketball every Sunday.", "They play basketball every Sunday.", "They play basketball every Sundays.", "They playing basketball every Sunday."],
    answer: "They play basketball every Sunday."
  },
  {
    id: 21,
    type: 'mcq',
    question: "I __ to school by bus every day.",
    options: ["go", "goes", "going", "gone"],
    answer: "go"
  },
  {
    id: 22,
    type: 'mcq',
    question: "She __ to the gym in the evening.",
    options: ["go", "goes", "going", "gone"],
    answer: "goes"
  },
  {
    id: 23,
    type: 'mcq',
    question: "They __ soccer every weekend.",
    options: ["plays", "play", "playing", "played"],
    answer: "play"
  },
  {
    id: 24,
    type: 'mcq',
    question: "We __ TV every night.",
    options: ["watch", "watches", "watching", "watched"],
    answer: "watch"
  },
  {
    id: 25,
    type: 'mcq',
    question: "He __ his homework every afternoon.",
    options: ["does", "do", "doing", "did"],
    answer: "does"
  },
  {
    id: 26,
    type: 'mcq',
    question: "She __ her friends at the park.",
    options: ["meet", "meets", "meeting", "met"],
    answer: "meets"
  },
  {
    id: 27,
    type: 'mcq',
    question: "I __ like to read books.",
    options: ["don’t", "doesn’t", "do", "does"],
    answer: "don’t"
  },
  {
    id: 28,
    type: 'mcq',
    question: "They __ to the beach every summer.",
    options: ["go", "goes", "going", "gone"],
    answer: "go"
  },
  {
    id: 29,
    type: 'mcq',
    question: "He __ breakfast at 7:00 AM.",
    options: ["eat", "eats", "eating", "eaten"],
    answer: "eats"
  },
  {
    id: 30,
    type: 'mcq',
    question: "We __ to the gym twice a week.",
    options: ["goes", "go", "going", "gone"],
    answer: "go"
  },
  {
    id: 31,
    type: 'mcq',
    question: "Sarah __ her homework now.",
    options: ["do", "does", "is doing", "doing"],
    answer: "does"
  },
  {
    id: 32,
    type: 'mcq',
    question: "My parents __ to the market every Saturday.",
    options: ["goes", "going", "go", "gone"],
    answer: "go"
  },
  {
    id: 33,
    type: 'mcq',
    question: "I __ my teeth after breakfast.",
    options: ["brush", "brushes", "brushing", "brushed"],
    answer: "brush"
  },
  {
    id: 34,
    type: 'mcq',
    question: "She __ a book in the evening.",
    options: ["read", "reads", "reading", "readed"],
    answer: "reads"
  },
  {
    id: 35,
    type: 'mcq',
    question: "We __ coffee every morning.",
    options: ["drink", "drinks", "drinking", "drank"],
    answer: "drink"
  },
  {
    id: 36,
    type: 'mcq',
    question: "He __ at 9:00 AM every day.",
    options: ["wake", "wakes", "waking", "woke"],
    answer: "wakes"
  },
  {
    id: 37,
    type: 'mcq',
    question: "You __ very fast.",
    options: ["runs", "run", "running", "ran"],
    answer: "run"
  },
  {
    id: 38,
    type: 'mcq',
    question: "She __ to music every evening.",
    options: ["listen", "listens", "listening", "listened"],
    answer: "listens"
  },
  {
    id: 39,
    type: 'mcq',
    question: "I __ my phone in the bag.",
    options: ["put", "puts", "putting", "putted"],
    answer: "put"
  },
  {
    id: 40,
    type: 'mcq',
    question: "He __ to the office by car.",
    options: ["drive", "drives", "driving", "driven"],
    answer: "drives"
  },
  {
    id: 41,
    type: 'mcq',
    question: "They __ lunch at noon.",
    options: ["have", "has", "having", "had"],
    answer: "have"
  },
  {
    id: 42,
    type: 'mcq',
    question: "She __ a shower every morning.",
    options: ["take", "takes", "taking", "taken"],
    answer: "takes"
  },
  {
    id: 43,
    type: 'mcq',
    question: "My brother __ football with his friends.",
    options: ["play", "plays", "playing", "played"],
    answer: "plays"
  },
  {
    id: 44,
    type: 'mcq',
    question: "We __ our lessons in the afternoon.",
    options: ["study", "studies", "studying", "studied"],
    answer: "study"
  },
  {
    id: 45,
    type: 'mcq',
    question: "You __ always on time.",
    options: ["are", "is", "am", "be"],
    answer: "are"
  },
  {
    id: 46,
    type: 'mcq',
    question: "The teacher __ the lesson every day.",
    options: ["teach", "teaches", "teaching", "taught"],
    answer: "teaches"
  },
  {
    id: 47,
    type: 'mcq',
    question: "They __ to the zoo every summer.",
    options: ["goes", "go", "going", "gone"],
    answer: "go"
  },
  {
    id: 48,
    type: 'mcq',
    question: "She __ the piano very well.",
    options: ["plays", "play", "playing", "played"],
    answer: "plays"
  },
  {
    id: 49,
    type: 'mcq',
    question: "He __ a cup of tea every morning.",
    options: ["drink", "drinks", "drinking", "drank"],
    answer: "drinks"
  },
  {
    id: 50,
    type: 'mcq',
    question: "I __ my homework after school.",
    options: ["do", "does", "doing", "did"],
    answer: "do"
  }
];

const PRESENT_CONTINUOUS_QUESTIONS: Question[] = [
  { id: 101, type: 'mcq', question: "She ____ (read) a book right now.", options: ["is reading", "are reading", "reading"], answer: "is reading" },
  { id: 102, type: 'mcq', question: "They ____ (play) football at the moment.", options: ["are playing", "is playing", "play"], answer: "are playing" },
  { id: 103, type: 'mcq', question: "I ____ (watch) TV now.", options: ["is watching", "am watching", "watching"], answer: "am watching" },
  { id: 104, type: 'mcq', question: "He ____ (cook) dinner this evening.", options: ["are cooking", "is cooking", "cooks"], answer: "is cooking" },
  { id: 105, type: 'mcq', question: "We ____ (study) for the exam currently.", options: ["is studying", "are studying", "study"], answer: "are studying" },
  { id: 106, type: 'mcq', question: "The cat ____ (sleep) on the couch.", options: ["are sleeping", "is sleeping", "sleeps"], answer: "is sleeping" },
  { id: 107, type: 'mcq', question: "You ____ (write) an email right now.", options: ["are writing", "is writing", "writes"], answer: "are writing" },
  { id: 108, type: 'mcq', question: "It ____ (rain) heavily today.", options: ["is raining", "are raining", "rains"], answer: "is raining" },
  { id: 109, type: 'mcq', question: "My parents ____ (travel) to Japan this week.", options: ["is traveling", "are traveling", "travel"], answer: "are traveling" },
  { id: 110, type: 'mcq', question: "I ____ (work) from home today.", options: ["is working", "am working", "are working"], answer: "am working" },
  { id: 111, type: 'mcq', question: "She ____ (run) in the park now.", options: ["is running", "are running", "runs"], answer: "is running" },
  { id: 112, type: 'mcq', question: "The children ____ (play) in the garden.", options: ["are playing", "is playing", "plays"], answer: "are playing" },
  { id: 113, type: 'mcq', question: "He ____ (not talk) to me at the moment.", options: ["is not talking", "are not talking", "not talk"], answer: "is not talking" },
  { id: 114, type: 'mcq', question: "We ____ (visit) our grandparents this weekend.", options: ["is visiting", "are visiting", "visits"], answer: "are visiting" },
  { id: 115, type: 'mcq', question: "They ____ (build) a new house this year.", options: ["are building", "is building", "build"], answer: "are building" },
  { id: 116, type: 'mcq', question: "I ____ (not eat) lunch right now.", options: ["is not eating", "am not eating", "not eating"], answer: "am not eating" },
  { id: 117, type: 'mcq', question: "She ____ (wait) for the bus at the moment.", options: ["are waiting", "is waiting", "waits"], answer: "is waiting" },
  { id: 118, type: 'mcq', question: "We ____ (have) a meeting right now.", options: ["are having", "is having", "has"], answer: "are having" },
  { id: 119, type: 'mcq', question: "The dog ____ (bark) outside.", options: ["is barking", "are barking", "barks"], answer: "is barking" },
  { id: 120, type: 'mcq', question: "They ____ (clean) the house today.", options: ["is cleaning", "are cleaning", "cleans"], answer: "are cleaning" },
  { id: 121, type: 'mcq', question: "I ____ (wait) for you at the coffee shop.", options: ["am waiting", "is waiting", "are waiting"], answer: "am waiting" },
  { id: 122, type: 'mcq', question: "She ____ (not work) at the moment.", options: ["is not working", "are not working", "not work"], answer: "is not working" },
  { id: 123, type: 'mcq', question: "We ____ (watch) a movie tonight.", options: ["are watching", "is watching", "watches"], answer: "are watching" },
  { id: 124, type: 'mcq', question: "The teacher ____ (teach) a new lesson.", options: ["is teaching", "are teaching", "teaches"], answer: "is teaching" },
  { id: 125, type: 'mcq', question: "They ____ (fix) the car this morning.", options: ["is fixing", "are fixing", "fixes"], answer: "are fixing" },
  { id: 126, type: 'mcq', question: "The students ____ (study) in the library now.", options: ["are studying", "is studying", "studies"], answer: "are studying" },
  { id: 127, type: 'mcq', question: "He ____ (talk) on the phone right now.", options: ["is talking", "are talking", "talks"], answer: "is talking" },
  { id: 128, type: 'mcq', question: "I ____ (not go) to the gym today.", options: ["am not going", "is not going", "are not going"], answer: "am not going" },
  { id: 129, type: 'mcq', question: "We ____ (travel) to Bali next week.", options: ["are traveling", "is traveling", "travels"], answer: "are traveling" },
  { id: 130, type: 'mcq', question: "You ____ (not listen) to me at the moment.", options: ["are not listening", "is not listening", "not listening"], answer: "are not listening" }
];

const SIMPLE_PAST_QUESTIONS: Question[] = [
  { id: 201, type: 'mcq', question: "I ____ (visit) my grandmother last Sunday.", options: ["visit", "visited", "visiting"], answer: "visited" },
  { id: 202, type: 'mcq', question: "They ____ (go) to the cinema last night.", options: ["go", "goes", "went"], answer: "went" },
  { id: 203, type: 'mcq', question: "She ____ (eat) pizza for dinner yesterday.", options: ["eat", "ate", "eaten"], answer: "ate" },
  { id: 204, type: 'mcq', question: "We ____ (not / play) football last weekend.", options: ["didn't play", "didn't played", "don't play"], answer: "didn't play" },
  { id: 205, type: 'mcq', question: "____ you (see) that movie yesterday?", options: ["Do / see", "Did / saw", "Did / see"], answer: "Did / see" },
  { id: 206, type: 'mcq', question: "The cat ____ (sleep) all day yesterday.", options: ["sleep", "sleept", "slept"], answer: "slept" },
  { id: 207, type: 'mcq', question: "He ____ (buy) a new car last month.", options: ["buy", "bought", "buyed"], answer: "bought" },
  { id: 208, type: 'mcq', question: "I ____ (study) very hard for the test.", options: ["study", "studied", "studies"], answer: "studied" },
  { id: 209, type: 'mcq', question: "They ____ (be) late for the meeting.", options: ["was", "were", "are"], answer: "were" },
  { id: 210, type: 'mcq', question: "It ____ (rain) a lot last week.", options: ["rain", "rained", "rains"], answer: "rained" },
  { id: 211, type: 'mcq', question: "Sarah ____ (write) a letter to her friend.", options: ["write", "wrote", "written"], answer: "wrote" },
  { id: 212, type: 'mcq', question: "We ____ (clean) the house together.", options: ["clean", "cleaned", "cleans"], answer: "cleaned" },
  { id: 213, type: 'mcq', question: "He ____ (not / speak) to me yesterday.", options: ["didn't speak", "doesn't speak", "didn't spoke"], answer: "didn't speak" },
  { id: 214, type: 'mcq', question: "The children ____ (drink) all the juice.", options: ["drink", "drunk", "drank"], answer: "drank" },
  { id: 215, type: 'mcq', question: "Where ____ they (go) for vacation?", options: ["did / went", "did / go", "do / go"], answer: "did / go" },
  { id: 216, type: 'mcq', question: "I ____ (finish) my work two hours ago.", options: ["finish", "finished", "finishes"], answer: "finished" },
  { id: 217, type: 'mcq', question: "She ____ (lose) her keys yesterday.", options: ["lose", "lost", "losed"], answer: "lost" },
  { id: 218, type: 'mcq', question: "My father ____ (cook) a delicious meal.", options: ["cook", "cooked", "cooks"], answer: "cooked" },
  { id: 219, type: 'mcq', question: "The train ____ (leave) at 7:00 AM.", options: ["leave", "left", "leaved"], answer: "left" },
  { id: 220, type: 'mcq', question: "They ____ (watch) a scary movie.", options: ["watch", "watched", "watching"], answer: "watched" },
  { id: 221, type: 'mcq', question: "I ____ (see) a ghost last night!", options: ["see", "saw", "seen"], answer: "saw" },
  { id: 222, type: 'mcq', question: "She ____ (not / like) the food at the party.", options: ["didn't like", "didn't liked", "don't like"], answer: "didn't like" },
  { id: 223, type: 'mcq', question: "We ____ (take) many photos on the trip.", options: ["take", "took", "taken"], answer: "took" },
  { id: 224, type: 'mcq', question: "He ____ (break) his leg while skiing.", options: ["break", "broke", "broken"], answer: "broke" },
  { id: 225, type: 'mcq', question: "____ the teacher (give) us homework?", options: ["Did / gave", "Did / give", "Do / give"], answer: "Did / give" },
  { id: 226, type: 'mcq', question: "The birds ____ (fly) south for the winter.", options: ["fly", "flied", "flew"], answer: "flew" },
  { id: 227, type: 'mcq', question: "She ____ (understand) the lesson well.", options: ["understand", "understood", "understands"], answer: "understood" },
  { id: 228, type: 'mcq', question: "I ____ (forget) my umbrella at home.", options: ["forget", "forgot", "forgotten"], answer: "forgot" },
  { id: 229, type: 'mcq', question: "They ____ (win) the game yesterday.", options: ["win", "won", "wins"], answer: "won" },
  { id: 230, type: 'mcq', question: "He ____ (tell) me a secret.", options: ["tell", "telled", "told"], answer: "told" }
];

type GrammarTopic = 'simplePresent' | 'presentContinuous' | 'simplePast';

const TOPIC_QUESTIONS: Record<GrammarTopic, Question[]> = {
  simplePresent: SIMPLE_PRESENT_QUESTIONS,
  presentContinuous: PRESENT_CONTINUOUS_QUESTIONS,
  simplePast: SIMPLE_PAST_QUESTIONS
};


interface GrammarMastery {
  simplePresent: number;
  presentContinuous: number;
  simplePast: number;
}

const STUDY_CONTENT = {
  simplePresent: {
    title: "Simple Present Tense 📚",
    tips: [
      {
        title: "1. Affirmative (Positif)",
        description: "Digunakan untuk menyatakan kebiasaan atau fakta umum.",
        pattern: "Subject + Verb 1 (+ s/es for he/she/it)",
        examples: [
          "I play soccer every Sunday.",
          "She eats an apple in the morning.",
          "They study English together."
        ],
        icon: "✅"
      },
      {
        title: "2. Negative (Negatif)",
        description: "Gunakan 'do not' (don't) atau 'does not' (doesn't) diikuti kata kerja dasar.",
        pattern: "Subject + don't/doesn't + Verb 1",
        examples: [
          "I don't play soccer on Mondays.",
          "He doesn't eat spicy food.",
          "We don't watch TV late at night."
        ],
        icon: "❌"
      },
      {
        title: "3. Interrogative (Tanya)",
        description: "Awali kalimat dengan 'Do' atau 'Does', lalu gunakan kata kerja dasar.",
        pattern: "Do/Does + Subject + Verb 1?",
        examples: [
          "Do you like coffee?",
          "Does she speak Indonesian?",
          "Do they live in Jakarta?"
        ],
        icon: "❓"
      },
      {
        title: "4. The 's/es' Rules (He/She/It)",
        description: "Ingat! Tambahkan s/es hanya jika subjeknya He, She, atau It.",
        rules: [
          "Umum: Tambahkan -s (walk -> walks, eat -> eats)",
          "Akhiran o, ch, sh, x, ss: Tambahkan -es (go -> goes, watch -> watches, wash -> washes)",
          "Konsonan + y: Ubah y menjadi i + es (study -> studies, fly -> flies)"
        ],
        icon: "✏️"
      }
    ]
  },
  presentContinuous: {
    title: "Present Continuous Tense ⏳",
    tips: [
      {
        title: "1. Affirmative (Positif)",
        description: "Digunakan untuk kejadian yang sedang berlangsung sekarang atau rencana masa depan yang pasti.",
        pattern: "Subject + am/is/are + Verb-ing",
        examples: [
          "I am reading a book right now.",
          "She is studying for her exam.",
          "They are playing football in the garden."
        ],
        icon: "✅"
      },
      {
        title: "2. Negative (Negatif)",
        description: "Tambahkan 'not' setelah to-be (am/is/are).",
        pattern: "Subject + am/is/are + not + Verb-ing",
        examples: [
          "I am not watching TV.",
          "He is not (isn't) listening to me.",
          "We are not (aren't) điing anything."
        ],
        icon: "❌"
      },
      {
        title: "3. Interrogative (Tanya)",
        description: "Pindahkan to-be (am/is/are) ke depan kalimat.",
        pattern: "Am/Is/Are + Subject + Verb-ing?",
        examples: [
          "Are you listening to me?",
          "Is she cooking dinner?",
          "What are they doing?"
        ],
        icon: "❓"
      },
      {
        title: "4. Time Indicators",
        description: "Kata-kata yang sering muncul di Present Continuous.",
        rules: [
          "Now, Right now, At the moment",
          "Today, This week, This month",
          "Currently, Look!, Listen!"
        ],
        icon: "⏰"
      }
    ]
  },
  simplePast: {
    title: "Simple Past Tense 🕰️",
    tips: [
      {
        title: "1. Affirmative (Positif)",
        description: "Digunakan untuk kejadian yang sudah selesai di masa lampau.",
        pattern: "Subject + Verb 2 (Regular -ed / Irregular)",
        examples: [
          "I visited my grandma yesterday.",
          "She went to Paris last year.",
          "They watched a movie last night."
        ],
        icon: "✅"
      },
      {
        title: "2. Negative (Negatif)",
        description: "Gunakan 'did not' (didn't) diikuti kata kerja dasar (Verb 1).",
        pattern: "Subject + didn't + Verb 1",
        examples: [
          "I didn't play soccer yesterday.",
          "He didn't eat breakfast this morning.",
          "We didn't go to the party."
        ],
        icon: "❌"
      },
      {
        title: "3. Interrogative (Tanya)",
        description: "Awali dengan 'Did', lalu gunakan kata kerja dasar (Verb 1).",
        pattern: "Did + Subject + Verb 1?",
        examples: [
          "Did you sleep well last night?",
          "Did she finish her homework?",
          "Where did they go?"
        ],
        icon: "❓"
      },
      {
        title: "4. Regular vs Irregular",
        description: "Hati-hati dengan perubahan kata kerja!",
        rules: [
          "Regular: Tambahkan -ed (play -> played, walk -> walked)",
          "Irregular: Berubah total (go -> went, see -> saw, buy -> bought, eat -> ate)",
          "Time Words: Yesterday, Last night, Two days ago, In 2022"
        ],
        icon: "📖"
      }
    ]
  }
};

const SIMPLE_PAST_VERBS = {
  regular: [
    { v1: 'walk', v2: 'walked', meaning: 'berjalan' },
    { v1: 'play', v2: 'played', meaning: 'bermain' },
    { v1: 'visit', v2: 'visited', meaning: 'mengunjungi' },
    { v1: 'study', v2: 'studied', meaning: 'belajar' },
    { v1: 'clean', v2: 'cleaned', meaning: 'membersihkan' },
    { v1: 'wash', v2: 'washed', meaning: 'mencuci' },
    { v1: 'cook', v2: 'cooked', meaning: 'memasak' },
    { v1: 'watch', v2: 'watched', meaning: 'menonton' },
  ],
  irregularCategories: [
    {
      name: "1. Tidak berubah sama sekali",
      description: "Tulisan & pengucapan tetap",
      verbs: [
        { v1: 'cut', v2: 'cut', meaning: 'memotong' },
        { v1: 'put', v2: 'put', meaning: 'meletakkan' },
        { v1: 'hit', v2: 'hit', meaning: 'memukul' },
        { v1: 'shut', v2: 'shut', meaning: 'menutup' },
        { v1: 'let', v2: 'let', meaning: 'membiarkan' },
        { v1: 'set', v2: 'set', meaning: 'mengatur' },
        { v1: 'cost', v2: 'cost', meaning: 'berbiaya' },
        { v1: 'hurt', v2: 'hurt', meaning: 'melukai' },
        { v1: 'bet', v2: 'bet', meaning: 'bertaruh' },
        { v1: 'burst', v2: 'burst', meaning: 'meledak' },
      ]
    },
    {
      name: "2. Tulisan sama, pengucapan beda",
      description: "Contoh: read /ri:d/ -> /red/",
      verbs: [
        { v1: 'read', v2: 'read', meaning: 'membaca' },
      ]
    },
    {
      name: "3. Akhiran berubah jadi -t",
      description: "Bunyi 'd' atau vokal berubah ke 't'",
      verbs: [
        { v1: 'spend', v2: 'spent', meaning: 'menghabiskan' },
        { v1: 'send', v2: 'sent', meaning: 'mengirim' },
        { v1: 'build', v2: 'built', meaning: 'membangun' },
        { v1: 'lend', v2: 'lent', meaning: 'meminjamkan' },
        { v1: 'bend', v2: 'bent', meaning: 'membengkokkan' },
        { v1: 'feel', v2: 'felt', meaning: 'merasa' },
        { v1: 'keep', v2: 'kept', meaning: 'menjaga' },
        { v1: 'sleep', v2: 'slept', meaning: 'tidur' },
        { v1: 'leave', v2: 'left', meaning: 'meninggalkan' },
        { v1: 'lose', v2: 'lost', meaning: 'kehilangan' },
        { v1: 'mean', v2: 'meant', meaning: 'berarti' },
        { v1: 'meet', v2: 'met', meaning: 'bertemu' },
        { v1: 'dream', v2: 'dreamt', meaning: 'bermimpi' },
        { v1: 'burn', v2: 'burnt', meaning: 'membakar' },
        { v1: 'learn', v2: 'learnt', meaning: 'belajar' },
      ]
    },
    {
      name: "4. Perubahan Vokal (i -> a)",
      description: "Pola paling umum: sing -> sang",
      verbs: [
        { v1: 'sing', v2: 'sang', meaning: 'bernyanyi' },
        { v1: 'drink', v2: 'drank', meaning: 'minum' },
        { v1: 'ring', v2: 'rang', meaning: 'berdering' },
        { v1: 'swim', v2: 'swam', meaning: 'berenang' },
        { v1: 'begin', v2: 'began', meaning: 'memulai' },
        { v1: 'sit', v2: 'sat', meaning: 'duduk' },
      ]
    },
    {
      name: "5. Perubahan Vokal (i -> o)",
      description: "Pola: drive -> drove",
      verbs: [
        { v1: 'drive', v2: 'drove', meaning: 'mengemudi' },
        { v1: 'ride', v2: 'rode', meaning: 'mengendarai' },
        { v1: 'write', v2: 'wrote', meaning: 'menulis' },
        { v1: 'rise', v2: 'rose', meaning: 'terbit/naik' },
        { v1: 'shine', v2: 'shone', meaning: 'bersinar' },
      ]
    },
    {
      name: "6. Perubahan Vokal (ea -> o)",
      description: "Pola: speak -> spoke",
      verbs: [
        { v1: 'speak', v2: 'spoke', meaning: 'berbicara' },
        { v1: 'break', v2: 'broke', meaning: 'memecahkan' },
        { v1: 'steal', v2: 'stole', meaning: 'mencuri' },
        { v1: 'wake', v2: 'woke', meaning: 'bangun' },
      ]
    },
    {
      name: "7. Akhiran -ought / -aught",
      description: "Pola: buy -> bought",
      verbs: [
        { v1: 'buy', v2: 'bought', meaning: 'membeli' },
        { v1: 'bring', v2: 'brought', meaning: 'membawa' },
        { v1: 'think', v2: 'thought', meaning: 'berpikir' },
        { v1: 'seek', v2: 'sought', meaning: 'mencari' },
        { v1: 'teach', v2: 'taught', meaning: 'mengajar' },
        { v1: 'catch', v2: 'caught', meaning: 'menangkap' },
        { v1: 'fight', v2: 'fought', meaning: 'berkelahi' },
      ]
    },
    {
      name: "8. Akhiran -ew",
      description: "Pola: know -> knew",
      verbs: [
        { v1: 'know', v2: 'knew', meaning: 'tahu' },
        { v1: 'throw', v2: 'threw', meaning: 'melempar' },
        { v1: 'grow', v2: 'grew', meaning: 'tumbuh' },
        { v1: 'blow', v2: 'blew', meaning: 'meniup' },
        { v1: 'fly', v2: 'flew', meaning: 'terbang' },
        { v1: 'draw', v2: 'drew', meaning: 'menggambar' },
      ]
    },
    {
      name: "9. Berubah Total",
      description: "Tidak mengikuti pola jelas",
      verbs: [
        { v1: 'go', v2: 'went', meaning: 'pergi' },
        { v1: 'be', v2: 'was/were', meaning: 'adalah' },
        { v1: 'do', v2: 'did', meaning: 'melakukan' },
        { v1: 'have', v2: 'had', meaning: 'mempunyai' },
        { v1: 'make', v2: 'made', meaning: 'membuat' },
        { v1: 'take', v2: 'took', meaning: 'mengambil' },
        { v1: 'come', v2: 'came', meaning: 'datang' },
        { v1: 'get', v2: 'got', meaning: 'mendapatkan' },
        { v1: 'see', v2: 'saw', meaning: 'melihat' },
      ]
    },
    {
      name: "10. Pola Khusus (-ear -> -ore, etc)",
      description: "Pola berulang lainnya",
      verbs: [
        { v1: 'wear', v2: 'wore', meaning: 'memakai' },
        { v1: 'tear', v2: 'tore', meaning: 'merobek' },
        { v1: 'bear', v2: 'bore', meaning: 'menahan' },
        { v1: 'swear', v2: 'swore', meaning: 'bersumpah' },
        { v1: 'shake', v2: 'shook', meaning: 'mengocok' },
      ]
    }
  ]
};

const GrammarIsland: React.FC<GrammarIslandProps> = ({ onBack, addPoints }) => {
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    const saved = localStorage.getItem('grammar_quiz_current_idx');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(() => {
    const saved = localStorage.getItem('grammar_quiz_topic') as GrammarTopic;
    return saved || null;
  });
  const [answers, setAnswers] = useState<string[]>(() => {
    const saved = localStorage.getItem('grammar_quiz_answers');
    return saved ? JSON.parse(saved) : [];
  });
  const [isFinished, setIsFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [mastery, setMastery] = useState<GrammarMastery>(() => {
    const saved = localStorage.getItem('grammar_mastery');
    return saved ? JSON.parse(saved) : { simplePresent: 0, presentContinuous: 0, simplePast: 0 };
  });
  const [view, setView] = useState<'menu' | 'study' | 'quiz' | 'verbs'>(() => {
    return 'menu';
  });

  const QUESTIONS = selectedTopic ? TOPIC_QUESTIONS[selectedTopic] : [];
  const currentQuestion = QUESTIONS[currentIdx];

  // Save progress periodically when in quiz mode
  useEffect(() => {
    if (view === 'quiz' && selectedTopic) {
      localStorage.setItem('grammar_quiz_topic', selectedTopic);
      localStorage.setItem('grammar_quiz_current_idx', currentIdx.toString());
      localStorage.setItem('grammar_quiz_answers', JSON.stringify(answers));
    }
  }, [view, selectedTopic, currentIdx, answers]);

  const clearQuizSession = () => {
    localStorage.removeItem('grammar_quiz_topic');
    localStorage.removeItem('grammar_quiz_current_idx');
    localStorage.removeItem('grammar_quiz_answers');
  };

  const startQuiz = (topic: GrammarTopic) => {
    setSelectedTopic(topic);
    setAnswers(new Array(TOPIC_QUESTIONS[topic].length).fill(''));
    setCurrentIdx(0);
    setIsFinished(false);
    setView('quiz');
  };

  const resumeQuiz = () => {
    if (selectedTopic && answers.length > 0) {
      setView('quiz');
    }
  };

  const startStudy = (topic: GrammarTopic) => {
    setSelectedTopic(topic);
    setView('study');
  };

  const handleAnswer = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentIdx] = option;
    setAnswers(newAnswers);
  };

  const saveProgress = (newScore: number) => {
    if (!selectedTopic) return;
    const updatedMastery = { ...mastery, [selectedTopic]: Math.max(mastery[selectedTopic], Math.round(newScore)) };
    setMastery(updatedMastery);
    localStorage.setItem('grammar_mastery', JSON.stringify(updatedMastery));
  };

  const nextQuestion = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsFinished(true);
      const score = calculateScore();
      saveProgress(score);
      clearQuizSession();
      addPoints(Math.round(score), `Completed ${selectedTopic} practice with score ${Math.round(score)}!`);
    }
  };

  const prevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const calculateScore = () => {
    const correctCount = answers.reduce((acc, ans, idx) => {
      return ans === QUESTIONS[idx].answer ? acc + 1 : acc;
    }, 0);
    return (correctCount / QUESTIONS.length) * 100;
  };

  if (view === 'menu') {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center">
        <header className="w-full max-w-4xl flex justify-between items-center mb-4">
          <button onClick={onBack} className="bg-indigo-600 text-white px-6 py-2 rounded-full font-black shadow-lg hover:scale-105 transition-all">
            ⬅️ Back to Map
          </button>
          <h1 className="text-3xl font-black text-indigo-900">Grammar Island ✍️</h1>
          <div className="w-10" />
        </header>

        {selectedTopic && answers.some(a => a !== '') && !isFinished && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl mb-6"
          >
            <div className="bg-amber-100 border-2 border-amber-200 p-6 rounded-[30px] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">🧩</span>
                <div>
                  <h3 className="font-black text-amber-900 text-xl">Lanjut Quiz Sebelumnya?</h3>
                  <p className="text-amber-700 font-bold">Kamu sedang mengerjakan topik {selectedTopic === 'simplePresent' ? 'Simple Present' : selectedTopic === 'presentContinuous' ? 'Present Continuous' : 'Simple Past'}.</p>
                </div>
              </div>
              <button 
                onClick={resumeQuiz}
                className="bg-amber-500 text-white px-10 py-4 rounded-2xl font-black shadow-lg hover:bg-amber-600 active:scale-95 transition-all"
              >
                LANJUTKAN SEKARANG 🚀
              </button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl pt-10">
          {/* Simple Present Module */}
          <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col">
            <div className="text-5xl mb-4 text-left">📝</div>
            <h2 className="text-3xl font-black text-indigo-600 mb-2">Simple Present</h2>
            <div className="w-full bg-indigo-50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-indigo-400">Mastery</span>
                <span className="font-black text-indigo-600">{mastery.simplePresent}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${mastery.simplePresent}%` }} className="h-full bg-indigo-500" />
              </div>
            </div>
            <p className="text-gray-500 font-bold mb-8 flex-1">Routines and facts.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => startStudy('simplePresent')} className="w-full bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black hover:bg-indigo-200 transition-all">STUDY TIPS</button>
              <button onClick={() => startQuiz('simplePresent')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">TAKE QUIZ</button>
            </div>
          </div>

          {/* Present Continuous Module */}
          <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col">
            <div className="text-5xl mb-4 text-left">⏳</div>
            <h2 className="text-3xl font-black text-indigo-600 mb-2">Present Continuous</h2>
            <div className="w-full bg-indigo-50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-indigo-400">Mastery</span>
                <span className="font-black text-indigo-600">{mastery.presentContinuous}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${mastery.presentContinuous}%` }} className="h-full bg-indigo-500" />
              </div>
            </div>
            <p className="text-gray-500 font-bold mb-8 flex-1">Happening right now.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => startStudy('presentContinuous')} className="w-full bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black hover:bg-indigo-200 transition-all">STUDY TIPS</button>
              <button onClick={() => startQuiz('presentContinuous')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">TAKE QUIZ</button>
            </div>
          </div>

          {/* Simple Past Module */}
          <div className="bg-white p-10 rounded-[40px] shadow-2xl flex flex-col">
            <div className="text-5xl mb-4 text-left">🕰️</div>
            <h2 className="text-3xl font-black text-indigo-600 mb-2">Simple Past</h2>
            <div className="w-full bg-indigo-50 p-4 rounded-2xl mb-4">
              <div className="flex justify-between items-center mb-1">
                <span className="font-bold text-xs text-indigo-400">Mastery</span>
                <span className="font-black text-indigo-600">{mastery.simplePast}%</span>
              </div>
              <div className="w-full h-2 bg-indigo-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${mastery.simplePast}%` }} className="h-full bg-indigo-500" />
              </div>
            </div>
            <p className="text-gray-500 font-bold mb-8 flex-1">Completed actions in the past.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => setView('verbs')} className="w-full bg-amber-100 text-amber-600 py-4 rounded-2xl font-black hover:bg-amber-200 transition-all flex items-center justify-center gap-2">
                <span>📖</span> VERB LIST (V2)
              </button>
              <button onClick={() => startStudy('simplePast')} className="w-full bg-indigo-100 text-indigo-600 py-4 rounded-2xl font-black hover:bg-indigo-200 transition-all">STUDY TIPS</button>
              <button onClick={() => startQuiz('simplePast')} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-indigo-700 transition-all">TAKE QUIZ</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'verbs') {
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center">
        <header className="w-full max-w-4xl flex justify-between items-center mb-8">
          <button onClick={() => setView('menu')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-black shadow-md border-2 border-indigo-100">
            ⬅️ Menu
          </button>
          <h2 className="text-2xl font-black text-indigo-900">Verb List (Bentuk Lampau) 🕰️</h2>
          <div className="w-10" />
        </header>

        <div className="w-full max-w-5xl space-y-12 mb-24">
          {/* Regular Verbs */}
          <div className="bg-white rounded-[40px] shadow-xl overflow-hidden">
            <div className="bg-emerald-500 p-8">
              <h3 className="text-2xl font-black text-white flex items-center gap-2">
                <span>✅</span> Regular Verbs (+ed)
              </h3>
              <p className="text-emerald-100 font-bold">Paling mudah! Tinggal tambahkan 'ed'.</p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SIMPLE_PAST_VERBS.regular.map((v, i) => (
                  <div key={i} className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-bold text-gray-400">{v.v1}</span>
                      <span className="text-xs">➡️</span>
                      <span className="font-black text-emerald-600">{v.v2}</span>
                    </div>
                    <div className="text-[10px] font-bold text-emerald-300 uppercase mt-1">{v.meaning}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Irregular Categories */}
          <div className="space-y-8">
            <h3 className="text-3xl font-black text-indigo-900 text-center uppercase tracking-widest">⚡ Irregular Verb Patterns</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SIMPLE_PAST_VERBS.irregularCategories.map((cat, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-[40px] shadow-lg border-2 border-indigo-50"
                >
                  <div className="bg-indigo-600 p-6 rounded-t-[40px]">
                    <h4 className="text-lg font-black text-white">{cat.name}</h4>
                    <p className="text-indigo-200 text-xs font-bold italic">{cat.description}</p>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {cat.verbs.map((v, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-indigo-50/30 rounded-xl hover:bg-indigo-50 transition-colors">
                          <div className="flex gap-4">
                            <span className="font-bold text-gray-400 w-16">{v.v1}</span>
                            <span className="font-black text-indigo-600">{v.v2}</span>
                          </div>
                          <span className="text-xs text-gray-400 italic">{v.meaning}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'study' && selectedTopic) {
    const studyContent = STUDY_CONTENT[selectedTopic];
    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center pb-24">
        <header className="w-full max-w-4xl flex justify-between items-center mb-8">
          <button onClick={() => setView('menu')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-black shadow-md border-2 border-indigo-100">
            ⬅️ Menu
          </button>
          <h2 className="text-2xl font-black text-indigo-900">{studyContent.title}</h2>
          <div className="w-10" />
        </header>

        <div className="w-full max-w-3xl space-y-6">
          {studyContent.tips.map((tip, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-8 rounded-[40px] shadow-xl border-l-[12px] border-indigo-200"
            >
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl">{tip.icon}</span>
                <h3 className="text-xl font-black text-indigo-600">{tip.title}</h3>
              </div>
              <p className="text-gray-600 font-bold italic mb-4">{tip.description}</p>
              {tip.pattern && (
                <div className="bg-indigo-50 p-4 rounded-2xl border-2 border-dashed border-indigo-200 mb-4 font-mono text-indigo-600 font-bold">
                   Pattern: {tip.pattern}
                </div>
              )}
              {tip.examples && (
                <ul className="space-y-2">
                  {tip.examples.map((ex, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-700">
                      <span className="text-indigo-400">•</span>
                      <span className="font-semibold">{ex}</span>
                    </li>
                  ))}
                </ul>
              )}
              {tip.rules && (
                <div className="space-y-3">
                  {tip.rules.map((rule, i) => (
                    <div key={i} className="bg-amber-50 p-3 rounded-xl border border-amber-100 text-amber-800 text-sm font-bold">
                       {rule}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          ))}
          
          <div className="pt-10 flex justify-center">
            <button 
              onClick={() => startQuiz(selectedTopic)}
              className="bg-indigo-600 text-white px-12 py-5 rounded-[30px] font-black text-2xl shadow-xl hover:bg-indigo-700 active:scale-95 transition-all"
            >
              READY FOR QUIZ? 🚀
            </button>
          </div>
        </div>
      </div>
    );
  }


  if (isFinished) {
    const score = calculateScore();
    const correctCount = answers.reduce((acc, ans, idx) => {
        return ans === QUESTIONS[idx].answer ? acc + 1 : acc;
    }, 0);

    return (
      <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center overflow-y-auto">
        <div className="bg-white w-full max-w-2xl p-12 rounded-[50px] shadow-2xl text-center mt-10 mb-20 relative">
          {!showReview ? (
            <>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-9xl mb-6"
              >
                {score >= 80 ? '🏆' : score >= 60 ? '🌟' : '📚'}
              </motion.div>
              <h2 className="text-5xl font-black text-indigo-600 mb-2">Quiz Finished!</h2>
              <p className="text-2xl font-bold text-gray-400 mb-8 uppercase tracking-widest">Your Result</p>
              
              <div className="bg-indigo-50 p-12 rounded-[40px] border-4 border-indigo-100 mb-10 text-left">
                <div className="text-center mb-8">
                  <div className="text-8xl font-black text-indigo-600">{Math.round(score)}</div>
                  <div className="text-sm font-bold text-indigo-400 uppercase tracking-widest mt-2">Final Score</div>
                  <div className="mt-2 text-gray-500 font-bold uppercase text-[10px]">You got {correctCount} out of {QUESTIONS.length} right!</div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-black text-indigo-900 border-b border-indigo-200 pb-2">💡 Quick Reinforcement</h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {selectedTopic === 'simplePresent' ? (
                      <>
                        Remember! We use <span className="font-bold text-indigo-600">Simple Present</span> for routines and facts. 
                        Add <span className="font-bold border-b-2 border-indigo-200">-s/-es</span> only for <span className="italic">He, She, It</span>. 
                        For negatives and questions, use <span className="font-bold">Do</span> or <span className="font-bold">Does</span> + Verb 1 (no -s).
                      </>
                    ) : selectedTopic === 'presentContinuous' ? (
                      <>
                        Awesome! We use <span className="font-bold text-indigo-600">Present Continuous</span> for things happening <span className="italic">now</span>. 
                        Use <span className="font-bold">am/is/are + Verb-ing</span>. 
                        Don't forget the to-be! (I am, you are, he is).
                      </>
                    ) : (
                      <>
                        Great job! <span className="font-bold text-indigo-600">Simple Past</span> is for things that are finished. 
                        Most use <span className="font-bold">-ed</span>, but watch out for <span className="italic italic-not-really">Irregular Verbs</span> {"(go -> went)"}. 
                        For negatives and questions, use <span className="font-bold">Did</span> + Verb 1.
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                    onClick={() => setShowReview(true)}
                    className="w-full bg-indigo-500 text-white py-5 rounded-3xl font-black text-xl shadow-lg hover:bg-indigo-600 transition-all"
                >
                    REVIEW MISTAKES 🔍
                </button>
                <div className="flex gap-4">
                  <button 
                      onClick={() => { setIsFinished(false); setCurrentIdx(0); setAnswers(new Array(QUESTIONS.length).fill('')); }}
                      className="flex-1 bg-white border-4 border-indigo-200 text-indigo-500 py-4 rounded-3xl font-black text-lg hover:bg-indigo-50 transition-all"
                  >
                      RETRY
                  </button>
                  <button 
                      onClick={onBack}
                      className="flex-1 bg-indigo-600 text-white py-4 rounded-3xl font-black text-lg shadow-lg hover:bg-indigo-700 transition-all"
                  >
                      BACK TO MAP
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-left">
               <div className="flex justify-between items-center mb-10">
                  <h2 className="text-3xl font-black text-indigo-900 uppercase">Review Answers</h2>
                  <button onClick={() => setShowReview(false)} className="text-4xl text-gray-300 hover:text-indigo-600">✕</button>
               </div>
               
               <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-indigo-100">
                  {QUESTIONS.map((q, idx) => {
                    const isCorrect = answers[idx] === q.answer;
                    if (isCorrect) return null; // Show only mistakes or all? Usually users want to see mistakes.
                    return (
                      <div key={idx} className="bg-rose-50 p-6 rounded-3xl border-2 border-rose-100 relative">
                         <div className="absolute top-4 right-4 text-rose-500">❌</div>
                         <h4 className="font-black text-rose-900 mb-2">Q{idx + 1}: {q.question}</h4>
                         <div className="space-y-2 text-sm">
                            <div className="p-3 bg-white/60 rounded-xl">
                               <span className="font-bold text-gray-400">Your Answer:</span> <span className="font-black text-rose-500">{answers[idx]}</span>
                            </div>
                            <div className="p-3 bg-emerald-100 rounded-xl border border-emerald-200">
                               <span className="font-bold text-emerald-600">Correct Answer:</span> <span className="font-black text-emerald-700">{q.answer}</span>
                            </div>
                         </div>
                      </div>
                    );
                  })}
                  {correctCount === QUESTIONS.length && (
                    <div className="text-center py-20">
                       <div className="text-6xl mb-4">🌈</div>
                       <h3 className="text-2xl font-black text-indigo-600">Perfect Score!</h3>
                       <p className="text-gray-400 font-bold">You didn't make any mistakes.</p>
                    </div>
                  )}
               </div>
               
               <button 
                  onClick={() => setShowReview(false)}
                  className="w-full mt-8 bg-indigo-600 text-white py-5 rounded-3xl font-black shadow-lg hover:bg-indigo-700 transition-all"
               >
                  DONE REVIEWING
               </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-indigo-50 p-6 flex flex-col items-center pb-24 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      <header className="w-full max-w-4xl flex justify-between items-center mb-8 relative z-10">
        <button onClick={() => setView('menu')} className="bg-white text-indigo-600 px-6 py-2 rounded-full font-black shadow-md border-2 border-indigo-100 hover:scale-105 transition-all">
          ⬅️ Exit
        </button>
        <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Question</span>
            <span className="text-2xl font-black text-indigo-900">{currentIdx + 1} / {QUESTIONS.length}</span>
        </div>
        <div className="w-32 h-3 bg-indigo-200 rounded-full overflow-hidden">
            <div 
                className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                style={{ width: `${((currentIdx + 1) / QUESTIONS.length) * 100}%` }}
            />
        </div>
      </header>

      <div className="w-full max-w-3xl relative z-10">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            className="bg-white p-10 rounded-[60px] shadow-2xl border-b-[16px] border-indigo-100 relative overflow-hidden"
          >
            {currentQuestion.story && (
              <div className="bg-indigo-50/50 p-6 rounded-3xl mb-8 border-2 border-dashed border-indigo-100">
                <h4 className="text-xs font-black text-indigo-300 uppercase mb-2 tracking-widest flex items-center gap-2">
                    <span className="text-base text-indigo-600">📖</span> Story Context
                </h4>
                <p className="text-gray-700 font-medium leading-relaxed italic">
                  {currentQuestion.story}
                </p>
              </div>
            )}

            <h3 className="text-2xl font-black text-gray-800 mb-10 leading-tight">
              {currentQuestion.question}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswer(option)}
                  className={`p-6 rounded-[30px] font-black text-lg transition-all border-4 text-left group relative ${
                    answers[currentIdx] === option 
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xl scale-[1.02]' 
                      : 'bg-white text-gray-600 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                  }`}
                >
                  <span className={`inline-block w-8 h-8 rounded-full border-2 mr-4 text-center leading-7 text-sm ${answers[currentIdx] === option ? 'border-white/50 bg-white/20' : 'border-indigo-100 bg-indigo-50 text-indigo-400'}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {option}
                  {answers[currentIdx] === option && (
                    <motion.div 
                      layoutId="check"
                      className="absolute right-6 top-1/2 -translate-y-1/2 text-xl"
                    >
                      ✨
                    </motion.div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between items-center mt-10">
          <button 
            onClick={prevQuestion}
            disabled={currentIdx === 0}
            className="bg-white text-indigo-600 px-10 py-5 rounded-[25px] font-black text-lg border-4 border-indigo-100 shadow-lg hover:bg-indigo-50 disabled:opacity-30 transition-all active:scale-95"
          >
            PREV
          </button>
          
          <div className="hidden md:flex flex-col items-center">
             <div className="text-indigo-300 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Status</div>
             <div className="flex gap-2">
                {[...Array(Math.min(5, QUESTIONS.length))].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < answers.filter(a => a !== '').length % 5 ? 'bg-indigo-500' : 'bg-indigo-100'}`} />
                ))}
             </div>
          </div>

          <button 
            onClick={nextQuestion}
            disabled={answers[currentIdx] === ''}
            className="bg-indigo-600 text-white px-10 py-5 rounded-[25px] font-black text-lg shadow-xl hover:bg-indigo-700 active:scale-95 disabled:opacity-30 transition-all"
          >
            {currentIdx === QUESTIONS.length - 1 ? 'FINISH 🎉' : 'NEXT ➡️'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrammarIsland;
