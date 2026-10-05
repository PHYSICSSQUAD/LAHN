// The seed content is deliberately kept in one place so it can later be replaced by an API.
const demoTone = 'assets/audio/demo-tone.wav';
const youtubeSearch = (query) => `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;

const copticAlphabet = [
  ['Ⲁ', 'Alpha', 'ألفا'], ['Ⲃ', 'Vida', 'ڤيدا'], ['Ⲅ', 'Gamma', 'جاما'], ['Ⲇ', 'Dalda', 'دالدا'],
  ['Ⲉ', 'E', 'إي'], ['Ⲋ', 'Sou', 'سو'], ['Ⲍ', 'Zeta', 'زيتا'], ['Ⲏ', 'Eta', 'إيتا'],
  ['Ⲑ', 'Thita', 'ثيتا'], ['Ⲓ', 'Iota', 'يوتا'], ['Ⲕ', 'Kappa', 'كابا'], ['Ⲗ', 'Laula', 'لاولا'],
  ['Ⲙ', 'Mi', 'مي'], ['Ⲛ', 'Ni', 'ني'], ['Ⲝ', 'Ksi', 'كسي'], ['Ⲟ', 'O', 'أو'],
  ['Ⲡ', 'Pi', 'بي'], ['Ⲣ', 'Ro', 'رو'], ['Ⲥ', 'Sima', 'سيما'], ['Ⲧ', 'Tau', 'طاو'],
  ['Ⲩ', 'Epsi', 'إبسي'], ['Ⲫ', 'Fi', 'في'], ['Ⲭ', 'Khi', 'خي'], ['Ⲯ', 'Psi', 'بسي'],
  ['Ⲱ', 'Oou', 'أوّ'], ['Ϣ', 'Shai', 'شاي'], ['Ϥ', 'Fai', 'فاي'], ['Ϧ', 'Khai', 'خاي'],
  ['Ϩ', 'Hori', 'هوري'], ['Ϫ', 'Janja', 'جانجا'], ['Ϭ', 'Chima', 'تشيما'], ['Ϯ', 'Ti', 'تي'],
];

const wordExamples = {
  'Ⲁ': ['ⲁⲅⲓⲟⲥ', 'أجيوس — قدوس'],
  'Ⲃ': ['ⲃⲓⲃⲗⲓⲟⲛ', 'بيبلْيون — كتاب'],
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

export const DEFAULT_DATA = {
  version: 1,
  students: [
    { id: 'student-ahmed', name: 'أحمد', score: 950, avatar: '🦁' },
    { id: 'student-mariam', name: 'مريم', score: 870, avatar: '🦋' },
    { id: 'student-youssef', name: 'يوسف', score: 820, avatar: '🐻' },
    { id: 'student-salma', name: 'سلمى', score: 760, avatar: '🐰' },
    { id: 'student-nour', name: 'نور', score: 640, avatar: '🐼' },
  ],
  hymns: [
    {
      id: 'kyrie-eleison', title: 'لحن كيرياليسون', description: 'ترنيمة قصيرة نطلب فيها الرحمة بفرح.', icon: '🎵', order: 1,
      lyrics: 'كيرياليسون، كيرياليسون\nيا رب ارحمنا، يا رب ارحمنا\nنسبّحك بمحبة وسلام.',
      notes: 'كلمة «كيرياليسون» تعني «يا رب ارحم». يمكن أن يردد الطفل الكلمات مع أحد والديه.',
      youtubeUrl: youtubeSearch('لحن كيرياليسون قبطي للأطفال'),
      audioSrc: demoTone, recordingSrc: demoTone, demo: true,
    },
    {
      id: 'gospel-response', title: 'مرد الإنجيل', description: 'نستمع ونجيب بمحبة في الكنيسة.', icon: '📖', order: 2,
      lyrics: 'المجد لك يا رب\nالمجد لك يا رب\nيا ربنا وإلهنا وملكنا.',
      notes: 'هذا النص للتعرّف على شكل الدرس فقط. استبدله بالنص والتسجيل المعتمدين من الكنيسة.',
      youtubeUrl: youtubeSearch('مرد الإنجيل قبطي'), audioSrc: demoTone, recordingSrc: '', demo: true,
    },
    {
      id: 'blessing-hymn', title: 'لحن البركة', description: 'لحن هادئ نتعلمه مع الأسرة.', icon: '✨', order: 3,
      lyrics: 'بارك يا رب يومنا\nواجعل قلوبنا مليئة بالسلام.',
      notes: 'مساحة لطيفة لملاحظة من المعلم أو ولي الأمر.',
      youtubeUrl: youtubeSearch('لحن البركة قبطي'), audioSrc: demoTone, recordingSrc: '', demo: true,
    },
    {
      id: 'alleluia', title: 'لحن هلليلويا', description: 'نرنّم بكلمة فرح وتسبيح.', icon: '🌈', order: 4,
      lyrics: 'هلليلويا، هلليلويا\nنسبّح اسمك يا الله.',
      notes: 'هلليلويا كلمة تسبيح وفرح. أضف هنا الكلمات الصحيحة والتسجيل الخاص بكم.',
      youtubeUrl: youtubeSearch('لحن هلليلويا قبطي'), audioSrc: '', recordingSrc: '', demo: true,
    },
  ],
  copticLetters: copticAlphabet.map(([glyph, transliteration, arabicName], index) => {
    const example = wordExamples[glyph];
    return {
      id: `coptic-${index + 1}`,
      glyph,
      name: arabicName,
      transliteration,
      word: example?.[0] || '',
      translation: example?.[1] || '',
      order: index + 1,
      audioSrc: index === 0 ? demoTone : '',
      note: index === 0 ? 'جرّب كتابة الحرف في الهواء ثم على الورقة.' : '',
      demo: true,
    };
  }),
  liturgy: [
    {
      id: 'church-home', title: 'بيتي الجميل: الكنيسة', description: 'نتعرّف على بيت الصلاة وماذا نرى فيه.', icon: '⛪', order: 1,
      body: 'الكنيسة بيت الصلاة والاجتماع بمحبة.\n\nنرى فيها المذبح، والأيقونات، والشموع. نسير بهدوء ونصغي إلى الصلوات والترانيم.\n\nاسأل طفلك: ما الشيء الذي تحب أن تراه في الكنيسة؟',
      notes: 'تفسير مبسّط للتعلّم الأسري، ويُفضّل مراجعته مع خادم أو معلّم الكنيسة.',
      youtubeUrl: youtubeSearch('شرح الكنيسة للأطفال قبطي'), audioSrc: demoTone, demo: true,
    },
    {
      id: 'the-cross', title: 'علامة الصليب', description: 'نتعلّم أن الصليب يذكّرنا بمحبة الله.', icon: '✝️', order: 2,
      body: 'الصليب علامة محبة ورجاء. نرسمه باحترام ونبدأ صلاتنا به.\n\nيمكن للأهل أن يشرحوا للطفل خطوات رسم علامة الصليب بهدوء وبطريقة تناسب عمره.',
      notes: 'المحتوى مثال توضيحي أولي قابل للتعديل.', youtubeUrl: youtubeSearch('علامة الصليب للأطفال قبطي'), audioSrc: '', demo: true,
    },
    {
      id: 'incense', title: 'رائحة البخور', description: 'نلاحظ البخور الجميل الذي يرافق الصلاة.', icon: '☁️', order: 3,
      body: 'يرتفع البخور في الكنيسة أثناء الصلاة، وتذكّرنا رائحته أن نرفع قلوبنا بمحبة.\n\nنقف بهدوء، ونصغي، ونتبع إرشادات الكبار.',
      notes: 'شرح عائلي مبسّط؛ لا تلمس المبخرة أو الشموع من دون إشراف شخص بالغ.',
      youtubeUrl: youtubeSearch('البخور في الكنيسة للأطفال'), audioSrc: '', demo: true,
    },
    {
      id: 'liturgy-listening', title: 'أصغي وأشارك', description: 'كيف نستعد للصلاة ونشارك باحترام؟', icon: '🕊️', order: 4,
      body: 'قبل الصلاة، نهدأ ونستعد. أثناءها نصغي إلى الكلمات ونشارك في الردود التي تعلّمناها.\n\nبعدها نتذكر كلمة جميلة أو ترنيمة أحببناها.',
      notes: 'يمكن إضافة أقسام وصور وتسجيلات خاصة بكنيستكم من لوحة الإدارة.',
      youtubeUrl: youtubeSearch('طقس الكنيسة للأطفال قبطي'), audioSrc: '', demo: true,
    },
  ],
  settings: {
    copticSourceUrl: youtubeSearch('تعليم الحروف القبطية للأطفال'),
    parentNote: 'اختاروا محطة، واستمتعوا بها معًا. الأمثلة الحالية تجريبية ويمكنكم تعديلها من مساحة الأهل.'
  },
  progress: { completed: [] },
};
