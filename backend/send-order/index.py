import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


def cors_headers():
    """CORS заголовки для всех ответов"""
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }


def validate_phone(phone: str) -> bool:
    """Валидация номера телефона"""
    import re
    # Простая валидация: цифры, плюс, скобки, пробелы, дефисы
    pattern = r'^[\+\d\s\(\)\-]{10,20}$'
    return bool(re.match(pattern, phone.strip()))


def validate_name(name: str) -> bool:
    """Валидация имени"""
    return bool(name.strip()) and len(name.strip()) <= 100


def handler(event: dict, context) -> dict:
    """Отправка заявки с сайта на почту"""
    
    # OPTIONS запрос для CORS
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers(), "body": ""}
    
    # Только POST разрешен
    if event.get("httpMethod") != "POST":
        return {
            "statusCode": 405,
            "headers": cors_headers(),
            "body": json.dumps({"error": "Method not allowed"}),
        }
    
    try:
        # Парсинг и валидация тела запроса
        body = json.loads(event.get("body") or "{}")
        name = body.get("name", "").strip()
        phone = body.get("phone", "").strip()
        service = body.get("service", "").strip()  # Доп. поле: услуга
        comment = body.get("comment", "").strip()  # Доп. поле: комментарий
        
        # Валидация
        if not name:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Имя обязательно"}),
            }
        
        if not phone:
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Телефон обязателен"}),
            }
        
        if not validate_phone(phone):
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Неверный формат телефона"}),
            }
        
        if not validate_name(name):
            return {
                "statusCode": 400,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Имя слишком длинное (макс. 100 символов)"}),
            }
        
        # Получаем пароль из переменной окружения (БЕЗОПАСНО!)
        email_from = os.environ.get("EMAIL_FROM", "arenda-chistoty.ru@yandex.ru")
        email_to = os.environ.get("EMAIL_TO", "arenda-chistoty.ru@yandex.ru")
        password = os.environ.get("EMAIL_PASSWORD")
        
        if not password:
            # Логируем ошибку, но не показываем пользователю детали
            print("ERROR: EMAIL_PASSWORD environment variable not set")
            return {
                "statusCode": 500,
                "headers": cors_headers(),
                "body": json.dumps({"error": "Internal server error"}),
            }
        
        # Формируем HTML письмо
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: #0cb8a0; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; }}
                .field {{ margin-bottom: 15px; }}
                .label {{ font-weight: bold; color: #333; margin-bottom: 5px; }}
                .value {{ color: #555; padding: 8px; background: white; border-radius: 5px; }}
                .footer {{ text-align: center; padding: 15px; color: #888; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h2>📋 Новая заявка на химчистку</h2>
                </div>
                <div class="content">
                    <div class="field">
                        <div class="label">👤 Имя:</div>
                        <div class="value">{name}</div>
                    </div>
                    <div class="field">
                        <div class="label">📞 Телефон:</div>
                        <div class="value"><a href="tel:{phone}" style="color: #0cb8a0;">{phone}</a></div>
                    </div>
                    {f'''
                    <div class="field">
                        <div class="label">🔧 Услуга:</div>
                        <div class="value">{service}</div>
                    </div>
                    ''' if service else ''}
                    {f'''
                    <div class="field">
                        <div class="label">💬 Комментарий:</div>
                        <div class="value">{comment}</div>
                    </div>
                    ''' if comment else ''}
                    <div class="field">
                        <div class="label">⏰ Время заявки:</div>
                        <div class="value">{__import__('datetime').datetime.now().strftime('%d.%m.%Y %H:%M:%S')}</div>
                    </div>
                    <div class="field">
                        <div class="label">🌐 IP адрес:</div>
                        <div class="value">{event.get('requestContext', {}).get('http', {}).get('sourceIp', 'unknown')}</div>
                    </div>
                </div>
                <div class="footer">
                    Письмо сгенерировано автоматически | Аренда Чистоты
                </div>
            </div>
        </body>
        </html>
        """
        
        # Текстовая версия для email клиентов без HTML
        text = f"""
        Новая заявка на химчистку
        ========================
        Имя: {name}
        Телефон: {phone}
        {f'Услуга: {service}' if service else ''}
        {f'Комментарий: {comment}' if comment else ''}
        Время: {__import__('datetime').datetime.now().strftime('%d.%m.%Y %H:%M:%S')}
        """
        
        # Создаем письмо
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Заявка с сайта: {name} — {phone}"
        msg["From"] = email_from
        msg["To"] = email_to
        msg["Reply-To"] = email_from
        
        # Добавляем обе версии (текст и HTML)
        msg.attach(MIMEText(text, "plain", "utf-8"))
        msg.attach(MIMEText(html, "html", "utf-8"))
        
        # Отправляем
        with smtplib.SMTP_SSL("smtp.yandex.ru", 465) as server:
            server.login(email_from, password)
            server.sendmail(email_from, email_to, msg.as_string())
        
        # Логируем успешную отправку (без sensitive данных)
        print(f"✅ Order sent: {name} - {phone[-4:]}")  # Только последние 4 цифры телефона
        
        return {
            "statusCode": 200,
            "headers": cors_headers(),
            "body": json.dumps({"ok": True, "message": "Заявка успешно отправлена"}),
        }
        
    except json.JSONDecodeError:
        return {
            "statusCode": 400,
            "headers": cors_headers(),
            "body": json.dumps({"error": "Invalid JSON"}),
        }
    except smtplib.SMTPAuthenticationError:
        print("ERROR: SMTP authentication failed")
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": "Email configuration error"}),
        }
    except Exception as e:
        print(f"ERROR: {str(e)}")
        return {
            "statusCode": 500,
            "headers": cors_headers(),
            "body": json.dumps({"error": "Internal server error"}),
        }