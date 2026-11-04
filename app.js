/**
 * IT & AI Academy — Telegram Mini App (Web App)
 * Versiya 2.0 Pro: Video Player, Quiz & Admin Panel
 */

// 1. Initialize Telegram WebApp SDK
const tg = window.Telegram?.WebApp;
if (tg) {
  try {
    tg.ready();
    tg.expand();
    tg.enableClosingConfirmation();
  } catch (e) {
    console.warn('Telegram SDK init:', e);
  }
}

// Haptic feedback helper
function haptic(type = 'light') {
  try {
    if (tg?.HapticFeedback) {
      if (['success', 'warning', 'error'].includes(type)) {
        tg.HapticFeedback.notificationOccurred(type);
      } else {
        tg.HapticFeedback.impactOccurred(type);
      }
    }
  } catch (e) {}
}

// Toast helper
function showToast(message) {
  const toast = document.getElementById('iosToast');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 2200);
}

// Apple Emoji helper — renders iPhone-style emoji via CDN
function appleEmoji(emoji, extraClass = '') {
  const encoded = encodeURIComponent(emoji);
  return `<img src="https://emojicdn.elk.sh/${encoded}?style=apple" class="apple-emoji ${extraClass}" alt="${emoji}" draggable="false">`;
}

// YouTube URL parser
function extractYouTubeId(url) {
  if (!url) return null;
  url = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : null;
}

// Direct video URL detector (mp4, webm, mov, ogg)
function isDirectVideoUrl(url) {
  if (!url) return false;
  url = url.trim().toLowerCase();
  return /\.(mp4|webm|mov|ogg|m4v)(\?.*)?$/i.test(url) ||
         url.includes('video/') ||
         url.includes('.mp4') ||
         url.includes('.webm');
}

// ==========================================
// 2. DATA STORAGE (COURSES & PROGRESS)
// ==========================================
const COURSES_STORAGE_KEY = 'academy_courses_v4';
const PROGRESS_STORAGE_KEY = 'academy_user_progress_v4';
const ADMIN_ID = '6649277063';
const ADMIN_SECRET_PIN = '7706'; // Brauzerdan kirganda ham qulay ochish uchun

const DEFAULT_COURSES = [
  {
    id: 'chatgpt-ai',
    category: 'ai',
    title: 'ChatGPT & Prompt Engineering',
    desc: 'Sun\'iy intellektga to\'g\'ri buyruqlar berish, prompts yozish va kundalik vazifalarni avtomatlashtirish.',
    icon: '🤖',
    iconBg: 'linear-gradient(135deg, #10b981, #059669)',
    badge: 'TOP',
    badgeType: 'badge-top',
    rating: '4.9',
    lessonsCount: 6,
    duration: '4.5 soat',
    level: 'Boshlang\'ich',
    lessons: [
      {
        id: 'ai-1',
        title: 'Sun\'iy intellekt (AI) nima va u qanday ishlaydi?',
        duration: '12 daqiqa',
        tag: '1-dars',
        desc: 'Ushbu darsda Sun\'iy intellektning fundamental tushunchalari, neyrotarmoqlar modellari va ChatGPT qanday ishlashi tushuntiriladi.',
        content: `
          <div class="lesson-article">
            <img src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=600&q=80" alt="AI Brain" class="lesson-article-img">
            <p>🤖 <strong>Sun'iy intellekt (Artificial Intelligence)</strong> — bu kompyuter tizimlarining inson kabi fikrlash, o'rganish va qaror qabul qilish qobiliyati.</p>
            
            <h4>📌 AI qanday ishlaydi?</h4>
            <p>AI modellar <em>katta hajmdagi ma'lumotlar</em> (Big Data) asosida naqshlarni (patterns) o'rganadi. Masalan, ChatGPT milliardlab matn asosida o'qitilgan.</p>
            
            <img src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80" alt="Neural Network" class="lesson-article-img">
            
            <h4>🧠 Neyrotarmoq (Neural Network)</h4>
            <p>Inson miyasidagi neyronlar kabi, sun'iy neyrotarmoqlar axborotni qayta ishlaydi. Har bir neyron kiruvchi signalni qabul qilib, natija chiqaradi.</p>
            
            <div class="lesson-highlight-box">
              <strong>💡 Eslab qoling:</strong> AI = Ma'lumot + Algoritmlar + Hisoblash quvvati
            </div>
            
            <h4>📊 AI turlari:</h4>
            <ul>
              <li><strong>Tor AI (Narrow AI)</strong> — faqat bitta vazifani bajaradi (masalan: Siri, ChatGPT)</li>
              <li><strong>Umumiy AI (AGI)</strong> — inson kabi fikrlaydi (hali yaratilmagan)</li>
              <li><strong>Super AI (ASI)</strong> — insondan ustun (nazariy)</li>
            </ul>
            
            <img src="https://images.unsplash.com/photo-1655720828018-edd71de48923?w=600&q=80" alt="ChatGPT" class="lesson-article-img">
          </div>
        `,
        quiz: {
          question: 'Sun\'iy intellekt (AI) modellarining asosiy ishlash printsipi nima?',
          options: [
            'Katta hajmdagi ma\'lumotlar (Big Data) asosida naqshlarni o\'rganish',
            'Faqat inson qo\'lda kiritgan 10-15 ta qoidaga bo\'ysunish',
            'Tasodifiy javoblarni generatsiya qilish',
            'Kompyuter xotirasini tozalab borish'
          ],
          correct: 0
        }
      },
      {
        id: 'ai-2',
        title: 'ChatGPT bilan tanishuv va hisob ochish',
        duration: '15 daqiqa',
        tag: '2-dars',
        desc: 'OpenAI platformasida ro\'yxatdan o\'tish, interfeys bilan tanishish va birinchi samarali muloqotni boshlash.',
        content: `
          <div class="lesson-article">
            <img src="https://images.unsplash.com/photo-1694891624404-75cec03c1d53?w=600&q=80" alt="ChatGPT Interface" class="lesson-article-img">
            <p>💬 <strong>ChatGPT</strong> — OpenAI kompaniyasi yaratgan suhbat asosidagi sun'iy intellekt. U savollaringizga javob beradi, matn yozadi, kod tuzadi va boshqa ko'p ishlarni bajaradi.</p>
            
            <h4>📱 Ro'yxatdan o'tish bosqichlari:</h4>
            <ol>
              <li>🌐 <strong>chat.openai.com</strong> saytiga kiring</li>
              <li>📧 "Sign Up" tugmasini bosing va email kiriting</li>
              <li>🔐 Parol yarating va tasdiqlang</li>
              <li>📞 Telefon raqamingizni kiriting (tasdiqlash uchun)</li>
              <li>✅ Tayyor! ChatGPT bilan suhbatlashishni boshlang</li>
            </ol>
            
            <img src="https://images.unsplash.com/photo-1684163761883-8a14a792ca83?w=600&q=80" alt="OpenAI Dashboard" class="lesson-article-img">
            
            <h4>🎯 Interfeys elementlari:</h4>
            <ul>
              <li><strong>Chat maydoni</strong> — savollaringizni yozing</li>
              <li><strong>Yangi chat</strong> — yangi mavzuda suhbat boshlang</li>
              <li><strong>Tarix</strong> — oldingi suhbatlarni ko'ring</li>
              <li><strong>Model tanlash</strong> — GPT-4o, GPT-4 va boshqalar</li>
            </ul>
            
            <div class="lesson-highlight-box">
              <strong>🆓 Bepul versiya:</strong> GPT-4o mini — kuniga cheksiz so'rov. GPT-4o — limitli, lekin juda kuchli!
            </div>
          </div>
        `,
        quiz: {
          question: 'ChatGPT-dan eng aniq va sifatli javob olish uchun nima qilish kerak?',
          options: [
            'Vazifani aniq kontekst va rollar bilan batafsil yoritib berish (Prompt)',
            'Faqat 1-2 ta so\'z yozish kifoya',
            'Savolni bir necha marta takrorlab so\'rash',
            'Faqat rasmlar yuborish'
          ],
          correct: 0
        }
      },
      {
        id: 'ai-3',
        title: 'Prompt Engineering asoslari: 5 ta oltin qoida',
        duration: '22 daqiqa',
        tag: '3-dars',
        desc: 'Kontekst, Rol berish, Cheklovlar va Aniq format ko\'rsatish bo\'yicha amaliy qo\'llanma.',
        content: `
          <div class="lesson-article">
            <img src="https://images.unsplash.com/photo-1686191128892-3b37add4dce2?w=600&q=80" alt="Prompt Engineering" class="lesson-article-img">
            <p>✍️ <strong>Prompt Engineering</strong> — bu AI modeliga eng to'g'ri va samarali buyruq tuzish san'ati. Yaxshi prompt = yaxshi natija!</p>
            
            <h4>🏆 5 ta oltin qoida:</h4>
            
            <div class="lesson-highlight-box">
              <strong>1️⃣ Rol bering:</strong><br>
              "Sen tajribali Python dasturchi sifatida javob ber..."
            </div>
            
            <div class="lesson-highlight-box">
              <strong>2️⃣ Kontekst yozing:</strong><br>
              "Men 15 yoshli o'quvchiman, menga oddiy tilda tushuntir..."
            </div>
            
            <div class="lesson-highlight-box">
              <strong>3️⃣ Aniq format ko'rsating:</strong><br>
              "Javobni 5 ta punktli ro'yxat shaklida ber..."
            </div>
            
            <div class="lesson-highlight-box">
              <strong>4️⃣ Cheklov qo'ying:</strong><br>
              "Javob 100 so'zdan oshmasin..."
            </div>
            
            <div class="lesson-highlight-box">
              <strong>5️⃣ Misol bering:</strong><br>
              "Mana shunga o'xshash format: [misol]..."
            </div>
            
            <img src="https://images.unsplash.com/photo-1699895205579-593890266153?w=600&q=80" alt="AI Writing" class="lesson-article-img">
            
            <h4>❌ Yomon prompt vs ✅ Yaxshi prompt:</h4>
            <ul>
              <li>❌ "Dasturlash haqida yoz" → juda umumiy</li>
              <li>✅ "Python tilida boshlang'ichlar uchun 5 ta muhim maslahat yoz, har birini misol bilan tushuntir" → aniq!</li>
            </ul>
          </div>
        `,
        quiz: {
          question: 'Prompt Engineering nima?',
          options: [
            'AI modeliga eng to\'g\'ri va samarali buyruq tuzish san\'ati',
            'Kompyuterga yangi qismlar o\'rnatish',
            'Internet tezligini oshirish dasturi',
            'Telegram bot yaratuvchi maxsus til'
          ],
          correct: 0
        }
      }
    ]
  },
  {
    id: 'cyber-security',
    category: 'security',
    title: 'Kiberxavfsizlik Asoslari',
    desc: 'Axborot xavfsizligi, kiberxujumlardan himoyalanish, shaxsiy ma\'lumotlar xavfsizligi.',
    icon: '🛡️',
    iconBg: 'linear-gradient(135deg, #ef4444, #b91c1c)',
    badge: 'YANGI',
    badgeType: 'badge-new',
    rating: '4.9',
    lessonsCount: 4,
    duration: '4 soat',
    level: 'Boshlang\'ich',
    lessons: [
      {
        id: 'sec-1',
        title: 'Kiberxavfsizlik nima va u nega muhim?',
        duration: '14 daqiqa',
        tag: '1-dars',
        videoUrl: 'https://www.youtube.com/watch?v=inWWhr5tnEA',
        desc: 'Zamonaviy raqamli olamda xavflar, xakerlik turlari va shaxsiy gigiyena qoidalari.',
        quiz: {
          question: 'Shaxsiy hisoblarni buzib kirishdan himoyalashning eng kuchli usuli nima?',
          options: [
            'Ikki bosqichli autentifikatsiya (2FA) va murakkab parollar',
            'Hamma joyga bitta oson parol qo\'yish',
            'Parollarni Telegram guruhlarga yozish',
            'Antivirusni o\'chirib qo\'yish'
          ],
          correct: 0
        }
      }
    ]
  },
  {
    id: 'ai-design',
    category: 'design',
    title: 'Midjourney & AI Dizayn',
    desc: 'Neyrotarmoqlar yordamida fotorealistik suratlar, logotiplar va 3D dizaynlar generatsiya qilish.',
    icon: '🎨',
    iconBg: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    badge: 'TOP',
    badgeType: 'badge-top',
    rating: '4.9',
    lessonsCount: 4,
    duration: '3.5 soat',
    level: 'Boshlang\'ich',
    lessons: [
      {
        id: 'des-1',
        title: 'Midjourney bilan tanishuv va Discord sozlash',
        duration: '15 daqiqa',
        tag: '1-dars',
        videoUrl: 'https://www.youtube.com/watch?v=2f357zR2C1s',
        desc: 'Discord serverida Midjourney bot bilan ishlash, /imagine buyrug\'i va birinchi promptlar.',
        quiz: {
          question: 'Midjourney botida yangi rasm generatsiya qilish uchun qaysi buyruq yoziladi?',
          options: [
            '/imagine prompt:',
            '/generate image:',
            '/draw:',
            '/create art:'
          ],
          correct: 0
        }
      }
    ]
  }
];

// Courses loader / saver
function getCourses() {
  try {
    const data = localStorage.getItem(COURSES_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(DEFAULT_COURSES));
      return DEFAULT_COURSES;
    }
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_COURSES;
  }
}

function saveCourses(courses) {
  localStorage.setItem(COURSES_STORAGE_KEY, JSON.stringify(courses));
  updateStatsCounters();
}

// User Progress loader / saver
function getUserProgress() {
  try {
    const data = localStorage.getItem(PROGRESS_STORAGE_KEY);
    if (!data) {
      const init = { doneLessons: [], passedQuizzes: [], bookmarks: [], totalXp: 0 };
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(init));
      return init;
    }
    return JSON.parse(data);
  } catch (e) {
    return { doneLessons: [], passedQuizzes: [], bookmarks: [], totalXp: 0 };
  }
}

function saveUserProgress(progress) {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
  updateProfileStats();
}

// ==========================================
// 3. APP STATE & DOM REFERENCES
// ==========================================
let currentCategory = 'all';
let searchQuery = '';
let selectedCourse = null;
let selectedLesson = null;
let currentTab = 'home';

// Header elements
const headerMainCapsule = document.getElementById('headerMainCapsule');
const headerDetailCapsule = document.getElementById('headerDetailCapsule');
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const backBtn = document.getElementById('backBtn');
const detailCapsuleIcon = document.getElementById('detailCapsuleIcon');
const detailCapsuleTitle = document.getElementById('detailCapsuleTitle');

// Views
const homeView = document.getElementById('homeView');
const detailView = document.getElementById('detailView');
const profileView = document.getElementById('profileView');
const favoritesView = document.getElementById('favoritesView');
const adminView = document.getElementById('adminView');
const scrollContainer = document.getElementById('scrollContainer');

// Detail View elements
const detailCategoryBadge = document.getElementById('detailCategoryBadge');
const detailTitle = document.getElementById('detailTitle');
const detailDesc = document.getElementById('detailDesc');
const detailLessonCount = document.getElementById('detailLessonCount');
const detailDuration = document.getElementById('detailDuration');
const detailRating = document.getElementById('detailRating');
const detailLevel = document.getElementById('detailLevel');
const lessonsList = document.getElementById('lessonsList');
const coursesGrid = document.getElementById('coursesGrid');
const categoriesScroll = document.getElementById('categoriesScroll');
const courseCount = document.getElementById('courseCount');

// Lesson Modal elements
const lessonModal = document.getElementById('lessonModal');
const modalLessonTag = document.getElementById('modalLessonTag');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalLessonTitle = document.getElementById('modalLessonTitle');
const modalLessonText = document.getElementById('modalLessonText');
const modalLessonDuration = document.getElementById('modalLessonDuration');
const modalQuizAvailableBadge = document.getElementById('modalQuizAvailableBadge');
const videoContainer = document.getElementById('videoContainer');
const modalBookmarkBtn = document.getElementById('modalBookmarkBtn');
const btnStartQuiz = document.getElementById('btnStartQuiz');
const modalCompleteBtn = document.getElementById('modalCompleteBtn');

// Quiz Modal elements
const quizModal = document.getElementById('quizModal');
const quizPlayingView = document.getElementById('quizPlayingView');
const quizResultView = document.getElementById('quizResultView');
const quizCurrentStep = document.getElementById('quizCurrentStep');
const quizTotalSteps = document.getElementById('quizTotalSteps');
const quizProgressFill = document.getElementById('quizProgressFill');
const quizQuestionText = document.getElementById('quizQuestionText');
const quizOptionsList = document.getElementById('quizOptionsList');
const quizFeedbackBanner = document.getElementById('quizFeedbackBanner');
const quizFeedbackIcon = document.getElementById('quizFeedbackIcon');
const quizFeedbackMsg = document.getElementById('quizFeedbackMsg');
const quizNextBtn = document.getElementById('quizNextBtn');
const quizCloseBtn = document.getElementById('quizCloseBtn');
const quizFinalScore = document.getElementById('quizFinalScore');
const quizEarnedXp = document.getElementById('quizEarnedXp');
const quizFinishBtn = document.getElementById('quizFinishBtn');

// Admin Elements
const openAdminBtn = document.getElementById('openAdminBtn');
const adminBackBtn = document.getElementById('adminBackBtn');
const btnAddNewLesson = document.getElementById('btnAddNewLesson');
const btnExportData = document.getElementById('btnExportData');
const btnImportData = document.getElementById('btnImportData');
const btnResetData = document.getElementById('btnResetData');
const jsonFileInput = document.getElementById('jsonFileInput');
const adminCourseSelect = document.getElementById('adminCourseSelect');
const adminLessonCountBadge = document.getElementById('adminLessonCountBadge');
const adminLessonsList = document.getElementById('adminLessonsList');

// Admin Lesson Modal & Form
const adminLessonModal = document.getElementById('adminLessonModal');
const adminModalCloseBtn = document.getElementById('adminModalCloseBtn');
const adminLessonForm = document.getElementById('adminLessonForm');
const adminModalModeTag = document.getElementById('adminModalModeTag');
const adminModalTitle = document.getElementById('adminModalTitle');
const formLessonId = document.getElementById('formLessonId');
const formCourseSelect = document.getElementById('formCourseSelect');
const formLessonTitle = document.getElementById('formLessonTitle');
const formLessonTag = document.getElementById('formLessonTag');
const formLessonDuration = document.getElementById('formLessonDuration');
const formLessonVideo = document.getElementById('formLessonVideo');
const formLessonDesc = document.getElementById('formLessonDesc');
const formQuizQ = document.getElementById('formQuizQ');
const formQuizOpt0 = document.getElementById('formQuizOpt0');
const formQuizOpt1 = document.getElementById('formQuizOpt1');
const formQuizOpt2 = document.getElementById('formQuizOpt2');
const formQuizOpt3 = document.getElementById('formQuizOpt3');
const formQuizCorrect = document.getElementById('formQuizCorrect');

// ==========================================
// 4. RENDERING COURSES & NAVIGATION
// ==========================================
function updateStatsCounters() {
  const courses = getCourses();
  const totalCourses = courses.length;
  let totalLessons = 0;
  courses.forEach(c => {
    totalLessons += (c.lessons ? c.lessons.length : 0);
  });

  const statC = document.getElementById('statCoursesCount');
  const statL = document.getElementById('statLessonsCount');
  if (statC) statC.textContent = `${totalCourses}+`;
  if (statL) statL.textContent = `${totalLessons}+`;
}

function renderCourses() {
  const courses = getCourses();
  const filtered = courses.filter(course => {
    const matchesCat = currentCategory === 'all' || course.category === currentCategory;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  if (courseCount) {
    courseCount.textContent = `${filtered.length} ta yo'nalish`;
  }
  coursesGrid.innerHTML = '';

  if (filtered.length === 0) {
    coursesGrid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px 10px; color: #98989f;">
        <span style="font-size: 36px; display: block; margin-bottom: 8px;">🔍</span>
        Hech qanday darslik topilmadi.
      </div>
    `;
    return;
  }

  filtered.forEach(course => {
    const card = document.createElement('div');
    card.className = 'course-card';
    card.setAttribute('data-id', course.id);

    const lessonsCount = course.lessons ? course.lessons.length : (course.lessonsCount || 0);

    card.innerHTML = `
      <span class="card-badge-top ${course.badgeType || 'badge-top'}">${course.badge || 'TOP'}</span>
      <div class="card-icon-banner" style="background: ${course.iconBg}">
        ${appleEmoji(course.icon, 'emoji-card-icon')}
      </div>
      <h4 class="course-card-title">${course.title}</h4>
      <p class="course-card-desc">${course.desc}</p>
      <div class="course-card-footer">
        <span class="footer-free">${appleEmoji('⚡')} Bepul</span>
        <span class="footer-lessons">${appleEmoji('📚')} ${lessonsCount} dars</span>
      </div>
    `;

    card.addEventListener('click', () => openCourseDetail(course));
    coursesGrid.appendChild(card);
  });
}

function openCourseDetail(course) {
  haptic('medium');
  selectedCourse = course;

  // Header State
  headerMainCapsule.style.display = 'none';
  headerDetailCapsule.style.display = 'flex';
  detailCapsuleIcon.innerHTML = appleEmoji(course.icon);
  detailCapsuleTitle.textContent = course.title;

  // Detail Info
  detailCategoryBadge.textContent = course.category.toUpperCase();
  detailTitle.textContent = course.title;
  detailDesc.textContent = course.desc;
  const lessonsCount = course.lessons ? course.lessons.length : 0;
  detailLessonCount.textContent = `${lessonsCount} ta dars`;
  detailDuration.textContent = course.duration || '3+ soat';
  detailRating.innerHTML = `${course.rating || '4.9'} ${appleEmoji('⭐')}`;
  detailLevel.textContent = course.level || 'Boshlang\'ich';

  // Render Lessons
  renderLessonsList(course);

  // Switch View
  hideAllViews();
  detailView.style.display = 'block';
  scrollContainer.scrollTop = 0;
}

function renderLessonsList(course) {
  lessonsList.innerHTML = '';
  const progress = getUserProgress();

  if (!course.lessons || course.lessons.length === 0) {
    lessonsList.innerHTML = `
      <div style="text-align: center; padding: 25px; color: #98989f;">
        <span>✦ Hozircha darslar qo'shilmagan</span>
      </div>
    `;
    return;
  }

  course.lessons.forEach(l => {
    const row = document.createElement('div');
    row.className = 'lesson-row';
    const isDone = progress.doneLessons.includes(l.id);

    row.innerHTML = `
      <div class="lesson-play-circle" style="${isDone ? 'background: #30d158; color: #000;' : ''}">
        ${isDone ? appleEmoji('✅', 'emoji-lesson-icon') : appleEmoji('▶️', 'emoji-lesson-icon')}
      </div>
      <div class="lesson-row-info">
        <div class="lesson-row-title">${l.title}</div>
        <div class="lesson-row-meta">${l.tag} • ${l.duration} ${l.videoUrl ? '• ' + appleEmoji('🎥') + ' Video' : (l.content ? '• ' + appleEmoji('📖') + ' Matn' : '')}</div>
      </div>
      <span class="lesson-open-tag">${isDone ? 'O\'tildi' : 'Ko\'rish'}</span>
    `;

    row.addEventListener('click', () => openLessonModal(l, course));
    lessonsList.appendChild(row);
  });
}

function hideAllViews() {
  homeView.style.display = 'none';
  detailView.style.display = 'none';
  profileView.style.display = 'none';
  favoritesView.style.display = 'none';
  adminView.style.display = 'none';
}

function backToHome() {
  haptic('light');
  headerDetailCapsule.style.display = 'none';
  headerMainCapsule.style.display = 'block';
  hideAllViews();
  homeView.style.display = 'block';
  renderCourses();
}

backBtn.addEventListener('click', backToHome);

// ==========================================
// 5. VIDEO PLAYER & LESSON MODAL (STEP 1)
// ==========================================
function openLessonModal(lesson, course) {
  haptic('medium');
  selectedLesson = lesson;
  selectedCourse = course;

  modalLessonTag.textContent = `${course.title} • ${lesson.tag}`;
  modalLessonTitle.textContent = lesson.title;
  modalLessonDuration.textContent = `⏱️ ${lesson.duration}`;

  // Rich content (matn + rasmlar) yoki oddiy tavsif
  if (lesson.content) {
    modalLessonText.innerHTML = lesson.content;
  } else {
    modalLessonText.textContent = lesson.desc || `Ushbu "${lesson.title}" darsligi orqali yangi amaliy bilimlarni o'rganing. Barcha materiallar bepul!`;
  }

  // Video Player embed — faqat videoUrl bo'lsa ko'rsatiladi
  const ytId = extractYouTubeId(lesson.videoUrl);
  const isDirect = isDirectVideoUrl(lesson.videoUrl);

  if (ytId) {
    videoContainer.style.display = 'block';
    videoContainer.innerHTML = `
      <iframe 
        src="https://www.youtube-nocookie.com/embed/${ytId}?rel=0&modestbranding=1&playsinline=1" 
        title="${lesson.title}" 
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
        allowfullscreen>
      </iframe>
    `;
  } else if (isDirect || (lesson.videoUrl && lesson.videoUrl.trim().startsWith('http'))) {
    videoContainer.style.display = 'block';
    const videoUrl = lesson.videoUrl.trim();
    videoContainer.innerHTML = `
      <video 
        controls 
        playsinline 
        preload="metadata" 
        class="direct-video-player"
        poster=""
      >
        <source src="${videoUrl}" type="${videoUrl.includes('.webm') ? 'video/webm' : 'video/mp4'}">
        Brauzeringiz videoni qo'llab-quvvatlamaydi.
      </video>
    `;
  } else if (lesson.content) {
    // Matnli dars — videoni yashirish
    videoContainer.style.display = 'none';
    videoContainer.innerHTML = '';
  } else {
    videoContainer.style.display = 'block';
    videoContainer.innerHTML = `
      <div class="video-placeholder">
        <div class="video-play-icon">▶</div>
        <span class="video-text">Video darslik pleeri</span>
        <span class="video-subtext">${lesson.title}</span>
      </div>
    `;
  }

  // Quiz available badge
  if (lesson.quiz && lesson.quiz.question) {
    modalQuizAvailableBadge.style.display = 'inline-block';
    btnStartQuiz.style.display = 'flex';
  } else {
    modalQuizAvailableBadge.style.display = 'none';
    btnStartQuiz.style.display = 'none';
  }

  // Bookmark active state
  const progress = getUserProgress();
  const isBookmarked = progress.bookmarks.includes(lesson.id);
  modalBookmarkBtn.classList.toggle('active', isBookmarked);

  lessonModal.style.display = 'flex';
}

function closeLessonModal() {
  haptic('light');
  // Stop video playback (both YouTube iframe and direct video)
  const vid = videoContainer.querySelector('video');
  if (vid) vid.pause();
  videoContainer.innerHTML = '';
  lessonModal.style.display = 'none';
}

modalCloseBtn.addEventListener('click', closeLessonModal);

modalCompleteBtn.addEventListener('click', () => {
  haptic('success');
  if (selectedLesson) {
    const progress = getUserProgress();
    if (!progress.doneLessons.includes(selectedLesson.id)) {
      progress.doneLessons.push(selectedLesson.id);
      progress.totalXp += 15;
      saveUserProgress(progress);
      showToast("+15 XP! Dars ko'rildi ✓");
    }
  }
  closeLessonModal();
  if (selectedCourse) renderLessonsList(selectedCourse);
});

// Bookmark Toggle
modalBookmarkBtn.addEventListener('click', () => {
  if (!selectedLesson) return;
  haptic('light');
  const progress = getUserProgress();
  const idx = progress.bookmarks.indexOf(selectedLesson.id);
  if (idx === -1) {
    progress.bookmarks.push(selectedLesson.id);
    modalBookmarkBtn.classList.add('active');
    showToast("Saqlanganlarga qo'shildi ⭐");
  } else {
    progress.bookmarks.splice(idx, 1);
    modalBookmarkBtn.classList.remove('active');
    showToast("Saqlanganlardan o'chirildi");
  }
  saveUserProgress(progress);
});

// ==========================================
// 6. QUIZ / VIKTORINA SYSTEM (STEP 3)
// ==========================================
let currentQuiz = null;

btnStartQuiz.addEventListener('click', () => {
  if (!selectedLesson || !selectedLesson.quiz) {
    showToast("Ushbu dars uchun test kiritilmagan");
    return;
  }
  haptic('medium');
  closeLessonModal();
  startQuiz(selectedLesson.quiz, selectedLesson);
});

function startQuiz(quizData, lesson) {
  currentQuiz = {
    data: quizData,
    lesson: lesson,
    answered: false
  };

  quizPlayingView.style.display = 'block';
  quizResultView.style.display = 'none';
  quizFeedbackBanner.style.display = 'none';
  quizNextBtn.style.display = 'none';

  quizCurrentStep.textContent = '1';
  quizTotalSteps.textContent = '1';
  quizProgressFill.style.width = '100%';
  quizQuestionText.textContent = quizData.question;

  quizOptionsList.innerHTML = '';
  quizData.options.forEach((optText, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'quiz-opt-btn';
    btn.textContent = `${String.fromCharCode(65 + index)}) ${optText}`;
    btn.addEventListener('click', () => handleQuizOptionClick(index, btn));
    quizOptionsList.appendChild(btn);
  });

  quizModal.style.display = 'flex';
}

function handleQuizOptionClick(selectedIndex, btnElement) {
  if (currentQuiz.answered) return;
  currentQuiz.answered = true;

  const correctIndex = parseInt(currentQuiz.data.correct, 10);
  const isCorrect = (selectedIndex === correctIndex);

  // Disable all options
  const allBtns = quizOptionsList.querySelectorAll('.quiz-opt-btn');
  allBtns.forEach(b => b.classList.add('disabled'));

  if (isCorrect) {
    haptic('success');
    btnElement.classList.add('correct');
    quizFeedbackIcon.innerHTML = appleEmoji('🎉', 'emoji-quiz-feedback');
    quizFeedbackMsg.textContent = 'Ajoyib! To\'g\'ri javob!';
    quizFeedbackBanner.style.background = 'rgba(48, 209, 88, 0.15)';
    quizFeedbackBanner.style.color = '#30d158';
  } else {
    haptic('error');
    btnElement.classList.add('wrong');
    // Highlight correct one
    if (allBtns[correctIndex]) {
      allBtns[correctIndex].classList.add('correct');
    }
    quizFeedbackIcon.innerHTML = appleEmoji('💡', 'emoji-quiz-feedback');
    quizFeedbackMsg.textContent = 'Noto\'g\'ri. To\'g\'ri javob belgilandi.';
    quizFeedbackBanner.style.background = 'rgba(255, 69, 58, 0.15)';
    quizFeedbackBanner.style.color = '#ff453a';
  }

  quizFeedbackBanner.style.display = 'flex';
  quizNextBtn.style.display = 'block';
  quizNextBtn.textContent = 'Natijani ko\'rish →';
}

quizNextBtn.addEventListener('click', () => {
  haptic('medium');
  quizPlayingView.style.display = 'none';
  quizResultView.style.display = 'block';

  const progress = getUserProgress();
  const lessonId = currentQuiz.lesson.id;

  if (!progress.passedQuizzes.includes(lessonId)) {
    progress.passedQuizzes.push(lessonId);
    progress.totalXp += 30;
    saveUserProgress(progress);
  }

  quizFinalScore.textContent = '1 / 1';
  quizEarnedXp.textContent = '+30 XP';
});

quizFinishBtn.addEventListener('click', () => {
  haptic('light');
  quizModal.style.display = 'none';
  if (selectedCourse) {
    renderLessonsList(selectedCourse);
  }
});

quizCloseBtn.addEventListener('click', () => {
  haptic('light');
  quizModal.style.display = 'none';
});

// ==========================================
// 7. ADMIN MANAGEMENT PANEL (STEP 2)
// ==========================================
function checkAdminAccess() {
  const tgUser = tg?.initDataUnsafe?.user;
  const isTgAdmin = tgUser && String(tgUser.id) === ADMIN_ID;
  const urlParams = new URLSearchParams(window.location.search);
  const isDevAdmin = urlParams.get('admin') === '1' || sessionStorage.getItem('is_admin_mode') === 'true';

  if (isTgAdmin || isDevAdmin) {
    openAdminPanel();
    return;
  }

  // Fallback for direct click if unverified
  const enteredPin = prompt("Admin boshqaruv paneliga kirish uchun PIN kodni kiriting:\n(Faqat loyiha egasi uchun)");
  if (enteredPin === ADMIN_SECRET_PIN) {
    sessionStorage.setItem('is_admin_mode', 'true');
    const adminWrapper = document.getElementById('adminAccessWrapper');
    if (adminWrapper) adminWrapper.style.display = 'block';
    openAdminPanel();
  } else if (enteredPin !== null) {
    haptic('error');
    alert("Noto'g'ri PIN kod! Kirish taqiqlandi.");
  }
}

// Secret avatar tap to unlock admin in normal browser
let avatarTapCount = 0;
let avatarTapTimer = null;
const largeAvatarEl = document.getElementById('profileLargeAvatar');
if (largeAvatarEl) {
  largeAvatarEl.addEventListener('click', () => {
    avatarTapCount++;
    clearTimeout(avatarTapTimer);
    avatarTapTimer = setTimeout(() => { avatarTapCount = 0; }, 1500);
    if (avatarTapCount >= 5) {
      avatarTapCount = 0;
      const pin = prompt("Maxfiy administrator PIN kodini kiriting:");
      if (pin === ADMIN_SECRET_PIN) {
        sessionStorage.setItem('is_admin_mode', 'true');
        const adminWrapper = document.getElementById('adminAccessWrapper');
        if (adminWrapper) adminWrapper.style.display = 'block';
        showToast("Admin huquqi faollashtirildi ⚡");
      }
    }
  });
}

openAdminBtn.addEventListener('click', checkAdminAccess);

function openAdminPanel() {
  haptic('medium');
  hideAllViews();
  headerMainCapsule.style.display = 'none';
  headerDetailCapsule.style.display = 'none';
  adminView.style.display = 'block';
  scrollContainer.scrollTop = 0;

  populateAdminCourseSelect();
  renderAdminLessonsList();
}

adminBackBtn.addEventListener('click', () => {
  haptic('light');
  hideAllViews();
  headerMainCapsule.style.display = 'block';
  homeView.style.display = 'block';
  renderCourses();
});

function populateAdminCourseSelect() {
  const courses = getCourses();
  adminCourseSelect.innerHTML = '';
  formCourseSelect.innerHTML = '';

  courses.forEach(c => {
    const opt1 = document.createElement('option');
    opt1.value = c.id;
    opt1.textContent = `${c.icon} ${c.title}`;
    adminCourseSelect.appendChild(opt1);

    const opt2 = document.createElement('option');
    opt2.value = c.id;
    opt2.textContent = `${c.icon} ${c.title}`;
    formCourseSelect.appendChild(opt2);
  });
}

adminCourseSelect.addEventListener('change', renderAdminLessonsList);

function renderAdminLessonsList() {
  const courses = getCourses();
  const courseId = adminCourseSelect.value;
  const course = courses.find(c => c.id === courseId);
  adminLessonsList.innerHTML = '';

  if (!course || !course.lessons || course.lessons.length === 0) {
    adminLessonCountBadge.textContent = '0 ta dars';
    adminLessonsList.innerHTML = `
      <div style="text-align: center; padding: 20px; color: #98989f;">
        Ushbu kursda hozircha dars yo'q. "+ Yangi dars qo'shish" tugmasini bosing.
      </div>
    `;
    return;
  }

  adminLessonCountBadge.textContent = `${course.lessons.length} ta dars`;

  course.lessons.forEach((l, index) => {
    const item = document.createElement('div');
    item.className = 'admin-lesson-item';
    item.innerHTML = `
      <div class="admin-item-info">
        <div class="admin-item-title">${l.tag}: ${l.title}</div>
        <div class="admin-item-meta">⏱️ ${l.duration} ${l.videoUrl ? (extractYouTubeId(l.videoUrl) ? '• 🎥 YouTube' : '• 📹 Video fayl') : '• ⚠️ Video yo\'q'} ${l.quiz ? '• 📝 Test' : ''}</div>
      </div>
      <div class="admin-item-actions">
        <button type="button" class="btn-action-edit" data-id="${l.id}">✎</button>
        <button type="button" class="btn-action-delete" data-id="${l.id}">🗑</button>
      </div>
    `;

    item.querySelector('.btn-action-edit').addEventListener('click', () => openEditLessonModal(courseId, l));
    item.querySelector('.btn-action-delete').addEventListener('click', () => deleteLesson(courseId, l.id));
    adminLessonsList.appendChild(item);
  });
}

// Add New Lesson Trigger
btnAddNewLesson.addEventListener('click', () => {
  haptic('light');
  adminLessonForm.reset();
  formLessonId.value = '';
  formCourseSelect.value = adminCourseSelect.value;
  adminModalModeTag.textContent = 'Yangi Dars';
  adminModalTitle.textContent = 'Darslik Qo\'shish';
  formLessonTag.value = `${(adminLessonsList.children.length || 0) + 1}-dars`;
  adminLessonModal.style.display = 'flex';
});

// Edit Lesson Trigger
function openEditLessonModal(courseId, lesson) {
  haptic('light');
  adminLessonForm.reset();
  formLessonId.value = lesson.id;
  formCourseSelect.value = courseId;
  adminModalModeTag.textContent = 'Tahrirlash';
  adminModalTitle.textContent = 'Darslikni Tahrirlash';

  formLessonTitle.value = lesson.title;
  formLessonTag.value = lesson.tag || '1-dars';
  formLessonDuration.value = lesson.duration || '15 daqiqa';
  formLessonVideo.value = lesson.videoUrl || '';
  formLessonDesc.value = lesson.desc || '';

  if (lesson.quiz) {
    formQuizQ.value = lesson.quiz.question || '';
    formQuizOpt0.value = lesson.quiz.options?.[0] || '';
    formQuizOpt1.value = lesson.quiz.options?.[1] || '';
    formQuizOpt2.value = lesson.quiz.options?.[2] || '';
    formQuizOpt3.value = lesson.quiz.options?.[3] || '';
    formQuizCorrect.value = String(lesson.quiz.correct ?? 0);
  }

  adminLessonModal.style.display = 'flex';
}

adminModalCloseBtn.addEventListener('click', () => {
  haptic('light');
  adminLessonModal.style.display = 'none';
});

// Save (Add or Edit) Lesson Submit Handler
adminLessonForm.addEventListener('submit', (e) => {
  e.preventDefault();
  haptic('success');

  const courseId = formCourseSelect.value;
  const lessonId = formLessonId.value || `lesson-${Date.now()}`;
  const courses = getCourses();
  const course = courses.find(c => c.id === courseId);

  if (!course) {
    alert("Tanlangan kurs topilmadi!");
    return;
  }

  if (!course.lessons) course.lessons = [];

  // Quiz structure if provided
  let quizData = null;
  const qText = formQuizQ.value.trim();
  if (qText) {
    quizData = {
      question: qText,
      options: [
        formQuizOpt0.value.trim() || 'Variant A',
        formQuizOpt1.value.trim() || 'Variant B',
        formQuizOpt2.value.trim() || 'Variant C',
        formQuizOpt3.value.trim() || 'Variant D'
      ],
      correct: parseInt(formQuizCorrect.value, 10) || 0
    };
  }

  const newLesson = {
    id: lessonId,
    title: formLessonTitle.value.trim(),
    tag: formLessonTag.value.trim(),
    duration: formLessonDuration.value.trim(),
    videoUrl: formLessonVideo.value.trim(),
    desc: formLessonDesc.value.trim(),
    quiz: quizData
  };

  const existingIdx = course.lessons.findIndex(l => l.id === lessonId);
  if (existingIdx !== -1) {
    course.lessons[existingIdx] = newLesson;
    showToast("Darslik yangilandi ✓");
  } else {
    course.lessons.push(newLesson);
    showToast("Yangi dars muvaffaqiyatli qo'shildi ✓");
  }

  course.lessonsCount = course.lessons.length;
  saveCourses(courses);

  adminLessonModal.style.display = 'none';
  renderAdminLessonsList();
});

// Delete Lesson
function deleteLesson(courseId, lessonId) {
  if (!confirm("Haqiqatan ham ushbu darslikni o'chirmoqchimisiz?")) return;
  haptic('warning');

  const courses = getCourses();
  const course = courses.find(c => c.id === courseId);
  if (course && course.lessons) {
    course.lessons = course.lessons.filter(l => l.id !== lessonId);
    course.lessonsCount = course.lessons.length;
    saveCourses(courses);
    renderAdminLessonsList();
    showToast("Darslik o'chirildi 🗑");
  }
}

// JSON Export
btnExportData.addEventListener('click', () => {
  haptic('medium');
  const data = JSON.stringify(getCourses(), null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `academy_courses_backup_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Baza JSON faylga saqlandi 💾");
});

// JSON Import
btnImportData.addEventListener('click', () => jsonFileInput.click());

jsonFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const imported = JSON.parse(event.target.result);
      if (Array.isArray(imported)) {
        saveCourses(imported);
        populateAdminCourseSelect();
        renderAdminLessonsList();
        showToast("Baza muvaffaqiyatli yuklandi ✓");
      } else {
        alert("JSON fayl formati mos kelmadi!");
      }
    } catch (err) {
      alert("Faylni o'qishda xatolik yuz berdi!");
    }
  };
  reader.readAsText(file);
});

// Reset to Defaults
btnResetData.addEventListener('click', () => {
  if (!confirm("Barcha ma'lumotlarni dastlabki holatga qaytarmoqchimisiz?")) return;
  haptic('error');
  localStorage.removeItem(COURSES_STORAGE_KEY);
  populateAdminCourseSelect();
  renderAdminLessonsList();
  showToast("Baza dastlabki holatga qaytarildi 🔄");
});

// ==========================================
// 8. PROFILE & FAVORITES VIEW HANDLERS
// ==========================================
function updateProfileStats() {
  const tgUser = tg?.initDataUnsafe?.user;
  const progress = getUserProgress();

  const nameEl = document.getElementById('userName');
  const avatarEl = document.getElementById('userAvatar');
  const pName = document.getElementById('profileLargeName');
  const pAvatar = document.getElementById('profileLargeAvatar');
  const pId = document.getElementById('profileTelegramId');
  const pRole = document.getElementById('profileBadgeRole');

  if (tgUser) {
    const fullName = [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' ') || 'Foydalanuvchi';
    const firstLetter = (tgUser.first_name || 'U').charAt(0).toUpperCase();

    if (nameEl) nameEl.textContent = fullName;
    if (avatarEl) avatarEl.textContent = firstLetter;
    if (pName) pName.textContent = fullName;
    if (pAvatar) pAvatar.textContent = firstLetter;
    if (pId) pId.textContent = `Telegram ID: ${tgUser.id}`;

    if (String(tgUser.id) === ADMIN_ID) {
      if (pRole) {
        pRole.textContent = 'Bosh Administrator';
        pRole.style.background = 'rgba(255, 214, 10, 0.2)';
        pRole.style.color = '#ffd60a';
      }
    }
  }

  // Admin tugmasi faqat sizga (Telegram ID: 6649277063) ko'rinsin!
  const isTgAdmin = tgUser && String(tgUser.id) === ADMIN_ID;
  const isDevAdmin = new URLSearchParams(window.location.search).get('admin') === '1' || sessionStorage.getItem('is_admin_mode') === 'true';
  const adminWrapper = document.getElementById('adminAccessWrapper');
  if (adminWrapper) {
    adminWrapper.style.display = (isTgAdmin || isDevAdmin) ? 'block' : 'none';
  }

  // Stats Counters
  document.getElementById('userTotalXp').textContent = `${progress.totalXp || 0} XP`;
  document.getElementById('userDoneLessonsCount').textContent = progress.doneLessons ? progress.doneLessons.length : 0;
  document.getElementById('userPassedQuizCount').textContent = progress.passedQuizzes ? progress.passedQuizzes.length : 0;
  document.getElementById('userBookmarksCount').textContent = progress.bookmarks ? progress.bookmarks.length : 0;
}

function renderFavoritesList() {
  const progress = getUserProgress();
  const courses = getCourses();
  const countEl = document.getElementById('favoritesCount');
  const listEl = document.getElementById('favoritesList');
  listEl.innerHTML = '';

  const bookmarkedLessons = [];
  courses.forEach(c => {
    if (c.lessons) {
      c.lessons.forEach(l => {
        if (progress.bookmarks.includes(l.id)) {
          bookmarkedLessons.push({ lesson: l, course: c });
        }
      });
    }
  });

  countEl.textContent = `${bookmarkedLessons.length} ta`;

  if (bookmarkedLessons.length === 0) {
    listEl.innerHTML = `
      <div style="text-align: center; padding: 40px 10px; color: #98989f;">
        <span style="font-size: 32px; display: block; margin-bottom: 8px;">${appleEmoji('⭐', 'emoji-fav-empty')}</span>
        Hozircha saqlangan darslar yo'q.<br>
        <small>Dars ochilganda yuqoridagi yulduzchani bosing.</small>
      </div>
    `;
    return;
  }

  bookmarkedLessons.forEach(({ lesson, course }) => {
    const row = document.createElement('div');
    row.className = 'lesson-row';
    row.innerHTML = `
      <div class="lesson-play-circle">${appleEmoji('⭐', 'emoji-lesson-icon')}</div>
      <div class="lesson-row-info">
        <div class="lesson-row-title">${lesson.title}</div>
        <div class="lesson-row-meta">${course.title} • ${lesson.duration}</div>
      </div>
      <span class="lesson-open-tag">Ko'rish</span>
    `;
    row.addEventListener('click', () => openLessonModal(lesson, course));
    listEl.appendChild(row);
  });
}

// Dock / Tab Bar Navigation
document.querySelectorAll('.dock-item').forEach(item => {
  item.addEventListener('click', () => {
    haptic('light');
    document.querySelectorAll('.dock-item').forEach(d => d.classList.remove('active'));
    item.classList.add('active');

    const tab = item.getAttribute('data-tab');
    currentTab = tab;

    hideAllViews();

    if (tab === 'home') {
      headerMainCapsule.style.display = 'block';
      headerDetailCapsule.style.display = 'none';
      homeView.style.display = 'block';
      renderCourses();
    } else if (tab === 'courses') {
      headerMainCapsule.style.display = 'block';
      headerDetailCapsule.style.display = 'none';
      homeView.style.display = 'block';
      currentCategory = 'all';
      document.querySelectorAll('.cat-pill').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'all'));
      renderCourses();
      scrollContainer.scrollTop = 200;
    } else if (tab === 'favorites') {
      headerMainCapsule.style.display = 'none';
      headerDetailCapsule.style.display = 'none';
      favoritesView.style.display = 'block';
      renderFavoritesList();
    } else if (tab === 'profile') {
      headerMainCapsule.style.display = 'none';
      headerDetailCapsule.style.display = 'none';
      profileView.style.display = 'block';
      updateProfileStats();
    }
  });
});

// Category Filter Handling
categoriesScroll.addEventListener('click', (e) => {
  const btn = e.target.closest('.cat-pill');
  if (!btn) return;

  haptic('light');
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  currentCategory = btn.getAttribute('data-cat');
  renderCourses();
});

// Search Input Handling
searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value.trim();
  searchClearBtn.style.display = searchQuery ? 'flex' : 'none';
  renderCourses();
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  renderCourses();
  searchInput.focus();
});

// ==========================================
// 9. INITIAL BOOTSTRAP
// ==========================================
updateStatsCounters();
renderCourses();
updateProfileStats();
