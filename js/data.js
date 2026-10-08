// The seed content lives in one place so it can later be replaced by an API.
// Content below comes from the school curriculum PDFs (منهج مدرسة الشمامسة،
// كتاب "الكنيسة بيتي" و"الكنيسة أمي"، ومنهج القبطي المشترك).

const DRIVE_COPTIC_BOOK = 'https://drive.google.com/file/d/1f5p3_kKpJCWpRy6fuxjtkLkMlEeh23ju/view';
const YOUTUBE_LETTERS_SONG = 'https://www.youtube.com/watch?v=WtFpaXtv3q4';
const RECORDING = {
  babyclass: 'assets/audio/Babyclass-1.ogg',
  kg1: 'assets/audio/KG1-1.ogg',
  kg2: 'assets/audio/KG2-1.mp4',
};

// Shared Coptic alphabet for all classes (منهج القبطي المشترك): the first six letters.
const copticAlphabet = [
  ['Ⲁ', 'Alpha', 'ألفا'], ['Ⲃ', 'Vita', 'بيتا'], ['Ⲅ', 'Gamma', 'غما'],
  ['Ⲇ', 'Delta', 'دلتا'], ['Ⲉ', 'E', 'إي'], ['Ⲋ', 'Sou', 'سو'],
];

const wordExamples = {
  'Ⲁ': ['ⲁⲅⲓⲟⲥ', 'أجيوس — قدوس'],
  'Ⲃ': ['ⲃⲓⲃⲗⲓⲟⲛ', 'بيبليون — كتاب'],
  'Ⲇ': ['ⲇⲟⲝⲁ', 'دوكسا — المجد'],
  'Ⲉ': ['ⲉⲓⲣⲏⲛⲏ', 'إيريني — السلام'],
};

function buildLetters(classId) {
  return copticAlphabet.map(([glyph, transliteration, arabicName], index) => {
    const example = wordExamples[glyph];
    return {
      id: `${classId}-letter-${index + 1}`,
      glyph,
      name: arabicName,
      transliteration,
      word: example?.[0] || '',
      translation: example?.[1] || '',
      order: index + 1,
      audioSrc: '',
      note: index === 0 ? 'ردّدوا اسم الحرف مع الشكل، وجرّبوا كتابته على الورقة.' : '',
      demo: false,
    };
  });
}

const BABY_HYMNS = [
  {
    id: 'babyclass-sharoubim', title: 'لحن الشاروبيم يسجدون لك', description: 'أول لحن للفصل، نرنمه بالكلمات الأولى مع الشمامسة.', icon: '🎵', order: 1,
    lyrics: 'الشاروبيم يسجدون لك والسيرافيم يمجدونك\nصارخين قائلين: قدوس قدوس قدوس رب الصباؤوت\nالسماء والأرض مملوءتان من مجدك الأقدس',
    notes: 'استمعوا معا أولا، ثم رددوا الكلمة الأولى «قدوس».',
    youtubeUrl: '', audioSrc: RECORDING.babyclass, recordingSrc: '', demo: false,
  },
  {
    id: 'babyclass-barakatohom', title: 'لحن بركتهم المقدسة', description: 'ترنيمة قصيرة للبركة والطلب من الرب.', icon: '🙏', order: 2,
    lyrics: 'بركتهم المقدسة فلتكن معنا آمين.\nالمجد لك يا رب (يا رب لك المجد).\nيا رب ارحم، يا رب ارحم، يا رب باركنا\nيا رب نيّحهم آمين.',
    notes: '', youtubeUrl: '', audioSrc: '', recordingSrc: '', demo: false,
  },
  {
    id: 'babyclass-kama-kan', title: 'لحن كما كان', description: 'ترنيمة قصيرة نختم بها.', icon: '✨', order: 3,
    lyrics: 'كما كان هكذا يكون\nإلى جيل وإلى دهر الداهرين آمين.',
    notes: '', youtubeUrl: '', audioSrc: '', recordingSrc: '', demo: false,
  },
];

const KG_HYMNS = [
  {
    id: 'kg-gospel-kiahk', title: 'مرد إنجيل الأحد الأول والثاني من شهر كيهك', description: 'أول لحن للفصل، مرد الإنجيل بالكلمات الأولى.', icon: '🎵', order: 1,
    lyrics: 'نعطيك السلام: مع غبريال الملاك\nقائلين: السلام لك يا ممتلئة نعمة: الرب معك\nمن أجل هذا نمجدك: كوالدة الإله كل حين\nإسألي الرب عنا ليغفر لنا خطايانا',
    notes: 'استمعوا معا ثم رددوا الكلمات الأولى.',
    youtubeUrl: '', audioSrc: '', recordingSrc: '', demo: false,
  },
  {
    id: 'kg-closing-prayers', title: 'مرد ختام الصلوات', description: 'نرددها عند ختام الصلوات.', icon: '🕊️', order: 2,
    lyrics: 'آمين هللويا: المجد للآب والابن والروح القدس\nالآن وكل أوان وإلى دهر الداهرين آمين\nنصرخ قائلين: ربنا يسوع المسيح',
    notes: '', youtubeUrl: '', audioSrc: '', recordingSrc: '', demo: false,
  },
  {
    id: 'kg-bless-creation', title: 'لحن بارك (أيام السنة)', description: 'بركة الخليقة حسب أيام النيل والزراعة والأثمار.', icon: '🌾', order: 3,
    lyrics: 'بارك أيام النيل من 12 بؤونه إلى 9 بابة\nبارك مياه الأنهار (أيام الزراعة 10 بابه إلى 10 طوبه)\nبارك الزروع والعشب (أيام الأثمار 11 طوبه إلى 11 بؤونه)\nبارك أهوية السماء\nفلتكن رحمتك وسلامك حصنا لشعبك',
    notes: '', youtubeUrl: '', audioSrc: '', recordingSrc: '', demo: false,
  },
];

const BABY_LITURGY = [
  {
    id: 'babyclass-church-home', title: 'الكنيسة بيتي', description: 'بيت الله أبي السماوي، وأسرتي الكبيرة.', icon: '⛪', order: 1,
    body: 'الكنيسة هي بيت الله أبي السماوي.\n\nوهي بيت الملائكة والقديسين، فيها نصلي ونرنم ونتعلم.\n\nالكنيسة هي البيت اللي بيضمنا كلنا، وأنا وكل إخوتي دي أسرتي الكبيرة.',
    notes: 'اسألوا الطفل: إيه اللي بنعمله في الكنيسة؟', youtubeUrl: '', audioSrc: '', demo: false,
  },
  {
    id: 'babyclass-way-to-church', title: 'في طريقي إلى الكنيسة', description: 'أفرح وأنا ماشي للكنيسة.', icon: '🚶', order: 2,
    body: 'أنا أذهب للكنيسة فرحان، كما تطير الحمامة إلى عشها.\n\nوأنا أرتل قائلا: «ما أحلى مساكنك يا رب الجنود».\n\nوأقول: «فرحت بالقائلين لي: إلى بيت الرب نذهب».',
    notes: 'ردّدوا الجملة معا وأنتم ماشيين.', youtubeUrl: '', audioSrc: '', demo: false,
  },
  {
    id: 'babyclass-greet-father', title: 'أركع وأسلم على أبي الكاهن', description: 'أركع عند باب الهيكل، وأحب أبي الكاهن.', icon: '🙇', order: 3,
    body: 'أركع على باب الهيكل وأصلي «أبانا الذي...».\n\nوبعد كده أسلم على أبي الكاهن، فأنا أحب أبي الكاهن وأقبل إيده.\n\nهو يرشدني ويعلمني، وأنا أسمع كلامه.',
    notes: '', youtubeUrl: '', audioSrc: '', demo: false,
  },
  {
    id: 'babyclass-sign-cross', title: 'علامة الصليب عند دخول الكنيسة', description: 'أول ما أدخل الكنيسة أرسم الصليب.', icon: '✝️', order: 4,
    body: 'قبل ما أسلم على أي حد، أسلم على صاحب البيت الكبير، الله.\n\nفأول ما أدخل الكنيسة أرسم الصليب:\nباسم الآب، والابن، والروح القدس، الإله الواحد، آمين.',
    notes: 'ساعدوا الطفل يرسم الصليب بيده في البداية.', youtubeUrl: '', audioSrc: '', demo: false,
  },
];

const KG_LITURGY = [
  {
    id: 'kg-baptism', title: 'المعمودية', description: 'الكنيسة أمي: تلدني من المعمودية.', icon: '💧', order: 1,
    body: 'الكنيسة هي أمي، وهي اللي ولدتني من المعمودية.\n\nقال الرب: «عمدوهم باسم الآب والابن والروح القدس» (متى 28: 19).\n\nالمعمودية تكون بالغطس في الماء ثلاث مرات، زي ما يسوع كان مدفون.\n\nنردد معا: «كنيستي ولدتني، ما خرجت من المعمودية، وبقى ربنا أبويا والكنيسة أمي».',
    notes: 'الآية: «عمدوهم باسم الآب والابن والروح القدس».', youtubeUrl: '', audioSrc: '', demo: false,
  },
  {
    id: 'kg-chrism', title: 'الميرون', description: 'سر الميرون والروح القدس.', icon: '🕯️', order: 2,
    body: 'الكنيسة بترشمني بالميرون، 36 شمة في جسمي، عشان الشيطان ما يغلبنيش.\n\nقال الرب: «أقبلوا الروح القدس» (يوحنا 20: 22).\n\nماما بتحميني وبتطعمني عشان الأمراض الوحشة ما تموتنيش، وروح ربنا يحفظ ويصون.',
    notes: 'الآية: «أقبلوا الروح القدس».', youtubeUrl: '', audioSrc: '', demo: false,
  },
  {
    id: 'kg-repentance', title: 'التوبة والاعتراف', description: 'الكنيسة تنضفني من الخطية.', icon: '🙏', order: 3,
    body: 'كنيستي بتنضفني من الخطية، عشان قلبي يبقى أبيض زي الملايكة.\n\nماما بتنضفني من كل حاجة وحشة، عشان صحتي تبقى حلوة.\n\nقال الابن الضال: «يا أبي أخطأت إلى السماء وقدامك» (لوقا 15: 18).\n\nأروح لأبونا بعدما أتوب، وأقوله على كل التوب، عشان يبقى نضيف.',
    notes: 'الآية: «يا أبي أخطأت إلى السماء وقدامك».', youtubeUrl: '', audioSrc: '', demo: false,
  },
];

const hymnTitles = (list) => list.map((item) => item.title);
const copticPoints = copticAlphabet.map(([glyph, , arabic]) => `${glyph} ${arabic}`);
const copticLinks = [
  { label: 'كتاب الحروف القبطية (Drive)', url: DRIVE_COPTIC_BOOK },
  { label: 'ترنيمة الحروف (يوتيوب)', url: YOUTUBE_LETTERS_SONG },
];

const BABY_CURRICULUM = [
  {
    id: 'babyclass-curr-hymns', title: 'الألحان', icon: '🎵', duration: '',
    goal: 'ترديد ثلاثة ألحان قصيرة مع الكلمات الأساسية.',
    points: hymnTitles(BABY_HYMNS),
    reference: 'منهج الألحان — مرحلة بيبي كلاس', links: [],
  },
  {
    id: 'babyclass-curr-liturgy', title: 'الطقس: الكنيسة بيتي', icon: '⛪', duration: '3 حصص',
    goal: 'أن يعرف الطفل إيه هي الكنيسة، وإيه اللي بيعمله فيها، وإزاي يدخلها.',
    points: hymnTitles(BABY_LITURGY),
    reference: 'كتاب الكنيسة بيتي — منهج كنيسة العذراء والقديس أثناسيوس، صفحات 5 إلى 8', links: [],
  },
  {
    id: 'babyclass-curr-coptic', title: 'القبطي: الحروف الأولى', icon: 'Ⲁ', duration: '3 حصص',
    goal: 'حفظ ترتيب الحروف القبطية (أول 4 أبيات)، والتعرف على أشكال أول 6 حروف وكيفية كتابتها بدون قواعد.',
    points: copticPoints,
    reference: 'منهج القبطي المشترك، صفحات 5 إلى 8', links: copticLinks,
  },
];

const KG_CURRICULUM = [
  {
    id: 'kg-curr-hymns', title: 'الألحان', icon: '🎵', duration: '',
    goal: 'ترديد المردات الأساسية في الكنيسة مع الكلمات.',
    points: hymnTitles(KG_HYMNS),
    reference: 'منهج الألحان — من شهر كيهك وختام الصلوات', links: [],
  },
  {
    id: 'kg-curr-liturgy', title: 'الطقس: الكنيسة أمي', icon: '⛪', duration: '3 حصص',
    goal: 'التعرف على أسرار المعمودية والميرون والتوبة والاعتراف، وحفظ آية لكل سر.',
    points: hymnTitles(KG_LITURGY),
    reference: 'كتاب الكنيسة أمي — منهج كنيسة العذراء والقديس أثناسيوس، صفحات 6 إلى 9', links: [],
  },
  {
    id: 'kg-curr-coptic', title: 'القبطي: الحروف الأولى', icon: 'Ⲁ', duration: '3 حصص',
    goal: 'حفظ ترتيب الحروف القبطية (أول 4 أبيات)، والتعرف على أشكال أول 6 حروف وكيفية كتابتها بدون قواعد.',
    points: copticPoints,
    reference: 'منهج القبطي المشترك، صفحات 5 إلى 8', links: copticLinks,
  },
];

const seeds = {
  babyclass: {
    students: [],
    hymns: BABY_HYMNS,
    liturgy: BABY_LITURGY,
    curriculum: BABY_CURRICULUM,
    settings: {
      copticSourceUrl: DRIVE_COPTIC_BOOK,
      parentNote: 'فصل البيبي: لحن واحد كل أسبوع، وكلمة من الحكاية، وبعدها لعبة أو رسمة.',
    },
  },
  kg1: {
    students: [],
    // First hymn of KG1 carries the school recording.
    hymns: KG_HYMNS.map((item, index) => (index === 0 ? { ...item, audioSrc: RECORDING.kg1 } : item)),
    liturgy: KG_LITURGY,
    curriculum: KG_CURRICULUM,
    settings: {
      copticSourceUrl: DRIVE_COPTIC_BOOK,
      parentNote: 'اختاروا محطة، واستمتعوا بها معا.',
    },
  },
  kg2: {
    students: [],
    // First hymn of KG2 carries the school recording.
    hymns: KG_HYMNS.map((item, index) => (index === 0 ? { ...item, audioSrc: RECORDING.kg2 } : item)),
    liturgy: KG_LITURGY,
    curriculum: KG_CURRICULUM,
    settings: {
      copticSourceUrl: DRIVE_COPTIC_BOOK,
      parentNote: 'اختاروا محطة، واستمتعوا بها معا.',
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
