# Указываем базовый образ
FROM python:3.9-alpine

# Устанавливаем системные зависимости
RUN apk update \
    && apk add --no-cache --virtual .build-deps gcc musl-dev libffi-dev postgresql-dev \
    && apk add --no-cache mariadb-dev

# Создаем директорию для приложения
RUN mkdir /web_django

# Устанавливаем рабочую директорию
WORKDIR /web_django

# Копируем файл с зависимостями
COPY requirements.txt /web_django/

# Устанавливаем Python-зависимости
RUN pip install --upgrade pip && pip install -r requirements.txt

# Копируем весь проект в рабочую директорию
COPY . /web_django/

# Создание и выполнение миграций базы данных
RUN python manage.py makemigrations
RUN python manage.py migrate

# Открываем порт для доступа к приложению
EXPOSE 4000

# Запускаем сервер
CMD ["python", "manage.py", "runserver", "0.0.0.0:4000"]