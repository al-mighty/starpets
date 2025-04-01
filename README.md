# StarPets Project

## Инструменты мониторинга и управления

### Grafana (http://localhost:3001)
- Логин: admin
- Пароль: admin
- Доступные дашборды:
  - StarPets Dashboard - общая статистика приложения (HTTP запросы, память)
  - Tasks Dashboard - мониторинг активных задач по инстансам

### Prometheus (http://localhost:9090)
- Метрики:
  - `app_active_tasks_total` - количество активных задач по инстансам
  - `http_requests_total` - количество HTTP запросов
  - `http_request_duration_seconds` - время ответа на запросы
  - Стандартные метрики Node.js (память, CPU)
- Query Examples:
  ```
  # Общее количество активных задач
  sum(app_active_tasks_total)

  # Количество HTTP запросов в минуту
  rate(http_requests_total[1m])

  # Среднее время ответа
  rate(http_request_duration_seconds_sum[5m]) / rate(http_request_duration_seconds_count[5m])
  ```

### Nginx (http://localhost)
- Балансировка нагрузки между инстансами приложения
- Endpoints:
  - `/health` - проверка здоровья
  - `/metrics` - метрики Prometheus
  - `/` - основной API

### PostgreSQL
- База данных для хранения задач и их истории
- Порт: 5432
- Credentials:
  - User: postgres
  - Password: postgres
  - Database: starpets

## Управление приложением

### Запуск
```bash
# Запуск всех сервисов
docker compose up -d

# Запуск с масштабированием (N инстансов)
TOTAL_INSTANCES=N docker compose up -d --scale app=N
```

### Мониторинг
```bash
# Просмотр логов всех сервисов
docker compose logs -f

# Просмотр логов конкретного сервиса
docker compose logs -f app

# Проверка статуса сервисов
docker compose ps
```

### Перезапуск
```bash
# Перезапуск всех сервисов
docker compose restart

# Перезапуск конкретного сервиса
docker compose restart app
```

### Остановка
```bash
# Остановка всех сервисов
docker compose down

# Остановка с удалением volumes
docker compose down -v
```

## Архитектура

### Масштабирование
- Приложение поддерживает горизонтальное масштабирование
- Каждый инстанс получает уникальный ID через переменную окружения
- Nginx автоматически распределяет запросы между инстансами
- Задачи распределяются между инстансами через механизм блокировок в PostgreSQL

### Мониторинг
- Каждый инстанс экспортирует свои метрики
- Prometheus собирает метрики со всех инстансов
- Grafana визуализирует собранные метрики
- Поддерживается автоматическое обнаружение новых инстансов

### Отказоустойчивость
- Healthcheck для всех сервисов
- Автоматический перезапуск упавших сервисов
- Механизм восстановления задач при отказе инстанса
