// All the content of the site lives here (read-only, no admin panel).
// المحتوى مأخوذ من: منهج مدرسة الشمامسة (ملفات PDF داخل مجلد assets)،
// وكتابي «الكنيسة بيتي» و«الكنيسة أمي»، ومنهج القبطي المشترك.
// كلمات الألحان (عربي + قبطي معرب) ومصادرها موثقة بالروابط أسفل كل لحن،
// مع رابط لنفس اللحن بصوت المعلم إبراهيم عياد.

// ---------------------------------------------------------------------------
// مصادر المنهج الرسمية (نفس الروابط الموجودة داخل ملفات المنهج)
// ---------------------------------------------------------------------------
const SOURCE = Object.freeze({
  curriculumPdf: 'assets/منهج مدرسة الشمامسة-2-7.pdf',
  copticCurriculumPdf: 'assets/منهج القبطي المشترك.pdf',
  babyRitualPdf: 'assets/Babyclass_taks.pdf',
  kgRitualPdf: 'assets/KG1&2-TAKS.pdf',
  copticBookDrive: 'https://drive.google.com/file/d/1f5p3_kKpJCWpRy6fuxjtkLkMlEeh23ju/view',
  babyRitualDrive: 'https://drive.google.com/file/d/18tVBLhrULDsZzWFuembEzpE35DAnw2sM/view',
  kgRitualDrive: 'https://drive.google.com/file/d/1ezKSDFU839t-GKpvxHH2V3XeEiIjqaxY/view',
  lettersSong: 'https://www.youtube.com/watch?v=WtFpaXtv3q4',
  sacramentsSong: 'https://www.youtube.com/watch?v=i0jW-fVDQQs',
});

// تسجيلات المدرسة للحن الأول في كل فصل.
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

const COPTIC_SOURCES = [
  { label: 'كتاب الحروف القبطية (Google Drive)', url: SOURCE.copticBookDrive },
  { label: 'ترنيمة الحروف القبطية (يوتيوب)', url: SOURCE.lettersSong },
  { label: 'منهج القبطي المشترك (PDF)', url: SOURCE.copticCurriculumPdf },
];

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
      sources: COPTIC_SOURCES,
    };
  });
}

// ---------------------------------------------------------------------------
// الألحان: لكل لحن الكلام بالعربي وبالقبطي المعرب، ومصادره،
// ورابط نفس اللحن بصوت المعلم إبراهيم عياد.
// ---------------------------------------------------------------------------

const BABY_HYMNS = [
  {
    id: 'babyclass-sharoubim',
    title: 'لحن الشاروبيم يسجدون لك',
    copticTitle: 'ني شيروبيم — Ⲛⲓⲭⲉⲣⲟⲩⲃⲓⲙ',
    description: 'أول لحن للفصل، يقال في القداس بعد «مستحق وعادل».',
    icon: '🎵',
    order: 1,
    lyricsArabic: 'الشاروبيم يسجدون لك: والسيرافيم يمجدونك\nصارخين قائلين: قدوس قدوس قدوس رب الصباؤوت\nالسماء والأرض مملوءتان: من مجدك الأقدس',
    lyricsCoptic: 'ني شيروبيم سى أوأوشت إمموك: نيم ني سيرافيم سى تي أوأوو ناك\nإفؤش إيفول إفجو إمموس: جى أجيوس أجيوس أجيوس كيريوس صاباؤوت\nبليريس أورانوس كى إي جي: تيس أجياس سو ذوكسيس',
    notes: 'استمعوا معا أولا، ثم رددوا الكلمة الأولى «قدوس».',
    audioSrc: RECORDING.babyclass,
    ayad: {
      label: 'لحن ني شيروبيم — المعلم إبراهيم عياد',
      url: 'https://www.youtube.com/watch?v=qgGU88NijBc',
    },
    sources: [
      { label: 'كلمات اللحن (عربي وقبطي معرب) — مدرسة الشمامسة', url: 'https://madraset-elshamamsa.com/al7an/php/Odas/AlSharobimYasgodon.php' },
      { label: 'منهج مدرسة الشمامسة — مرحلة بيبي كلاس (PDF)', url: SOURCE.curriculumPdf },
    ],
  },
  {
    id: 'babyclass-barakatohom',
    title: 'لحن بركتهم المقدسة',
    copticTitle: 'إيريبو إسمو — Ⲉⲣⲉ ⲡⲟⲩⲥ̀ⲙⲟⲩ',
    description: 'لحن قصير نطلب فيه بركة القديسين، ويقال بعد المجمع في القداس.',
    icon: '🙏',
    order: 2,
    lyricsArabic: 'بركتهم المقدسة فلتكن معنا آمين\nالمجد لك يا رب\nيا رب ارحم، يا رب ارحم، يا رب باركنا\nيا رب نيّحهم آمين',
    lyricsCoptic: 'إيريبو إسمو إثؤواب شوبي نيمان آمين\nذوكصاسي كيريي\nكيريي إليسون: كيريي إليسون: كيريي إفلوجيسون\nكيريي آناباڤسون آمين',
    notes: 'لحن سهل وكلامه معروف، ردّدوا معا «بركتهم المقدسة فلتكن معنا آمين».',
    audioSrc: '',
    ayad: {
      label: 'لحن بركتهم المقدسة — المعلم إبراهيم عياد',
      url: 'https://www.youtube.com/watch?v=K_9t2MWs_zE',
    },
    sources: [
      { label: 'كلمات اللحن (عربي وقبطي معرب) — مدرسة الشمامسة', url: 'https://madraset-elshamamsa.com/al7an/php/Odas/Barakathom.php' },
      { label: 'كتاب الخولاجي — القداس الباسيلي (موقع الأنبا تكلا)', url: 'https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-Liturgy-Lyrics/2-St-Basil-Liturgy/St-Basilious-Mass-049-Barakathom.html' },
      { label: 'منهج مدرسة الشمامسة — مرحلة بيبي كلاس (PDF)', url: SOURCE.curriculumPdf },
    ],
  },
  {
    id: 'babyclass-kama-kan',
    title: 'لحن كما كان',
    copticTitle: 'أوس بيرين — Ⲱⲥⲡⲉⲣ ⲏⲛ',
    description: 'لحن قصير نختم به، ويقال بعد الترحيم في القداس.',
    icon: '✨',
    order: 3,
    lyricsArabic: 'كما كان هكذا يكون\nمن جيل إلى جيل وإلى دهر الدهور آمين',
    lyricsCoptic: 'أوس بيرين كي إستي إستين: أبو جينيآس إيس جينيآن\nكي بانداس طوس إيؤناس طون إيؤنون آمين',
    notes: 'لحن قصير جدا، جميل للحفظ مع الأطفال.',
    audioSrc: '',
    ayad: {
      label: 'كما كان هكذا يكون — المعلم إبراهيم عياد',
      url: 'https://www.youtube.com/watch?v=E5b1qo5yMrs',
    },
    sources: [
      { label: 'كلمات اللحن (عربي وقبطي معرب) — مدرسة الشمامسة', url: 'https://madraset-elshamamsa.com/al7an/php/Odas/Kamakan.php' },
      { label: 'منهج مدرسة الشمامسة — مرحلة بيبي كلاس (PDF)', url: SOURCE.curriculumPdf },
    ],
  },
];

const KG_HYMNS = [
  {
    id: 'kg-gospel-kiahk',
    title: 'مرد إنجيل الأحد الأول والثاني من شهر كيهك',
    copticTitle: 'تين تي ني إمبي شيريتيسموس — Ⲧⲉⲛϯ ⲛⲉ',
    description: 'أول لحن للفصل، يقال بعد الإنجيل في قداسات أول أسبوعين من كيهك.',
    icon: '🎵',
    order: 1,
    lyricsArabic: 'نعطيك السلام: مع غبريال الملاك\nقائلين: السلام لك يا ممتلئة نعمة: الرب معك\nمن أجل هذا نمجدك: كوالدة الإله كل حين\nاسألي الرب عنا: ليغفر لنا خطايانا',
    lyricsCoptic: 'تين تي ني إمبي شيريتيسموس: نيم غبرييل بي أنجيلوس\nجى شيري كي خاريتوميني: أوكيريوس ميطاسو\nإثفي فاي تين تي أوؤو ني: هوس ثيئوطوكوس إنسيو نيفين\nماتي هو إبتشويس إي إهري إيجون: إنتيف كانين نوفي نان إيفول',
    notes: 'نفتكر تحية الملاك غبريال للعذراء: «السلام لك يا ممتلئة نعمة» (لوقا 1: 28).',
    audioSrc: '',
    ayad: {
      label: 'مرد الإنجيل للأحدين الأول والثاني من كيهك — المعلم إبراهيم عياد',
      url: 'https://www.youtube.com/watch?v=PqGdOQPO3S0',
    },
    sources: [
      { label: 'كلمات اللحن (عربي وقبطي معرب) — مدرسة الشمامسة', url: 'https://madraset-elshamamsa.com/al7an/php/Keyahk/TenTiNemby.php' },
      { label: 'كتاب خدمة الشماس — مرد إنجيل كيهك (موقع الأنبا تكلا)', url: 'https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-02-Deacons-Service/Khedmet-El-Shammas/Maradat-182-Kiahk-Bible-1.html' },
      { label: 'منهج مدرسة الشمامسة — مرحلة KG1 و KG2 (PDF)', url: SOURCE.curriculumPdf },
    ],
  },
  {
    id: 'kg-closing-prayers',
    title: 'مرد ختام الصلوات السنوي',
    copticTitle: 'آمين الليلويا ذوكصاباتري — Ⲁⲙⲏⲛ ⲁ̅ⲗ̅ Ⲇⲟⲝⲁ Ⲡⲁⲧⲣⲓ',
    description: 'نرددها عند ختام الصلوات وفي نهاية القداس.',
    icon: '🕊️',
    order: 2,
    lyricsArabic: 'آمين هلليلويا: المجد للآب والابن والروح القدس\nالآن وكل أوان وإلى دهر الدهور آمين\nنصرخ قائلين: يا ربنا يسوع المسيح',
    lyricsCoptic: 'آمين الليلويا: ذوكصاباتري كيه إيو كيه أجيو بنيفماتي\nكي نين كي أ إي كي إستوس إيؤناس طون إيؤنون آمين\nتين أوش إيفول إنجو إمموس جي: أو بينتشويس إيسوس بيخريستوس',
    notes: 'في آخر القداس نمجد الثالوث القدوس ونطلب البركة.',
    audioSrc: '',
    ayad: {
      label: 'قانون ختام الصلوات — المعلم إبراهيم عياد',
      url: 'https://www.youtube.com/watch?v=u2GZv6Y993g',
    },
    sources: [
      { label: 'كلمات اللحن (عربي وقبطي معرب) — مدرسة الشمامسة', url: 'https://madraset-elshamamsa.com/al7an/php/Odas/5etam.php' },
      { label: 'مرد ختام الصلوات السنوي — خدمة الشماس (موقع الأنبا تكلا)', url: 'https://st-takla.org/lyrics/ar/liturgy/prayers-conclusion.html' },
      { label: 'منهج مدرسة الشمامسة — مرحلة KG1 و KG2 (PDF)', url: SOURCE.curriculumPdf },
    ],
  },
  {
    id: 'kg-bless-creation',
    title: 'لحن بارك (أيام السنة)',
    copticTitle: 'إسمو — Ⲥ̀ⲙⲟⲩ',
    description: 'القطعة التي تقال داخل ختام الصلوات، وتتغير حسب موسم السنة القبطية.',
    icon: '🌾',
    order: 3,
    lyricsArabic: 'بارك:\n— مياه الأنهار (أيام النيل: من ١٢ بؤونة إلى ٩ بابة)\n— الزروع والعشب (أيام الزراعة: من ١٠ بابة إلى ١٠ طوبة)\n— أهوية السماء (أيام الأثمار: من ١١ طوبة إلى ١١ بؤونة)\nفلتكن رحمتك وسلامك حصنا لشعبك',
    lyricsCoptic: 'إسمو:\n— إي ني موؤو إم إفيارو (أيام النيل)\n— إي ني سيتي نيم ني سيم (أيام الزراعة)\n— إي نيا إير إنتيه إتفيه (أيام الأثمار)\nماري بيك ناي نيم تيك هيريني أوي إنسوفت إم بيك لاؤس',
    notes: 'اختاروا الجملة المناسبة لموسم السنة، فالكنيسة تبارك المياه والزرع والثمار.',
    audioSrc: '',
    ayad: {
      label: 'قانون ختام الصلوات (وبداخله لحن بارك) — المعلم إبراهيم عياد',
      url: 'https://www.youtube.com/watch?v=u2GZv6Y993g',
    },
    sources: [
      { label: 'كلمات اللحن (عربي وقبطي معرب) — مدرسة الشمامسة', url: 'https://madraset-elshamamsa.com/al7an/php/Odas/5etam.php' },
      { label: 'أواشي المياه والزروع والثمار — الخولاجي (موقع الأنبا تكلا)', url: 'https://st-takla.org/Lyrics-Spiritual-Songs/Words-of-Coptic-Alhan-Tasbeha-Kodas/Arabic-Coptic-Liturgy-Lyrics/4-St-Cyril-Liturgy/St-Kirellos-Mass-010-Awashi-Miah-Zero3-Themar.html' },
    ],
  },
];

// ---------------------------------------------------------------------------
// دروس الطقس
// ---------------------------------------------------------------------------

const BABY_RITUAL_SOURCES = [
  { label: 'كتاب «الكنيسة بيتي» — منهج كنيسة العذراء والأنبا أثناسيوس (Google Drive)', url: SOURCE.babyRitualDrive },
  { label: 'نسخة الطقس داخل الموقع (PDF)', url: SOURCE.babyRitualPdf },
];

const KG_RITUAL_SOURCES = [
  { label: 'كتاب «الكنيسة أمي» — منهج كنيسة العذراء والأنبا أثناسيوس (Google Drive)', url: SOURCE.kgRitualDrive },
  { label: 'ترنيمة أسرار الكنيسة: واحد اتنين تلاتة أربعة (يوتيوب)', url: SOURCE.sacramentsSong },
  { label: 'نسخة الطقس داخل الموقع (PDF)', url: SOURCE.kgRitualPdf },
];

const BABY_LITURGY = [
  {
    id: 'babyclass-church-home', title: 'الكنيسة بيتي', description: 'بيت الله أبي السماوي، وأسرتي الكبيرة.', icon: '⛪', order: 1,
    body: 'الكنيسة هي بيت الله أبي السماوي.\n\nوهي بيت الملائكة والقديسين، فيها نصلي ونرنم ونتعلم.\n\nالكنيسة هي البيت اللي بيضمنا كلنا، وأنا وكل إخوتي دي أسرتي الكبيرة.',
    notes: 'اسألوا الطفل: إيه اللي بنعمله في الكنيسة؟', audioSrc: '', sources: BABY_RITUAL_SOURCES,
  },
  {
    id: 'babyclass-way-to-church', title: 'في طريقي إلى الكنيسة', description: 'أفرح وأنا ماشي للكنيسة.', icon: '🚶', order: 2,
    body: 'أنا أذهب للكنيسة فرحان، كما تطير الحمامة إلى عشها.\n\nوأنا أرتل قائلا: «ما أحلى مساكنك يا رب الجنود».\n\nوأقول: «فرحت بالقائلين لي: إلى بيت الرب نذهب».',
    notes: 'ردّدوا الجملة معا وأنتم ماشيين.', audioSrc: '', sources: BABY_RITUAL_SOURCES,
  },
  {
    id: 'babyclass-greet-father', title: 'أركع وأسلم على أبي الكاهن', description: 'أركع عند باب الهيكل، وأحب أبي الكاهن.', icon: '🙇', order: 3,
    body: 'أركع على باب الهيكل وأصلي «أبانا الذي...».\n\nوبعد كده أسلم على أبي الكاهن، فأنا أحب أبي الكاهن وأقبل إيده.\n\nهو يرشدني ويعلمني، وأنا أسمع كلامه.',
    notes: '', audioSrc: '', sources: BABY_RITUAL_SOURCES,
  },
  {
    id: 'babyclass-sign-cross', title: 'علامة الصليب عند دخول الكنيسة', description: 'أول ما أدخل الكنيسة أرسم الصليب.', icon: '✝️', order: 4,
    body: 'قبل ما أسلم على أي حد، أسلم على صاحب البيت الكبير، الله.\n\nفأول ما أدخل الكنيسة أرسم الصليب:\nباسم الآب، والابن، والروح القدس، الإله الواحد، آمين.',
    notes: 'ساعدوا الطفل يرسم الصليب بيده في البداية.', audioSrc: '', sources: BABY_RITUAL_SOURCES,
  },
];

const KG_LITURGY = [
  {
    id: 'kg-baptism', title: 'المعمودية', description: 'الكنيسة أمي: تلدني من المعمودية.', icon: '💧', order: 1,
    body: 'الكنيسة هي أمي، وهي اللي ولدتني من المعمودية.\n\nقال الرب: «عمدوهم باسم الآب والابن والروح القدس» (متى 28: 19).\n\nالمعمودية تكون بالغطس في الماء ثلاث مرات، زي ما يسوع كان مدفون.\n\nنردد معا: «كنيستي ولدتني، ما خرجت من المعمودية، وبقى ربنا أبويا والكنيسة أمي».',
    notes: 'الآية: «عمدوهم باسم الآب والابن والروح القدس».', audioSrc: '', sources: KG_RITUAL_SOURCES,
  },
  {
    id: 'kg-chrism', title: 'الميرون', description: 'سر الميرون والروح القدس.', icon: '🕯️', order: 2,
    body: 'الكنيسة بترشمني بالميرون، 36 شمة في جسمي، عشان الشيطان ما يغلبنيش.\n\nقال الرب: «أقبلوا الروح القدس» (يوحنا 20: 22).\n\nماما بتحميني وبتطعمني عشان الأمراض الوحشة ما تموتنيش، وروح ربنا يحفظ ويصون.',
    notes: 'الآية: «أقبلوا الروح القدس».', audioSrc: '', sources: KG_RITUAL_SOURCES,
  },
  {
    id: 'kg-repentance', title: 'التوبة والاعتراف', description: 'الكنيسة تنضفني من الخطية.', icon: '🙏', order: 3,
    body: 'كنيستي بتنضفني من الخطية، عشان قلبي يبقى أبيض زي الملايكة.\n\nماما بتنضفني من كل حاجة وحشة، عشان صحتي تبقى حلوة.\n\nقال الابن الضال: «يا أبي أخطأت إلى السماء وقدامك» (لوقا 15: 18).\n\nأروح لأبونا بعدما أتوب، وأقوله على كل التوب، عشان يبقى نضيف.',
    notes: 'الآية: «يا أبي أخطأت إلى السماء وقدامك».', audioSrc: '', sources: KG_RITUAL_SOURCES,
  },
];

// ---------------------------------------------------------------------------
// المنهج
// ---------------------------------------------------------------------------

const hymnTitles = (list) => list.map((item) => item.title);
const copticPoints = copticAlphabet.map(([glyph, , arabic]) => `${glyph} ${arabic}`);

const BABY_CURRICULUM = [
  {
    id: 'babyclass-curr-hymns', title: 'الألحان', icon: '🎵', duration: '',
    goal: 'ترديد ثلاثة ألحان قصيرة بالعربي والقبطي المعرب.',
    points: hymnTitles(BABY_HYMNS),
    reference: 'منهج الألحان — مرحلة بيبي كلاس',
    links: [
      { label: 'منهج مدرسة الشمامسة (PDF)', url: SOURCE.curriculumPdf },
      { label: 'ألحان القداس بصوت المعلم إبراهيم عياد (قناة الليلويا)', url: 'https://www.youtube.com/@Alleluia/playlists' },
    ],
  },
  {
    id: 'babyclass-curr-liturgy', title: 'الطقس: الكنيسة بيتي', icon: '⛪', duration: '3 حصص',
    goal: 'أن يعرف الطفل إيه هي الكنيسة، وإيه اللي بيعمله فيها، وإزاي يدخلها.',
    points: hymnTitles(BABY_LITURGY),
    reference: 'كتاب الكنيسة بيتي — منهج كنيسة العذراء والقديس أثناسيوس، صفحات 5 إلى 8',
    links: BABY_RITUAL_SOURCES,
  },
  {
    id: 'babyclass-curr-coptic', title: 'القبطي: الحروف الأولى', icon: 'Ⲁ', duration: '3 حصص',
    goal: 'حفظ ترتيب الحروف القبطية (أول 4 أبيات)، والتعرف على أشكال أول 6 حروف وكيفية كتابتها بدون قواعد.',
    points: copticPoints,
    reference: 'منهج القبطي المشترك، صفحات 5 إلى 8',
    links: COPTIC_SOURCES,
  },
];

const KG_CURRICULUM = [
  {
    id: 'kg-curr-hymns', title: 'الألحان', icon: '🎵', duration: '',
    goal: 'ترديد مردات الكنيسة الأساسية بالعربي والقبطي المعرب.',
    points: hymnTitles(KG_HYMNS),
    reference: 'منهج الألحان — مرد إنجيل كيهك ومرد ختام الصلوات السنوي',
    links: [
      { label: 'منهج مدرسة الشمامسة (PDF)', url: SOURCE.curriculumPdf },
      { label: 'ألحان القداس بصوت المعلم إبراهيم عياد (قناة الليلويا)', url: 'https://www.youtube.com/@Alleluia/playlists' },
    ],
  },
  {
    id: 'kg-curr-liturgy', title: 'الطقس: الكنيسة أمي', icon: '⛪', duration: '3 حصص',
    goal: 'التعرف على أسرار المعمودية والميرون والتوبة والاعتراف، وحفظ آية وبيت من ترنيمة أسرار الكنيسة لكل سر.',
    points: hymnTitles(KG_LITURGY),
    reference: 'كتاب الكنيسة أمي — منهج كنيسة العذراء والقديس أثناسيوس، صفحات 6 إلى 9',
    links: KG_RITUAL_SOURCES,
  },
  {
    id: 'kg-curr-coptic', title: 'القبطي: الحروف الأولى', icon: 'Ⲁ', duration: '3 حصص',
    goal: 'حفظ ترتيب الحروف القبطية (أول 4 أبيات)، والتعرف على أشكال أول 6 حروف وكيفية كتابتها بدون قواعد.',
    points: copticPoints,
    reference: 'منهج القبطي المشترك، صفحات 5 إلى 8',
    links: COPTIC_SOURCES,
  },
];

const seeds = {
  babyclass: {
    hymns: BABY_HYMNS,
    liturgy: BABY_LITURGY,
    curriculum: BABY_CURRICULUM,
    settings: {
      copticSources: COPTIC_SOURCES,
      parentNote: 'فصل البيبي: لحن واحد كل أسبوع، وكلمة من الحكاية، وبعدها لعبة أو رسمة.',
    },
  },
  kg1: {
    // First hymn of KG1 carries the school recording.
    hymns: KG_HYMNS.map((item, index) => (index === 0 ? { ...item, audioSrc: RECORDING.kg1 } : item)),
    liturgy: KG_LITURGY,
    curriculum: KG_CURRICULUM,
    settings: {
      copticSources: COPTIC_SOURCES,
      parentNote: 'اختاروا محطة، واستمتعوا بها معا.',
    },
  },
  kg2: {
    // First hymn of KG2 carries the school recording.
    hymns: KG_HYMNS.map((item, index) => (index === 0 ? { ...item, audioSrc: RECORDING.kg2 } : item)),
    liturgy: KG_LITURGY,
    curriculum: KG_CURRICULUM,
    settings: {
      copticSources: COPTIC_SOURCES,
      parentNote: 'اختاروا محطة، واستمتعوا بها معا.',
    },
  },
};

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function getClassContent(classId = 'kg1') {
  const safeClass = seeds[classId] ? classId : 'kg1';
  const seed = seeds[safeClass];
  return clone({
    ...seed,
    classId: safeClass,
    copticLetters: buildLetters(safeClass),
  });
}

export { SOURCE };
