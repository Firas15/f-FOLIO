/* Данные портфолио. Удобнее всего править через админку (/admin/). Если правите руками, после «window.PORTFOLIO =» должен остаться чистый JSON. */
window.PORTFOLIO = {
    "profile": {
        "firstName": "Фирас",
        "lastName": "Хашаб",
        "role": "Программист",
        "city": "Нижний Новгород",
        "timezone": "Europe/Moscow",
        "photo": "assets/img/photos/firas.webp",
        "qr": "assets/img/qr-telegram.webp",
        "status": "Открыт к новым проектам",
        "quote": "Пишу код, за который не стыдно, и делаю интерфейсы, к которым хочется возвращаться.",
        "study": {
            "place": "ННГАСУ",
            "program": "Информационные системы и технологии",
            "short": "ИСТ",
            "level": "Бакалавриат"
        },
        "work": {
            "company": "Е-Паблиш",
            "url": "https://e-publish.ru/",
            "city": "Москва (Удалённо)",
            "about": "IT-компания"
        },
        "skills": [
            "Веб-разработка",
            "Информационные системы",
            "Frontend",
            "Backend",
            "UI / UX",
            "Базы данных",
            "Адаптивная вёрстка"
        ],
        "en": {
            "firstName": "Firas",
            "lastName": "Khashab",
            "role": "Software Developer",
            "city": "Nizhny Novgorod",
            "status": "Open to new projects",
            "quote": "I write code I’m proud of and build interfaces people want to come back to.",
            "study": {
                "place": "NNGASU",
                "program": "Information Systems and Technologies",
                "short": "IST",
                "level": "Bachelor’s degree"
            },
            "work": {
                "company": "E-Publish",
                "city": "Moscow (remote)",
                "about": "IT company"
            },
            "skills": [
                "Web development",
                "Information systems",
                "Frontend",
                "Backend",
                "UI / UX",
                "Databases",
                "Responsive layout"
            ]
        }
    },
    "contacts": [
        {
            "type": "telegram",
            "label": "Telegram",
            "value": "@Cart00nTG",
            "url": "https://t.me/Cart00nTG"
        },
        {
            "type": "email",
            "label": "Почта",
            "value": "livefiras89@gmail.com",
            "url": "mailto:livefiras89@gmail.com",
            "en": {
                "label": "Email"
            }
        },
        {
            "type": "github",
            "label": "GitHub",
            "value": "Firas15",
            "url": "https://github.com/Firas15"
        },
        {
            "type": "vk",
            "label": "ВКонтакте",
            "value": "f.khashab",
            "url": "https://vk.com/f.khashab",
            "en": {
                "label": "VK"
            }
        }
    ],
    "projects": [
        {
            "id": "gamecode",
            "title": "GameCode",
            "url": "http://gmcode.ru/",
            "domain": "gmcode.ru",
            "category": "Образовательная платформа",
            "status": "live",
            "kind": "site",
            "tags": [
                "Веб-платформа",
                "Игры",
                "Чат-бот"
            ],
            "short": "Платформа, где программированию учатся через игры.",
            "description": "«Программирование через игру — лучший способ учиться»: игры по уровням сложности, рейтинг игроков, новости, теория и маскот Пиксель, который отвечает на вопросы как чат-бот. Командный проект, отмеченный дипломом.",
            "images": [
                "assets/img/projects/gmcode.webp",
                "assets/img/photos/gamecode-talk.webp",
                "assets/img/photos/gamecode-diploma.webp"
            ],
            "featured": true,
            "hidden": false,
            "en": {
                "category": "Educational platform",
                "tags": [
                    "Web platform",
                    "Games",
                    "Chatbot"
                ],
                "short": "A platform where people learn programming through games.",
                "description": "“Learning to code through play is the best way to learn”: games by difficulty level, a player leaderboard, news, theory, and the mascot Pixel, who answers questions like a chatbot. A team project recognized with a diploma."
            }
        },
        {
            "id": "theater-cam",
            "title": "Пульт камер «Школьный театр»",
            "url": "",
            "domain": "",
            "category": "Модуль управления камерами",
            "status": "live",
            "kind": "app",
            "tags": [
                "Windows",
                "IP-камеры",
                "Python"
            ],
            "short": "Пульт камер «Школьный театр» — программа для Windows, с которой режиссёр управляет IP-камерами со своего компьютера: поворачивает их, приближает, переключает ракурсы и записывает спектакль одной кнопкой.",
            "description": "Пульт камер «Школьный театр» — программа для Windows, с которой режиссёр управляет IP-камерами со своего компьютера: поворачивает их, приближает, переключает ракурсы и записывает спектакль одной кнопкой. Работает с разными моделями камер (ONVIF, фирменные протоколы, «только RTSP»): сохранённые ракурсы-пресеты, цифровой зум, запись каждой камеры и итогового ролика, выбор камеры «в эфир» и управление с клавиатуры. Стек: Python, PySide6, FFmpeg.",
            "images": [
                "assets/img/uploads/projects/20261024-35331f5f1d.webp"
            ],
            "featured": true,
            "hidden": false,
            "en": {
                "title": "“School Theater” Camera Console",
                "category": "Camera control module",
                "tags": [
                    "Windows",
                    "IP cameras",
                    "Python"
                ],
                "short": "“School Theater” Camera Console is a Windows program that lets a director control IP cameras from their computer: pan and zoom them, switch angles and record a performance with a single button.",
                "description": "“School Theater” Camera Console is a Windows program that lets a director control IP cameras from their computer: pan and zoom them, switch angles and record a performance with a single button. It works with different camera models (ONVIF, proprietary protocols, “RTSP only”): saved angle presets, digital zoom, recording of each camera and of the final video, choosing which camera goes “on air”, and keyboard control. Stack: Python, PySide6, FFmpeg."
            }
        },
        {
            "id": "foreign-students",
            "title": "ИС учёта иностранных студентов ННГАСУ",
            "url": "",
            "domain": "",
            "category": "Информационная система",
            "status": "live",
            "kind": "app",
            "tags": [
                "Информационная система",
                "Роли и доступы",
                "Справочники"
            ],
            "short": "Настольная информационная система для учёта иностранных студентов ННГАСУ с ролями администратора и оператора.",
            "description": "Информационная система для учёта иностранных студентов ННГАСУ. Работа разделена по ролям: администратор ведёт учётные записи пользователей — создаёт, редактирует и деактивирует их, назначает роль, а операторы работают с данными студентов. Справочник стран и гражданств на русском и английском пополняется прямо из программы. Проект представлен докладом «Информационная система учёта иностранных граждан» на Всероссийской научной конференции ННГАСУ.",
            "images": [
                "assets/img/uploads/projects/20261024-0e32c88108.webp",
                "assets/img/uploads/projects/20261024-59fd1c4fc5.webp"
            ],
            "featured": false,
            "hidden": false,
            "en": {
                "title": "NNGASU International Student Records System",
                "category": "Information system",
                "tags": [
                    "Information system",
                    "Roles and access",
                    "Reference data"
                ],
                "short": "A desktop information system for keeping records of NNGASU’s international students, with administrator and operator roles.",
                "description": "An information system for keeping records of international students at NNGASU. Work is split by role: the administrator manages user accounts — creates, edits and deactivates them and assigns roles — while operators work with student data. The reference list of countries and citizenships, in Russian and English, can be extended right from the app. The project was presented in the talk “Information System for Registering Foreign Citizens” at an All-Russian research conference at NNGASU."
            }
        },
        {
            "id": "lib-rusobr",
            "title": "Lib.Rusobr",
            "url": "https://lib.rusobr.ru/",
            "domain": "lib.rusobr.ru",
            "category": "Цифровая платформа",
            "status": "live",
            "kind": "site",
            "tags": [
                "Веб-платформа",
                "Каталог",
                "Личный кабинет"
            ],
            "short": "Цифровая платформа школьных библиотек.",
            "description": "Сайт библиотеки за 5 минут, готовый каталог из 8 000+ карточек, учёт учебников и заявки на закупку в один клик. Роли для библиотекарей, педагогов, учеников и родителей.",
            "images": [
                "assets/img/projects/lib.webp"
            ],
            "featured": true,
            "hidden": false,
            "en": {
                "category": "Digital platform",
                "tags": [
                    "Web platform",
                    "Catalog",
                    "User account"
                ],
                "short": "A digital platform for school libraries.",
                "description": "A library website in 5 minutes, a ready-made catalog of 8,000+ records, textbook inventory and one-click purchase requests. Roles for librarians, teachers, students and parents."
            }
        },
        {
            "id": "edusite",
            "title": "Edusite",
            "url": "https://edusite.ru/",
            "domain": "edusite.ru",
            "category": "Конструктор сайтов",
            "status": "live",
            "kind": "site",
            "tags": [
                "Веб-платформа",
                "Конструктор",
                "Доступность"
            ],
            "short": "Конструктор сайтов для школ и детских садов: сайт по требованиям Рособрнадзора без программиста.",
            "description": "MagicSite — платформа «Е-Паблиш» для создания и ведения сайтов образовательных организаций: ей пользуются более 5 500 школ, детских садов и вузов. Обязательные разделы заполняются как анкета: система показывает, что не заполнено, и напоминает о документах. Версия для слабовидящих с озвучкой собирается автоматически, есть проверка сайта на соответствие требованиям Рособрнадзора, модуль «Обращения граждан» по 59-ФЗ, портфолио педагогов, голосовой ввод и копирование из Word и Excel без искажений.",
            "images": [
                "assets/img/uploads/projects/20261024-79b971383f.webp"
            ],
            "featured": false,
            "hidden": false,
            "en": {
                "category": "Website builder",
                "tags": [
                    "Web platform",
                    "Website builder",
                    "Accessibility"
                ],
                "short": "A website builder for schools and kindergartens: a website that meets Rosobrnadzor requirements, no programmer needed.",
                "description": "MagicSite is E-Publish’s platform for creating and running websites of educational institutions, used by more than 5,500 schools, kindergartens and universities. Mandatory sections are filled in like a questionnaire: the system shows what is missing and reminds you about documents. A version for the visually impaired with text-to-speech is generated automatically; there is a check for compliance with Rosobrnadzor requirements, a “Citizens’ Appeals” module under Federal Law No. 59-FZ, teacher portfolios, voice input, and copying from Word and Excel without formatting loss."
            }
        },
        {
            "id": "arni-fitness",
            "title": "Арни-фитнес — учёт клиентов",
            "url": "",
            "domain": "",
            "category": "Учёт клиентов",
            "status": "live",
            "kind": "db",
            "tags": [
                "База данных",
                "Учёт клиентов",
                "Импорт Excel"
            ],
            "short": "Учёт клиентской базы фитнес-клуба: абонементы, продления, оплаты и статусы клиентов в одном окне.",
            "description": "Настольное приложение с базой данных для администратора фитнес-клуба «Арни-фитнес». В базе — клиенты и их абонементы: безлимитные, студенческие, с занятиями с тренером; продление абонемента, история платежей и персональные скидки. Статус считается сам по дате окончания — активный, скоро истекает, истёк, больше не клиент: строки подсвечиваются цветом, а фильтры и поиск помогают быстро найти нужных людей. Есть импорт клиентов из Excel, резервные копии базы, журнал действий операторов и прайс-лист.",
            "images": [
                "assets/img/uploads/projects/20261024-3dc7e1dcf5.webp",
                "assets/img/uploads/projects/20261024-6cccb1fe0e.webp"
            ],
            "featured": false,
            "hidden": false,
            "en": {
                "title": "Arni Fitness — Client Records",
                "category": "Client records",
                "tags": [
                    "Database",
                    "Client records",
                    "Excel import"
                ],
                "short": "Client database for a fitness club: memberships, renewals, payments and client statuses in one window.",
                "description": "A desktop database application for the front desk of the Arni Fitness club. The database stores clients and their memberships — unlimited, student, and with personal training sessions — plus renewals, payment history and personal discounts. Status is calculated automatically from the end date — active, expiring soon, expired, former client: rows are color-coded, and filters and search help find the right people quickly. It also offers client import from Excel, database backups, an operator activity log and a price list."
            }
        },
        {
            "id": "help-lib",
            "title": "Help-Lib",
            "url": "https://help-lib.rusobr.ru/",
            "domain": "help-lib.rusobr.ru",
            "category": "База знаний",
            "status": "live",
            "kind": "site",
            "tags": [
                "Документация",
                "Поиск",
                "UX"
            ],
            "short": "Руководство по созданию и ведению школьных библиотек.",
            "description": "Справочный центр для пользователей платформы: пошаговые инструкции для библиотекаря и администратора, навигация по 15 разделам и быстрый поиск по инструкциям (Ctrl + K).",
            "images": [
                "assets/img/projects/help-lib.webp"
            ],
            "featured": false,
            "hidden": false,
            "en": {
                "category": "Knowledge base",
                "tags": [
                    "Documentation",
                    "Search",
                    "UX"
                ],
                "short": "A guide to creating and running school libraries.",
                "description": "A help center for platform users: step-by-step instructions for librarians and administrators, navigation across 15 sections and quick search through the guides (Ctrl + K)."
            }
        },
        {
            "id": "cpp-test-bot",
            "title": "Тест-бот на C++",
            "url": "",
            "domain": "",
            "category": "Telegram-бот",
            "status": "dev",
            "kind": "bot",
            "tags": [
                "Telegram",
                "C++"
            ],
            "short": "Telegram-бот на C++. Пока не размещён на сервере.",
            "description": "Тест-бот для Telegram, написанный на C++. Сейчас бот не размещён на сервере, поэтому ссылки на него нет; код и демонстрация — по запросу.",
            "images": [],
            "featured": false,
            "hidden": false,
            "en": {
                "title": "C++ Test Bot",
                "category": "Telegram bot",
                "tags": [
                    "Telegram",
                    "C++"
                ],
                "short": "A Telegram bot written in C++. Not deployed to a server yet.",
                "description": "A Telegram test bot written in C++. It is not deployed to a server at the moment, so there is no link to it; code and a demo are available on request."
            }
        }
    ],
    "upcomingSlots": 1,
    "achievementTypes": [
        {
            "id": "diploma",
            "plural": "Дипломы",
            "single": "Диплом",
            "en": {
                "plural": "Diplomas",
                "single": "Diploma"
            }
        },
        {
            "id": "certificate",
            "plural": "Сертификаты",
            "single": "Сертификат",
            "en": {
                "plural": "Certificates",
                "single": "Certificate"
            }
        },
        {
            "id": "t-mvmj8mr0lik5",
            "plural": "Другое",
            "single": "Другое",
            "en": {
                "plural": "Other",
                "single": "Other"
            }
        }
    ],
    "achievements": [
        {
            "id": "gamecode-diploma",
            "type": "diploma",
            "title": "Диплом за 1 место проект GameCode.",
            "org": "Командный проект, выдан за 1 место в конкурсе студенческих программных проектов \"Цифровые технологии будущего\"",
            "date": "МАЙ 2026",
            "images": [
                "assets/img/uploads/achievements/20261024-387f361463.jpg",
                "assets/img/photos/gamecode-diploma.webp"
            ],
            "hidden": false,
            "en": {
                "title": "1st place diploma for the GameCode project",
                "org": "Team project; awarded 1st place in the student software project competition “Digital Technologies of the Future”",
                "date": "MAY 2026"
            }
        },
        {
            "id": "diploma-3",
            "type": "diploma",
            "title": "Диплом III степени",
            "org": "Конференция, диплом получен за доклад «Информационная система учёта иностранных граждан», ННГАСУ.",
            "date": "МАЙ 2026",
            "images": [
                "assets/img/uploads/achievements/20261024-0fcf5de928.jpg",
                "assets/img/uploads/achievements/20261024-e331042f45.png",
                "assets/img/photos/diploma-3.webp"
            ],
            "hidden": false,
            "en": {
                "title": "3rd-degree diploma",
                "org": "Conference; awarded for the talk “Information System for Registering Foreign Citizens”, NNGASU",
                "date": "MAY 2026"
            }
        },
        {
            "id": "a-mvmiwcmpxekj",
            "type": "diploma",
            "title": "Диплом за лучший доклад",
            "org": "Конференция \"Современные информационные технологии в образовании\".  Вручен за проект: \"Цифровая платформа школьных библитотек lib.rusobr.ru\", ИТО",
            "date": "ИЮНЬ 2026",
            "images": [
                "assets/img/uploads/achievements/20261024-a3173d65ae.jpg"
            ],
            "hidden": false,
            "en": {
                "title": "Best talk diploma",
                "org": "“Modern Information Technologies in Education” conference. Awarded for the project “Digital Platform for School Libraries lib.rusobr.ru”, ITO",
                "date": "JUNE 2026"
            }
        },
        {
            "id": "a-mvmj65y74w6d",
            "type": "certificate",
            "title": "Сертификат",
            "org": "Сертификат об участии в конкурсе студенческих программных проектов \"Цифровые технологии будущего\". ННГАСУ",
            "date": "МАЙ 2026",
            "images": [
                "assets/img/uploads/achievements/20261024-502a1c7c3f.jpg"
            ],
            "hidden": false,
            "en": {
                "title": "Certificate",
                "org": "Certificate of participation in the student software project competition “Digital Technologies of the Future”, NNGASU",
                "date": "MAY 2026"
            }
        },
        {
            "id": "a-mvmin43e4684",
            "type": "diploma",
            "title": "Диплом за «Тест-бот в Telegram для проверки знаний C++»",
            "org": "Конкурс студенческих проектов \"Цифровые технологии будущего\", ННГАСУ",
            "date": "МАЙ 2025",
            "images": [
                "assets/img/uploads/achievements/20261024-110d1edd51.jpg",
                "assets/img/uploads/achievements/20261024-75d81b0bb5.jpg",
                "assets/img/uploads/achievements/20261024-7e7f5d2623.jpg"
            ],
            "hidden": false,
            "en": {
                "title": "Diploma for “A Telegram test bot for checking C++ knowledge”",
                "org": "Student project competition “Digital Technologies of the Future”, NNGASU",
                "date": "MAY 2025"
            }
        },
        {
            "id": "a-mvmlhkpf9nqc",
            "type": "t-mvmj8mr0lik5",
            "title": "Слушатель на конференции разработчиков",
            "org": "OSSDEVCONF, BaseAlt",
            "date": "ОКТЯБРЬ 2026",
            "images": [
                "assets/img/uploads/achievements/20261024-d8c4af930b.jpg",
                "assets/img/uploads/achievements/20261024-fad405b90d.jpg"
            ],
            "hidden": false,
            "en": {
                "title": "Attendee at a developer conference",
                "org": "OSSDEVCONF, BaseAlt",
                "date": "OCTOBER 2026"
            }
        },
        {
            "id": "a-mvmj8x72j2dj",
            "type": "t-mvmj8mr0lik5",
            "title": "Шоукейс ItGorky (Участник)",
            "org": "Шоукейс, ItGorky",
            "date": "ОКТЯБРЬ 2026",
            "images": [
                "assets/img/uploads/achievements/20261024-6e1ed2041a.jpg",
                "assets/img/uploads/achievements/20261024-e6a79ba1ea.jpg"
            ],
            "hidden": false,
            "en": {
                "title": "ItGorky Showcase (participant)",
                "org": "Showcase, ItGorky",
                "date": "OCTOBER 2026"
            }
        }
    ],
    "hero": {
        "facts": [
            {
                "kind": "projects",
                "value": "",
                "label": ""
            },
            {
                "kind": "achievements",
                "value": "",
                "label": ""
            },
            {
                "kind": "custom",
                "value": "ННГАСУ",
                "label": "учусь на ИСТ (3 курс)",
                "en": {
                    "value": "NNGASU",
                    "label": "3rd-year IST student"
                }
            }
        ],
        "showWorks": true
    }
}
;
