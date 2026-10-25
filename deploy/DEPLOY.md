# Выкладка на сервер GameCode (89.108.70.28)

Портфолио живёт отдельно: код в `/opt/portfolio` (git), данные админки в `/opt/portfolio-data`
(вне git), свой контейнер `portfolio-web`. Общий nginx GameCode только проксирует на него.
Ничего в `/opt/gamecode` из отслеживаемого не меняем — только добавляем `conf.d/portfolio.conf`.

Везде ниже `f-folio.ru` — твой домен. Секреты (пароли, .env) никуда не пишем.

## 0. DNS (у регистратора)
A-записи `@` и `www` → `89.108.70.28`. Проверка: `getent hosts f-folio.ru www.f-folio.ru`.

## 1. Код и данные
```bash
free -h; df -h /                       # сервер общий — смотрим ресурсы
git clone https://github.com/Firas15/f-FOLIO.git /opt/portfolio
mkdir -p /opt/portfolio-data/storage /opt/portfolio-data/uploads
mkdir -p /opt/portfolio-data/data && cp /opt/portfolio/data/portfolio.js /opt/portfolio-data/data/portfolio.js
cp -r /opt/portfolio/assets/img/uploads/. /opt/portfolio-data/uploads/
cp /opt/portfolio/admin/storage/.htaccess /opt/portfolio/admin/storage/index.html /opt/portfolio-data/storage/
chown -R 33:33 /opt/portfolio-data     # 33 = www-data внутри контейнера
```

## 2. Контейнер
```bash
cd /opt/portfolio
cd /opt/portfolio/deploy
docker compose -p portfolio build --pull        # --pull: обновления PHP приезжают сами
docker compose -p portfolio up -d --remove-orphans
docker compose -p portfolio exec portfolio php -m | grep -i gd     # должно быть gd
```

## 3. nginx, этап 1 (HTTP)
```bash
sed 's/f-folio.ru/f-folio.ru/g' /opt/portfolio/deploy/nginx-portfolio.http.conf > /opt/gamecode/docker/nginx/conf.d/portfolio.conf
cd /opt/gamecode
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```
(`nginx -t` обязателен: ошибка положит и GameCode.) Проверка: `curl -I http://f-folio.ru`.

## 4. Сертификат (через работающий certbot-контейнер)
```bash
cd /opt/gamecode
# проба без расхода лимитов: добавить --staging, потом повторить без него (с --force-renewal)
docker compose run --rm --entrypoint certbot certbot certonly \
  --webroot -w /var/www/certbot -d f-folio.ru -d www.f-folio.ru \
  --email ПОЧТА --agree-tos --no-eff-email --non-interactive
```

## 5. nginx, этап 2 (HTTPS)
```bash
sed 's/f-folio.ru/f-folio.ru/g' /opt/portfolio/deploy/nginx-portfolio.https.conf > /opt/gamecode/docker/nginx/conf.d/portfolio.conf
cd /opt/gamecode
docker compose exec nginx nginx -t && docker compose exec nginx nginx -s reload
```
Раз в неделю nginx должен перечитывать продлённые сертификаты (полезно и GameCode):
`0 4 * * 1 cd /opt/gamecode && docker compose exec -T nginx nginx -s reload`

## 6. Пароль админки
Открыть `https://f-folio.ru/admin/` и задать пароль при первом входе (локальный `auth.php` на сервер не переносим).

## Правила (общий сервер)
- В сети `gamecode_default` не называть сервисы `web`, `db`, `redis`, `nginx`, `certbot`: имена заняты GameCode (сервис портфолио — `portfolio`).
- Портфолио запускать с `-p portfolio` из `/opt/portfolio/deploy`.
- Перед перезагрузкой nginx: `cd /opt/gamecode && docker compose exec -T nginx nginx -t`.
- В контейнер монтируется только сайт (index.html, assets, admin, data); `.git`, `deploy`, README наружу не попадают, а `location`-запреты в nginx-конфиге не удалять.
- В `/opt/gamecode` не трогать ничего, кроме `conf.d/portfolio.conf`.

## Обновление кода
```bash
cd /opt/portfolio && git pull          # пересборка не нужна; данные админки не затрагиваются
# если менялся deploy/Dockerfile или docker-compose.yml:
cd /opt/portfolio/deploy && docker compose -p portfolio build --pull && docker compose -p portfolio up -d --remove-orphans
```
Контент правим в админке на сервере — это теперь основная копия (`/opt/portfolio-data`).
Бэкапы админки лежат в `/opt/portfolio-data/storage/backups`.
