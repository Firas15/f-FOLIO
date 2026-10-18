/* Данные портфолио. Удобнее всего править через админку (/admin/). Если правите руками, после «window.PORTFOLIO =» должен остаться чистый JSON. */
window.PORTFOLIO = {
    "profile": {
        "firstName": "Фирас",
        "lastName": "Хашаб",
        "role": "Программист",
        "city": "Нижний Новгород",
        "timezone": "Europe/Moscow",
        "photo": "assets/img/photos/firas.webp",
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
            "city": "Москва",
            "about": "IT-компания"
        },
        "skills": [
            "Веб-разработка",
            "Информационные системы",
            "Frontend",
            "Backend",
            "UI / UX",
            "Базы данных",
            "Адаптивная вёрстка",
            "Анимации"
        ]
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
            "url": "mailto:livefiras89@gmail.com"
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
            "url": "https://vk.com/f.khashab"
        }
    ],
    "projects": [
        {
            "id": "gamecode",
            "title": "GameCode",
            "url": "http://gmcode.ru/",
            "domain": "gmcode.ru",
            "category": "Образовательная платформа",
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
            "hidden": false
        },
        {
            "id": "lib-rusobr",
            "title": "Lib.Rusobr",
            "url": "https://lib.rusobr.ru/",
            "domain": "lib.rusobr.ru",
            "category": "Цифровая платформа",
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
            "hidden": false
        },
        {
            "id": "help-lib",
            "title": "Help-Lib",
            "url": "https://help-lib.rusobr.ru/",
            "domain": "help-lib.rusobr.ru",
            "category": "База знаний",
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
            "featured": true,
            "hidden": false
        }
    ],
    "upcomingSlots": 2,
    "achievements": [
        {
            "id": "conf-nngasu-2026",
            "type": "conference",
            "title": "Доклад «Информационная система учёта иностранных граждан»",
            "org": "Всероссийская научная конференция, ННГАСУ",
            "date": "2026",
            "images": [
                "assets/img/photos/conf-nngasu.webp"
            ],
            "hidden": false
        },
        {
            "id": "diploma-3",
            "type": "diploma",
            "title": "Диплом III степени",
            "org": "",
            "date": "",
            "images": [
                "assets/img/photos/diploma-3.webp"
            ],
            "hidden": false
        },
        {
            "id": "gamecode-diploma",
            "type": "diploma",
            "title": "Диплом за проект GameCode",
            "org": "Командный проект",
            "date": "",
            "images": [
                "assets/img/photos/gamecode-diploma.webp"
            ],
            "hidden": false
        },
        {
            "id": "gamecode-showcase",
            "type": "showcase",
            "title": "Шоукейс GameCode",
            "org": "Презентация платформы и маскота Пикселя",
            "date": "",
            "images": [
                "assets/img/photos/gamecode-talk.webp"
            ],
            "hidden": false
        }
    ]
}
;
