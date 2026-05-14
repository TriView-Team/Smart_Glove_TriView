export type Language = "en" | "ar";

// Data translation maps for detection values
export const fabricTranslations: Record<string, Record<Language, string>> = {
  Cotton: { en: "Cotton", ar: "قطن" },
  Silk: { en: "Silk", ar: "حرير" },
  Polyester: { en: "Polyester", ar: "بوليستر" },
  Denim: { en: "Denim", ar: "دنيم" },
  Linen: { en: "Linen", ar: "كتان" },
  Wool: { en: "Wool", ar: "صوف" },
  Nylon: { en: "Nylon", ar: "نايلون" },
  Leather: { en: "Leather", ar: "جلد" },
  Satin: { en: "Satin", ar: "ساتان" },
  Velvet: { en: "Velvet", ar: "مخمل" },
  Chiffon: { en: "Chiffon", ar: "شيفون" },
};

export const colorTranslations: Record<string, Record<Language, string>> = {
  Beige: { en: "Beige", ar: "بيج" },
  Blue: { en: "Blue", ar: "أزرق" },
  Black: { en: "Black", ar: "أسود" },
  White: { en: "White", ar: "أبيض" },
  Red: { en: "Red", ar: "أحمر" },
  Navy: { en: "Navy", ar: "كحلي" },
  Green: { en: "Green", ar: "أخضر" },
  Yellow: { en: "Yellow", ar: "أصفر" },
  Pink: { en: "Pink", ar: "وردي" },
  Brown: { en: "Brown", ar: "بني" },
  Gray: { en: "Gray", ar: "رمادي" },
  Orange: { en: "Orange", ar: "برتقالي" },
  Purple: { en: "Purple", ar: "بنفسجي" },
};

export const patternTranslations: Record<string, Record<Language, string>> = {
  Plain: { en: "Plain", ar: "سادة" },
  Striped: { en: "Striped", ar: "مخطط" },
  Checked: { en: "Checked", ar: "مربعات" },
  Floral: { en: "Floral", ar: "زهري" },
  Dotted: { en: "Dotted", ar: "منقط" },
  Geometric: { en: "Geometric", ar: "هندسي" },
};

export const textureTranslations: Record<string, Record<Language, string>> = {
  Smooth: { en: "Smooth", ar: "ناعم" },
  Rough: { en: "Rough", ar: "خشن" },
  Soft: { en: "Soft", ar: "لين" },
  Ribbed: { en: "Ribbed", ar: "مضلّع" },
};

export const translateValue = (
  value: string,
  map: Record<string, Record<Language, string>>,
  lang: Language
): string => {
  return map[value]?.[lang] || value;
};

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Welcome
    "welcome.subtitle": "Welcome to Triview!",
    "welcome.start": "Get Started",

    // Home
    "home.welcome": "Welcome back!",
    "home.subtitle": "Smart Glove Assistant",
    "home.connectGlove": "Connect Glove",
    "home.startRecognition": "Start Recognition",
    "home.wardrobe": "Wardrobe",
    "home.voiceTips": "Voice Tips",
    "home.recentDetections": "Recent Detections",

    // Connection Status
    "status.connected": "Connected to the smart glove",
    "status.notConnected": "Not connected to the smart glove",

    // Connect Screen
    "connect.wearGlove": "Wear the glove so the sensor sits on the back of your hand",
    "connect.connected": "Connected to Smart Glove",
    "connect.scanning": "Scanning for devices...",
    "connect.makesSure": "Make sure your glove is powered on and near your device",
    "connect.pairNow": "Pair now!",
    "connect.scanAgain": "Scan again",
    "connect.disconnect": "Disconnect",
    "connect.pairingSuccess": "Pairing successful",
    "connect.continue": "Continue",

    // Pairing Guide
    "pairing.title": "Pairing Guide",
    "pairing.step1.title": "Turn on the Smart Glove",
    "pairing.step1.desc": "Press and hold the power button on the glove for 3 seconds until the LED light turns on.",
    "pairing.step2.title": "Enable Bluetooth",
    "pairing.step2.desc": "Make sure Bluetooth is enabled on your phone from the device settings.",
    "pairing.step3.title": "Wear the Glove",
    "pairing.step3.desc": "Put on the glove so the sensor sits on the back of your hand for accurate detection.",
    "pairing.step4.title": "Keep Devices Close",
    "pairing.step4.desc": "Hold the glove within 1 meter of your phone for a stable connection.",
    "pairing.step5.title": "Wait for Discovery",
    "pairing.step5.desc": "The app will automatically search for your glove. This may take a few seconds.",
    "pairing.nextStep": "Next Step",
    "pairing.prevStep": "Previous Step",
    "pairing.startPairing": "Start Pairing",
    "pairing.connected": "Connected!",
    "pairing.readyToUse": "Your smart glove is paired and ready to use.",
    "pairing.startUsing": "Start Using",
    "pairing.failed": "Connection Failed",
    "pairing.failedDesc": "We couldn't connect to your smart glove. Please try the following:",
    "pairing.tip1": "Make sure the glove is powered on",
    "pairing.tip2": "Check that Bluetooth is enabled",
    "pairing.tip3": "Move the glove closer to your phone",
    "pairing.tip4": "Restart the glove and try again",
    "pairing.tryAgain": "Try Again",
    "pairing.connecting": "Connecting...",
    "pairing.searching": "Searching for devices...",
    "pairing.deviceFound": "Device found. Establishing connection...",
    "pairing.almostThere": "Almost there...",
    "pairing.listenGuide": "Listen to Guide",
    "pairing.stopGuide": "Stop Guide",

    // Detection
    "detection.title": "Start Recognition",
    "detection.liveDetection": "Live Detection",
    "detection.fromWardrobe": "From Wardrobe",
    "detection.scanning": "Scanning...",
    "detection.touchFabric": "Touch a fabric item and tap to detect",
    "detection.connectFirst": "Please connect your smart glove first",
    "detection.completed": "Detection completed!",
    "detection.detected": "detected",
    "detection.noItems": "No saved items. Detect items first to add them to your wardrobe.",
    "detection.fabric": "Fabric:",
    "detection.color": "Color:",
    "detection.pattern": "Pattern:",
    "detection.texture": "Texture:",
    "detection.listen": "Listen to more details",
    "detection.save": "Save to Wardrobe",
    "detection.remove": "Remove from cupboard",
    "detection.backToList": "Back to list",
    "detection.itemSaved": "Item saved to wardrobe!",
    "detection.added": "added",
    "detection.itemIs": "The item is",
    "detection.fabricWord": "fabric",
    "detection.textureWord": "texture",
    "detection.patternWord": "pattern",

    // Wardrobe
    "wardrobe.title": "Wardrobe",
    "wardrobe.search": "Search items...",
    "wardrobe.all": "All",
    "wardrobe.shirts": "Shirts",
    "wardrobe.dresses": "Dresses",
    "wardrobe.accessories": "Accessories",
    "wardrobe.shoes": "Shoes",
    "wardrobe.noItems": "No items found",

    // Settings
    "settings.title": "Settings",
    "settings.language": "Language",
    "settings.voiceControl": "Voice control",
    "settings.bluetooth": "Bluetooth settings",
    "settings.help": "Help",
    "settings.connectedStatus": "Connected to the smart glove",
    "settings.notConnectedStatus": "Not connected to the smart glove",

    // Language Screen
    "language.title": "Language",
    "language.description": "Choose your preferred language for the app interface and voice output.",

    // Voice Control
    "voice.title": "Voice Control",
    "voice.description": "Customize how the app reads detection results aloud.",
    "voice.autoRead": "Auto-read results",
    "voice.autoReadDesc": "Speak detection results automatically",
    "voice.speed": "Speech Speed",
    "voice.slow": "Slow",
    "voice.normal": "Normal",
    "voice.fast": "Fast",
    "voice.volume": "Volume",
    "voice.testVoice": "Test Voice",
    "voice.stop": "Stop",
    "voice.testText": "This is a test of the voice output. The detected item is a blue cotton fabric with a smooth texture.",

    // AI Features
    "ai.title": "AI Features",
    "ai.powered": "Powered by smart intelligence",
    "ai.stylist": "AI Stylist",
    "ai.stylistDesc": "Get personalized outfit recommendations based on your wardrobe.",
    "ai.audioTips": "Audio Intelligence Tips",
    "ai.audioTipsDesc": "Voice-guided fabric care tips, color matching, and styling suggestions.",
    "ai.comingSoon": "Preview — Coming soon",
    "ai.future": "Future",

    // AI Stylist
    "aiStylist.title": "AI Stylist",
    "aiStylist.styleMyLook": "Style My Look!",
    "aiStylist.next": "Next",
    "aiStylist.styledLookDesc": "Here's your styled look! A beige cotton sweater paired with light blue jeans, brown sandals, tortoiseshell sunglasses, gold hoop earrings, and a woven straw tote bag. Perfect for a casual day out.",
    "aiStylist.suggestedAccessory": "Suggested accessory:",
    "aiStylist.outfitSuggestions": "Outfit Suggestions",
    "aiStylist.smartRecommendations": "Smart Recommendations",
    "aiStylist.audioTips": "Audio Tips",
    "aiStylist.recommendation1": "Pair this beige sweater with light denim for a relaxed daytime look.",
    "aiStylist.recommendation2": "Add gold accessories to elevate the outfit for evening events.",
    "aiStylist.recommendation3": "Layer with a neutral jacket when the temperature drops.",

    // Audio Tips
    "audioTips.title": "Audio intelligence tips",
    "audioTips.tip1": "This fabric is suitable for cotton fabrics",
    "audioTips.tip2": "The beige color complements",
    "audioTips.tip3": "Try wearing this look for special occasions",
    "audioTips.trySimilar": "Try a similar format",
    "audioTips.return": "Return",

    // Glove Discovery Modal
    "modal.title": "Triview Link",
    "modal.description": "A smart glove has been discovered nearby. Would you like to pair it to take advantage of its AI and sensory control features?",
    "modal.connect": "Connect",

    // Bottom Nav
    "nav.settings": "Settings",
    "nav.wardrobe": "Wardrobe",
    "nav.routine": "Home",

    // 404
    "notFound.title": "404",
    "notFound.message": "Oops! Page not found",
    "notFound.return": "Return to Home",
  },

  ar: {
    // Welcome
    "welcome.subtitle": "!مرحباً بك في Triview",
    "welcome.start": "ابدأ الآن",

    // Home
    "home.welcome": "!مرحباً بعودتك",
    "home.subtitle": "مساعد القفاز الذكي",
    "home.connectGlove": "توصيل القفاز",
    "home.startRecognition": "بدء التعرف",
    "home.wardrobe": "خزانة الملابس",
    "home.voiceTips": "نصائح صوتية",
    "home.recentDetections": "آخر الاكتشافات",

    // Connection Status
    "status.connected": "متصل بالقفاز الذكي",
    "status.notConnected": "غير متصل بالقفاز الذكي",

    // Connect Screen
    "connect.wearGlove": "ارتدِ القفاز بحيث يكون المستشعر على ظهر يدك",
    "connect.connected": "متصل بالقفاز الذكي",
    "connect.scanning": "...جاري البحث عن الأجهزة",
    "connect.makesSure": "تأكد من تشغيل القفاز وأنه قريب من جهازك",
    "connect.pairNow": "!اقتران الآن",
    "connect.scanAgain": "إعادة البحث",
    "connect.disconnect": "قطع الاتصال",
    "connect.pairingSuccess": "تم الاقتران بنجاح",
    "connect.continue": "متابعة",

    // Pairing Guide
    "pairing.title": "دليل الاقتران",
    "pairing.step1.title": "تشغيل القفاز الذكي",
    "pairing.step1.desc": "اضغط مع الاستمرار على زر التشغيل لمدة 3 ثوانٍ حتى يضيء مؤشر LED.",
    "pairing.step2.title": "تفعيل البلوتوث",
    "pairing.step2.desc": "تأكد من تفعيل البلوتوث في هاتفك من إعدادات الجهاز.",
    "pairing.step3.title": "ارتداء القفاز",
    "pairing.step3.desc": "ارتدِ القفاز بحيث يكون المستشعر على ظهر يدك للكشف الدقيق.",
    "pairing.step4.title": "إبقاء الأجهزة قريبة",
    "pairing.step4.desc": "أبقِ القفاز على بُعد متر واحد من هاتفك لاتصال مستقر.",
    "pairing.step5.title": "انتظار الاكتشاف",
    "pairing.step5.desc": "سيبحث التطبيق تلقائياً عن قفازك. قد يستغرق ذلك بضع ثوانٍ.",
    "pairing.nextStep": "الخطوة التالية",
    "pairing.prevStep": "الخطوة السابقة",
    "pairing.startPairing": "بدء الاقتران",
    "pairing.connected": "!تم الاتصال",
    "pairing.readyToUse": "تم اقتران القفاز الذكي وهو جاهز للاستخدام.",
    "pairing.startUsing": "ابدأ الاستخدام",
    "pairing.failed": "فشل الاتصال",
    "pairing.failedDesc": "لم نتمكن من الاتصال بقفازك الذكي. يرجى تجربة التالي:",
    "pairing.tip1": "تأكد من تشغيل القفاز",
    "pairing.tip2": "تحقق من تفعيل البلوتوث",
    "pairing.tip3": "قرّب القفاز من هاتفك",
    "pairing.tip4": "أعد تشغيل القفاز وحاول مرة أخرى",
    "pairing.tryAgain": "حاول مرة أخرى",
    "pairing.connecting": "...جاري الاتصال",
    "pairing.searching": "...جاري البحث عن الأجهزة",
    "pairing.deviceFound": "...تم العثور على الجهاز. جاري إنشاء الاتصال",
    "pairing.almostThere": "...على وشك الانتهاء",
    "pairing.listenGuide": "استمع للدليل",
    "pairing.stopGuide": "إيقاف الدليل",

    // Detection
    "detection.title": "بدء التعرف",
    "detection.liveDetection": "كشف مباشر",
    "detection.fromWardrobe": "من الخزانة",
    "detection.scanning": "...جاري المسح",
    "detection.touchFabric": "المس قطعة قماش واضغط للكشف",
    "detection.connectFirst": "يرجى توصيل القفاز الذكي أولاً",
    "detection.completed": "!اكتمل الكشف",
    "detection.detected": "تم اكتشافه",
    "detection.noItems": "لا توجد عناصر محفوظة. اكتشف العناصر أولاً لإضافتها إلى خزانتك.",
    "detection.fabric": "القماش:",
    "detection.color": "اللون:",
    "detection.pattern": "النمط:",
    "detection.texture": "الملمس:",
    "detection.listen": "استمع لمزيد من التفاصيل",
    "detection.save": "حفظ في الخزانة",
    "detection.remove": "إزالة من الخزانة",
    "detection.backToList": "العودة للقائمة",
    "detection.itemSaved": "!تم حفظ العنصر في الخزانة",
    "detection.added": "تمت الإضافة",
    "detection.itemIs": "العنصر هو",
    "detection.fabricWord": "قماش",
    "detection.textureWord": "ملمس",
    "detection.patternWord": "نمط",

    // Wardrobe
    "wardrobe.title": "خزانة الملابس",
    "wardrobe.search": "...البحث عن عناصر",
    "wardrobe.all": "الكل",
    "wardrobe.shirts": "تيشيرتات",
    "wardrobe.dresses": "فساتين",
    "wardrobe.accessories": "إكسسوارات",
    "wardrobe.shoes": "أحذية",
    "wardrobe.noItems": "لا توجد عناصر",

    // Settings
    "settings.title": "الإعدادات",
    "settings.language": "اللغة",
    "settings.voiceControl": "التحكم بالصوت",
    "settings.bluetooth": "إعدادات البلوتوث",
    "settings.help": "المساعدة",
    "settings.connectedStatus": "متصل بالقفاز الذكي",
    "settings.notConnectedStatus": "غير متصل بالقفاز الذكي",

    // Language Screen
    "language.title": "اللغة",
    "language.description": "اختر لغتك المفضلة لواجهة التطبيق والإخراج الصوتي.",

    // Voice Control
    "voice.title": "التحكم بالصوت",
    "voice.description": "خصّص طريقة قراءة التطبيق لنتائج الكشف.",
    "voice.autoRead": "قراءة النتائج تلقائياً",
    "voice.autoReadDesc": "نطق نتائج الكشف تلقائياً",
    "voice.speed": "سرعة النطق",
    "voice.slow": "بطيء",
    "voice.normal": "عادي",
    "voice.fast": "سريع",
    "voice.volume": "مستوى الصوت",
    "voice.testVoice": "اختبار الصوت",
    "voice.stop": "إيقاف",
    "voice.testText": "هذا اختبار للإخراج الصوتي. العنصر المكتشف هو قماش قطني أزرق بملمس ناعم.",

    // AI Features
    "ai.title": "ميزات الذكاء الاصطناعي",
    "ai.powered": "مدعوم بالذكاء الاصطناعي",
    "ai.stylist": "مصمم AI",
    "ai.stylistDesc": "احصل على توصيات أزياء مخصصة بناءً على خزانتك.",
    "ai.audioTips": "نصائح صوتية ذكية",
    "ai.audioTipsDesc": "نصائح صوتية للعناية بالأقمشة، تنسيق الألوان، واقتراحات الأسلوب.",
    "ai.comingSoon": "معاينة — قريباً",
    "ai.future": "مستقبلي",

    // AI Stylist
    "aiStylist.title": "مصمم AI",
    "aiStylist.styleMyLook": "!صمّم إطلالتي",
    "aiStylist.next": "التالي",
    "aiStylist.styledLookDesc": "إليك إطلالتك المصممة! سترة قطنية بيج مع جينز أزرق فاتح، صنادل بنية، نظارات شمسية، أقراط ذهبية، وحقيبة قش منسوجة. مثالية ليوم عادي.",
    "aiStylist.suggestedAccessory": "الإكسسوار المقترح:",
    "aiStylist.outfitSuggestions": "اقتراحات الإطلالات",
    "aiStylist.smartRecommendations": "توصيات ذكية",
    "aiStylist.audioTips": "نصائح صوتية",
    "aiStylist.recommendation1": "نسّق هذه السترة البيج مع جينز فاتح لإطلالة نهارية مريحة.",
    "aiStylist.recommendation2": "أضف إكسسوارات ذهبية لرفع مستوى الإطلالة في المناسبات المسائية.",
    "aiStylist.recommendation3": "ارتدِ جاكيت بلون محايد عند انخفاض درجة الحرارة.",

    // Audio Tips
    "audioTips.title": "نصائح صوتية ذكية",
    "audioTips.tip1": "هذا القماش مناسب للأقمشة القطنية",
    "audioTips.tip2": "اللون البيج يتناسق بشكل جميل",
    "audioTips.tip3": "جرّب ارتداء هذه الإطلالة للمناسبات الخاصة",
    "audioTips.trySimilar": "جرّب تنسيقاً مشابهاً",
    "audioTips.return": "رجوع",

    // Glove Discovery Modal
    "modal.title": "ربط Triview",
    "modal.description": "تم اكتشاف قفاز ذكي قريب. هل تريد اقترانه للاستفادة من ميزات الذكاء الاصطناعي والتحكم الحسي؟",
    "modal.connect": "اتصال",

    // Bottom Nav
    "nav.settings": "الإعدادات",
    "nav.wardrobe": "الخزانة",
    "nav.routine": "الرئيسية",

    // 404
    "notFound.title": "404",
    "notFound.message": "عذراً! الصفحة غير موجودة",
    "notFound.return": "العودة للرئيسية",
  },
};
