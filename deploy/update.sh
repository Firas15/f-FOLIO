#!/bin/sh
# Обновление портфолио на сервере:  sh /opt/portfolio/deploy/update.sh
set -e
cd /opt/portfolio
git pull --ff-only
cd deploy
docker compose -p portfolio up -d --remove-orphans
# index.html и .htaccess смонтированы отдельными файлами. git pull не правит файл, а кладёт новый на его место,
# и запущенный контейнер продолжает видеть старый — перезапуск (пара секунд) подхватывает новые.
docker restart portfolio-web
echo "Готово: $(git log --oneline -1)"
