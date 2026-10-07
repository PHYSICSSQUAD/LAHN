// The seed content lives in one place so it can later be replaced by an API.
// Every class gets its own starter data set; the Alphabet itself is shared.
const demoTone = 'assets/audio/demo-tone.wav';
const youtubeSearch = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const copticAlphabet = [
  ['Ⲁ', 'Alpha', 'ألفا'], ['Ⲃ', 'Vida', 'ڤيدا'], ['Ⲅ', 'Gamma', 'جاما'], ['Ⲇ', 'Dalda', 'دالدا'],
  ['Ⲉ', 'E', 'إي'], ['Ⲋ', 'Sou', 'سو'], ['Ⲍ', 'Zeta', 'زيتا'], ['Ⲏ', 'Eta', 'إيتا'],
  ['Ⲑ', 'Thita', 'ثيتا'], ['Ⲓ', 'Iota', 'يوتا'], ['Ⲕ', 'Kappa', 'كابا'], ['Ⲗ', 'Laula', 'لاولا'],
  ['Ⲙ', 'Mi', 'مي'], ['Ⲛ', 'Ni', 'ني'], ['Ⲝ', 'Ksi', 'كسي'], ['Ⲟ', 'O', 'أو'],
  ['Ⲡ', 'Pi', 'بي'], ['Ⲣ', 'Ro', 'رو'], ['Ⲥ', 'Sima', 'سيما'], ['Ⲧ', 'Tau', 'طاو'],
  ['Ⲩ', 'Epsi', 'إبسي'], ['Ⲫ', 'Fi', 'في'], ['Ⲭ', 'Khi', 'خي'], ['Ⲯ', 'Psi', 'بسي'],
  ['Ⲱ', 'Oou', 'أو'], ['Ϣ', 'Shai', 'شاي'], ['Ϥ', 'Fai', 'فاي'], ['Ϧ', 'Khai', 'خاي'],
  ['Ϩ', 'Hori', 'هوري'], ['Ϫ', 'Janja', 'جانجا'], ['Ϭ', 'Chima', 'تشيما'], ['Ϯ', 'Ti', 'تي'],
];

const wordExamples = {
  'Ⲁ': ['ⲁⲅⲓⲟⲥ', 'أجيوس — قدوس'],
  'Ⲃ': ['ⲃⲓⲃⲗⲓⲟⲛ', 'بيبليون — كتاب'],
  'Ⲇ': ['ⲇⲟⲝⲁ', 'دوكسا — المجد'],
  'Ⲉ': ['ⲉⲓⲣⲏⲛⲏ', 'إيريني — السلام'],
  'Ⲓ': ['ⲓⲏⲥⲟⲩⲥ', 'إيسوس — يسوع'],
  'Ⲕ': ['ⲕⲩⲣⲓⲟⲥ', 'كيريوس — الرب'],
  'Ⲙ': ['ⲙⲁⲣⲓⲁ', 'ماريا — مريم'],
  'Ⲛ': ['ⲛⲟⲩⲧⲉ', 'نوتي — الله'],
  'Ⲡ': ['ⲡⲛⲉⲩⲙⲁ', 'بنيفما — الروح'],
  'Ⲣ': ['ⲣⲱⲙⲓ', 'رومي — إنسان'],
  'Ⲥ': ['ⲥⲟⲫⲓⲁ', 'صوفيا — الحكمة'],
  'Ϣ': ['ϣⲏⲣⲓ', 'شيري — ابن'],
  'Ϯ': ['ϯⲙⲉ', 'تي مي — أحب'],
};

// Number of Coptic letters each class starts with.
const letterCounts = { babyclass: 8, kg1: 32, kg2: 16 };

function buildLetters(classId) {
  const count = letterCounts[classId] ?? 12;
  return copticAlphabet.slice(0, count).map(([glyph, transliteration, arabicName], index) => {
    const example = wordExamples[glyph];
    return {
      id: `${classId}-letter-${index + 1}`,
      glyph,
      name: arabicName,
      transliteration,
      word: example?.[0] || '',
      translation: example?.[1] || '',
      order: index + 1,
      audioSrc: index === 0 ? demoTone : '',
      note: index === 0 ? 'جرب كتابة الحرف في الهواء ثم على الورقة.' : '',
      demo: true,
    };
  });
}

const seeds = {
  babyclass: {
    students: [
      { id: 'babyclass-student-tadros', name: 'تادرس', score: 420, avatar: '🐻' },
      { id: 'babyclass-student-marina', name: 'مارينا', score: 380, avatar: '🐰' },
      { id: 'babyclass-student-elia', name: 'إيليا', score: 300, avatar: '🐥' },
      { id: 'babyclass-student-yostina', name: 'يوستينا', score: 240, avatar: '🦋' },
    ],
    hymns: [
      {
        id: 'babyclass-kyrie', title: 'كيرياليسون الصغير', description: 'نغمة قصيرة جدا نرددها مع الدبدوب.', icon: '🍼', order: 1,
        lyrics: 'كيرياليسون، كيرياليسون\nيا رب ارحمنا.',
        notes: 'يكفي أن يردد الطفل كلمة واحدة مع أحد والديه.',
        youtubeUrl: youtubeSearch('كيرياليسون للأطفال قبطي'), audioSrc: demoTone, recordingSrc: demoTone, demo: true,
      },
      {
        id: 'babyclass-mary', title: 'سلامنا لمريم', description: 'نحيي العذراء بكلمات بسيطة.', icon: '🌷', order: 2,
        lyrics: 'سلام لك يا مريم\nيا أم النور.',
        notes: 'استبدلوا النص بالصيغة المعتمدة في كنيستكم.',
        youtubeUrl: youtubeSearch('سلام لك يا مريم قبطي'), audioSrc: '', recordingSrc: '', demo: true,
      },
      {
        id: 'babyclass-angel', title: 'لحن الملاك', description: 'لحن هادئ نسمعه قبل النوم.', icon: '😇', order: 3,
        lyrics: 'الملاك يسبح\nويعلمنا الفرح.',
        notes: 'يمكن تشغيله وقت الهدوء.',
        youtubeUrl: youtubeSearch('ترانيم الملائكة للأطفال'), audioSrc: '', recordingSrc: '', demo: true,
      },
    ],
    liturgy: [
      {
        id: 'babyclass-church-home', title: 'زيارتنا للكنيسة', description: 'نتعرف على بيت الله بهدوء.', icon: '⛪', order: 1,
        body: 'الكنيسة بيت الله وبيتنا الجميل.\n\nندخل بهدوء، ونسلم على الأيقونات، ونجلس مع ماما وبابا.\n\nاسأل طفلك: هل تحب أن تدق الناقوس؟',
        notes: 'شرح مبسط جدا لعمر ما قبل المدرسة.', youtubeUrl: youtubeSearch('أدب الكنيسة للأطفال'), audioSrc: demoTone, demo: true,
      },
      {
        id: 'babyclass-cross', title: 'علامة الصليب الصغيرة', description: 'نرسم الصليب مع ماما وبابا.', icon: '✝️', order: 2,
        body: 'نرسم علامة الصليب بيدنا بهدوء ومحبة.\n\nنقول: بسم الآب والابن وروح القدس.',
        notes: 'ساعدوا الطفل بيده في البداية.', youtubeUrl: youtubeSearch('علامة الصليب للأطفال'), audioSrc: '', demo: true,
      },
      {
        id: 'babyclass-quiet', title: 'نصغي بهدوء', description: 'نتعلم أن نهدأ قليلا في الصلاة.', icon: '🕊️', order: 3,
        body: 'نضع يدنا على قلبنا ونسمع صوت الصلاة.\n\nنهدأ قليلا، ثم نبتسم.',
        notes: 'نشاط قصير لا يزيد عن دقيقة لعمر البيبي.', youtubeUrl: '', audioSrc: '', demo: true,
      },
    ],
    settings: {
      copticSourceUrl: youtubeSearch('حروف قبطية للأطفال سن ٤ سنوات'),
      parentNote: 'فصل البيبي: نغمة واحدة قصيرة كل أسبوع، ومعها لعبة أو رسمة، وبس!',
    },
  },

  kg1: {
    students: [
      { id: 'kg1-student-ahmed', name: 'أحمد', score: 950, avatar: '🦁' },
      { id: 'kg1-student-mariam', name: 'مريم', score: 870, avatar: '🦋' },
      { id: 'kg1-student-youssef', name: 'يوسف', score: 820, avatar: '🐻' },
      { id: 'kg1-student-salma', name: 'سلمى', score: 760, avatar: '🐰' },
      { id: 'kg1-student-nour', name: 'نور', score: 640, avatar: '🐼' },
    ],
    hymns: [
      {
        id: 'kg1-kyrie-eleison', title: 'لحن كيرياليسون', description: 'ترنيمة قصيرة نطلب فيها الرحمة بفرح.', icon: '🎵', order: 1,
        lyrics: 'كيرياليسون، كيرياليسون\nيا رب ارحمنا، يا رب ارحمنا\nنسبحك بمحبة وسلام.',
        notes: 'كلمة «كيرياليسون» تعني «يا رب ارحم». يمكن أن يردد الطفل الكلمات مع أحد والديه.',
        youtubeUrl: youtubeSearch('لحن كيرياليسون قبطي للأطفال'),
        audioSrc: demoTone, recordingSrc: demoTone, demo: true,
      },
      {
        id: 'kg1-gospel-response', title: 'مرد الإنجيل', description: 'نستمع ونجيب بمحبة في الكنيسة.', icon: '📖', order: 2,
        lyrics: 'المجد لك يا رب\nالمجد لك يا رب\nيا ربنا وإلهنا وملكنا.',
        notes: 'هذا النص للتعرف على شكل الدرس فقط. استبدله بالنص والتسجيل المعتمدين من الكنيسة.',
        youtubeUrl: youtubeSearch('مرد الإنجيل قبطي'), audioSrc: demoTone, recordingSrc: '', demo: true,
      },
      {
        id: 'kg1-blessing-hymn', title: 'لحن البركة', description: 'لحن هادئ نتعلمه مع الأسرة.', icon: '✨', order: 3,
        lyrics: 'بارك يا رب يومنا\nواجعل قلوبنا مليئة بالسلام.',
        notes: 'مساحة لطيفة لملاحظة من المعلم أو ولي الأمر.',
        youtubeUrl: youtubeSearch('لحن البركة قبطي'), audioSrc: demoTone, recordingSrc: '', demo: true,
      },
      {
        id: 'kg1-alleluia', title: 'لحن هلليلويا', description: 'نرنم بكلمة فرح وتسبيح.', icon: '🌈', order: 4,
        lyrics: 'هلليلويا، هلليلويا\nنسبح اسمك يا الله.',
        notes: 'هلليلويا كلمة تسبيح وفرح. أضف هنا الكلمات الصحيحة والتسجيل الخاص بكم.',
        youtubeUrl: youtubeSearch('لحن هلليلويا قبطي'), audioSrc: '', recordingSrc: '', demo: true,
      },
    ],
    liturgy: [
      {
        id: 'kg1-church-home', title: 'بيتي الجميل: الكنيسة', description: 'نتعرف على بيت الصلاة وماذا نرى فيه.', icon: '⛪', order: 1,
        body: 'الكنيسة بيت الصلاة والاجتماع بمحبة.\n\nنرى فيها المذبح، والأيقونات، والشموع. نسير بهدوء ونصغي إلى الصلوات والترانيم.\n\nاسأل طفلك: ما الشيء الذي تحب أن تراه في الكنيسة؟',
        notes: 'تفسير مبسط للتعلم الأسري، ويفضل مراجعته مع خادم أو معلم الكنيسة.',
        youtubeUrl: youtubeSearch('شرح الكنيسة للأطفال قبطي'), audioSrc: demoTone, demo: true,
      },
      {
        id: 'kg1-the-cross', title: 'علامة الصليب', description: 'نتعلم أن الصليب يذكرنا بمحبة الله.', icon: '✝️', order: 2,
        body: 'الصليب علامة محبة ورجاء. نرسمه باحترام ونبدأ صلاتنا به.\n\nيمكن للأهل أن يشرحوا للطفل خطوات رسم علامة الصليب بهدوء وبطريقة تناسب عمره.',
        notes: 'المحتوى مثال توضيحي أولي قابل للتعديل.', youtubeUrl: youtubeSearch('علامة الصليب للأطفال قبطي'), audioSrc: '', demo: true,
      },
      {
        id: 'kg1-incense', title: 'رائحة البخور', description: 'نلاحظ البخور الجميل الذي يرافق الصلاة.', icon: '☁️', order: 3,
        body: 'يرتفع البخور في الكنيسة أثناء الصلاة، وتذكرنا رائحته أن نرفع قلوبنا بمحبة.\n\nنقف بهدوء، ونصغي، ونتبع إرشادات الكبار.',
        notes: 'شرح عائلي مبسط؛ لا تلمس المبخرة أو الشموع من دون إشراف شخص بالغ.',
        youtubeUrl: youtubeSearch('البخور في الكنيسة للأطفال'), audioSrc: '', demo: true,
      },
      {
        id: 'kg1-liturgy-listening', title: 'أصغي وأشارك', description: 'كيف نستعد للصلاة ونشارك باحترام؟', icon: '🕊️', order: 4,
        body: 'قبل الصلاة، نهدأ ونستعد. أثناءها نصغي إلى الكلمات ونشارك في الردود التي تعلمناها.\n\nبعدها نتذكر كلمة جميلة أو ترنيمة أحببناها.',
        notes: 'يمكن إضافة أقسام وصور وتسجيلات خاصة بكنيستكم من لوحة الإدارة.',
        youtubeUrl: youtubeSearch('طقس الكنيسة للأطفال قبطي'), audioSrc: '', demo: true,
      },
    ],
    settings: {
      copticSourceUrl: youtubeSearch('تعليم الحروف القبطية للأطفال'),
      parentNote: 'اختاروا محطة، واستمتعوا بها معا. الأمثلة الحالية تجريبية ويمكنكم تعديلها من لوحة الإدارة.',
    },
  },

  kg2: {
    students: [
      { id: 'kg2-student-kyrillos', name: 'كيرلس', score: 1180, avatar: '🦅' },
      { id: 'kg2-student-mark', name: 'مارك', score: 1040, avatar: '🐺' },
      { id: 'kg2-student-philopateer', name: 'فيلوباتير', score: 910, avatar: '🐬' },
      { id: 'kg2-student-damiana', name: 'دميانة', score: 880, avatar: '🌸' },
      { id: 'kg2-student-shenouda', name: 'شنودة', score: 730, avatar: '🐨' },
    ],
    hymns: [
      {
        id: 'kg2-kirialison', title: 'كيرياليسون الكبير', description: 'نرددها جماعة بصوت واحد في الكنيسة.', icon: '🎶', order: 1,
        lyrics: 'كيرياليسون، كيرياليسون\nكيرياليسون، يا رب ارحمنا.',
        notes: 'تدريب على ترديد اللحن جماعة وبإيقاع واحد.',
        youtubeUrl: youtubeSearch('كيرياليسون قبطي'), audioSrc: demoTone, recordingSrc: demoTone, demo: true,
      },
      {
        id: 'kg2-agios', title: 'لحن أجيوس', description: 'تسبحة قدوس قدوس قدوس.', icon: '✨', order: 2,
        lyrics: 'أجيوس، أجيوس، أجيوس\nقدوس، قدوس، قدوس.',
        notes: 'اشرحوا للطفل أننا ننضم لصوت الملائكة.',
        youtubeUrl: youtubeSearch('أجيوس قبطي'), audioSrc: demoTone, recordingSrc: '', demo: true,
      },
      {
        id: 'kg2-gospel-response', title: 'مرد الإنجيل', description: 'نجيب على الإنجيل بمحبة وثبات.', icon: '📖', order: 3,
        lyrics: 'المجد لك يا رب\nالمجد لك يا رب',
        notes: 'استبدلوا النص بالصيغة المعتمدة في كنيستكم.',
        youtubeUrl: youtubeSearch('مرد الإنجيل قبطي'), audioSrc: '', recordingSrc: '', demo: true,
      },
      {
        id: 'kg2-alleluia', title: 'هلليلويا', description: 'فرح التسبيح في نهاية الصلاة.', icon: '🌈', order: 4,
        lyrics: 'هلليلويا، هلليلويا\nهلليلويا، يا ربنا.',
        notes: 'يمكن تسجيل صوت الفصل وإضافته هنا.',
        youtubeUrl: youtubeSearch('هلليلويا قبطي'), audioSrc: '', recordingSrc: '', demo: true,
      },
    ],
    liturgy: [
      {
        id: 'kg2-reading-gospel', title: 'القراءة والإنجيل', description: 'نستمع إلى القراءة ونقف باحترام.', icon: '📜', order: 1,
        body: 'في الكنيسة نسمع القراءات من الكتاب المقدس، ثم يقف الجميع للإنجيل.\n\nنصغي، ونرسم علامة الصليب، ونردد المرد الذي تعلمناه.',
        notes: 'أضيفوا أسماء القراءات التي اعتاد عليها الفصل.',
        youtubeUrl: youtubeSearch('القراءات القبطية للأطفال'), audioSrc: demoTone, demo: true,
      },
      {
        id: 'kg2-incense', title: 'رفع البخور', description: 'معنى رائحة البخور في الصلاة.', icon: '☁️', order: 2,
        body: 'البخور يذكرنا بالصلاة التي ترتفع إلى الله.\n\nنقف بهدوء، ولا نتحرك أثناء رفع البخور، ونتبع إرشادات الخادم.',
        notes: 'يشرح الخادم خطوات رفع البخور أمام الأطفال.',
        youtubeUrl: youtubeSearch('رفع البخور قبطي'), audioSrc: '', demo: true,
      },
      {
        id: 'kg2-communion', title: 'التحضير للتناول', description: 'كيف نستعد للأسرار المقدسة؟', icon: '🍞', order: 3,
        body: 'نستعد للأسرار بالصلاة والاعتراف والمحبة.\n\nنجلس في هدوء، ونصلي الصلاة التي تعلمناها، ونطيع والدينا.',
        notes: 'هذا شرح عائلي فقط، والتفاصيل النهائية من كاهن الكنيسة.',
        youtubeUrl: youtubeSearch('التحضير للتناول للأطفال'), audioSrc: '', demo: true,
      },
      {
        id: 'kg2-agpeya', title: 'صلاة الأجبية', description: 'نتعلم نصلي كل يوم.', icon: '📿', order: 4,
        body: 'في الأجبية صلوات لكل ساعة من اليوم.\n\nنختار ساعة واحدة ونصليها كل يوم بهدوء.',
        notes: 'اطلبوا من الطفل أن يختار الوقت الذي يناسبه.',
        youtubeUrl: youtubeSearch('الأجبية للأطفال'), audioSrc: '', demo: true,
      },
    ],
    settings: {
      copticSourceUrl: youtubeSearch('تعليم الحروف القبطية للأطفال'),
      parentNote: 'فصل KG2: لحن أو درس كامل كل أسبوع، مع مراجعة الحروف القبطية من لوحة الحروف.',
    },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getDefaultData(classId = 'kg1') {
  const seed = seeds[classId] || seeds.kg1;
  return clone({
    ...seed,
    version: 2,
    classId: seeds[classId] ? classId : 'kg1',
    copticLetters: buildLetters(seeds[classId] ? classId : 'kg1'),
    progress: { completed: [] },
  });
}

export const DEFAULT_DATA = getDefaultData('kg1');

export const CLASS_SEEDS = Object.freeze(Object.keys(seeds));
