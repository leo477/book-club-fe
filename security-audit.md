# Security Review — Book Club (OWASP Top 10)

## Context

Повний аудит безпеки frontend (Angular) та backend (FastAPI) відповідно до OWASP Top 10.
Виявлені вразливості відсортовані за критичністю. Для кожної — опис ризику, місце в коді та безпечний приклад виправлення.

**Агент для реалізації виправлень:** `security`

---

## 🔴 HIGH — Відсутній rate limiting на автентифікацію і публічні API

**Ризик:** Brute-force атаки на `/auth/login`, спам-реєстрація, зловживання зовнішніми API (Geocoding, Google Books) за рахунок сервісу.

**Файли:** `app/main.py`, `app/routers/auth.py`, `app/routers/geocoding.py`, `app/routers/books.py`

**Виправлення — slowapi через Redis (вже є в стеку):**

```python
# app/main.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address, storage_uri=settings.REDIS_URL)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# app/routers/auth.py
@router.post("/login")
@limiter.limit("10/minute")
async def login(request: Request, ...):
    ...

@router.post("/register")
@limiter.limit("5/minute")
async def register(request: Request, ...):
    ...

# app/routers/geocoding.py
@router.get("/autocomplete")
@limiter.limit("30/minute")
async def geocode(request: Request, ...):
    ...
```

---

## 🟠 MEDIUM — JWT токен у query-параметрі WebSocket

**Ризик:** Токен потрапляє в access-логи nginx/reverse-proxy, browser history, Referer заголовки. Будь-який лог-агрегатор може зібрати токен.

**Файл:** `app/routers/chat.py:364`
```python
# ВРАЗЛИВО — зараз:
token: str = Query(...)  # ws://host/chat/rooms/123?token=eyJ...
```

**Виправлення — перенести токен у перше WS-повідомлення ("auth frame"):**

```python
# Backend (chat.py)
@router.websocket("/chat/rooms/{room_id}")
async def websocket_chat(ws: WebSocket, room_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await ws.accept()
    try:
        auth_msg = await asyncio.wait_for(ws.receive_json(), timeout=5.0)
        token = auth_msg.get("token")
        if not token:
            await ws.close(code=1008)
            return
        payload = decode_supabase_token(token)
        user_id = uuid.UUID(payload["sub"])
    except (asyncio.TimeoutError, Exception):
        await ws.close(code=1008)
        return
    # ... решта логіки без змін
```

```typescript
// Frontend (chat.service.ts) — надіслати токен одразу після connect
this.ws = new WebSocket(wsUrl);
this.ws.onopen = () => {
  this.ws!.send(JSON.stringify({ token: this.tokenStore.snapshot() }));
};
```

---

## 🟠 MEDIUM — Pydantic validation errors розкривають структуру API

**Ризик:** Атакувальник отримує точні назви полів, типи, обмеження — готову карту для перебору і crafted payloads.

**Файл:** `app/main.py:254-256`
```python
# ВРАЗЛИВО — зараз:
@app.exception_handler(ValidationError)
async def validation_exception_handler(_request, exc):
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
    # Повертає: [{"loc": ["body","password"], "msg": "min_length=8", "type": "string_too_short"}]
```

**Виправлення — sanitize у production:**
```python
@app.exception_handler(ValidationError)
async def validation_exception_handler(_request: Request, exc: ValidationError) -> JSONResponse:
    if settings.ENVIRONMENT == "production":
        return JSONResponse(status_code=422, content={"detail": "Invalid request data"})
    # dev/staging — детальні помилки залишаємо для зручності
    return JSONResponse(status_code=422, content={"detail": exc.errors()})
```

---

## 🟠 MEDIUM — GET /clubs/{id}/members доступний без автентифікації

**Ризик:** Будь-хто може перебрати всіх учасників клубу (email, soсials, imена) без входу. OWASP A01: Broken Access Control.

**Файл:** `app/routers/members.py:26`
```python
# ВРАЗЛИВО — зараз:
current_user: User | None = Depends(get_optional_user)
```

**Виправлення:**
```python
# Варіант 1 — обов'язкова авторизація:
current_user: User = Depends(get_current_user)

# Варіант 2 — лише члени клубу бачать список:
async def get_members(..., current_user: User = Depends(get_current_user)):
    membership = await db.scalar(
        select(ClubMember).where(
            ClubMember.club_id == club_id,
            ClubMember.user_id == current_user.id
        )
    )
    if not membership:
        raise HTTPException(403, "Members list is visible to club members only")
```

---

## 🟠 MEDIUM — Access token у sessionStorage (залишковий XSS-ризик)

**Ризик:** За наявності XSS вектора (навіть через third-party скрипти) зловмисник зчитує `sessionStorage.getItem('bc_access_token')`. Токен діє 15 хв, refresh token в httpOnly.

**Файл:** `src/app/core/auth/token.store.ts:58`

> Частково пом'якшено: CSP у `vercel.json` забороняє `unsafe-inline`, TTL = 15 хв, refresh — httpOnly cookie.
> TODO вже є в коді (рядок 47) — проксі-endpoint `/api/auth/token` на backend.

**Виправлення (довгострокове) — httpOnly cookie proxy:**
```python
# Backend: новий endpoint
@router.post("/auth/session")
async def create_session(data: TokenExchange, response: Response):
    """Обмінює Supabase access token на httpOnly session cookie."""
    response.set_cookie(
        "access_token", data.access_token,
        httponly=True, secure=True, samesite="strict",
        max_age=900  # 15 хв
    )
    return {"ok": True}
```

```typescript
// Frontend: прибрати sessionStorage, читати токен автоматично через cookie
// auth.interceptor.ts — не додавати Bearer вручну, браузер сам надсилає cookie
```

---

## 🟡 LOW — Відсутні security headers на backend

**Ризик:** Clickjacking (без X-Frame-Options), MIME-sniffing (без nosniff), відсутній HSTS.
Backend на Render.com — відповідальний за власні заголовки.

**Файл:** `app/main.py`

**Виправлення — middleware:**
```python
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        return response

app.add_middleware(SecurityHeadersMiddleware)
```

---

## 🟡 LOW — Відсутні max_length на полях схем клубу / події

**Ризик:** DoS через payload з мегабайтним рядком у `name`, `description`, `tags`.

**Файл:** `app/schemas/clubs.py:70-77`, `app/schemas/events.py`

**Виправлення:**
```python
class CreateClubRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field("", max_length=2000)
    tags: list[str] = Field(default_factory=list, max_length=20)  # макс 20 тегів
    # кожен тег:
    @field_validator("tags")
    def validate_tags(cls, v):
        return [t[:50] for t in v]  # або ValidationError якщо > 50
```

---

## ✅ Без вразливостей (підтверджено аудитом)

| Область | Статус |
|---------|--------|
| SQL Injection | ✅ SQLAlchemy ORM скрізь, параметризовані запити |
| XSS у шаблонах | ✅ Angular auto-escape, немає `[innerHTML]` / `bypassSecurityTrust*` |
| SSRF | ✅ Всі зовнішні URL hardcoded, user input лише в query params |
| File upload | ✅ MIME allowlist (JPEG/PNG/WebP/GIF), ліміт 5 MB |
| Password storage | ✅ Делеговано Supabase, локально не зберігається |
| Token в URL | ✅ Bearer лише в Authorization header (HTTP) |
| HTTPS | ✅ Всі URL https://, wss://, HSTS у vercel.json |
| Refresh token | ✅ httpOnly cookie, SameSite=Lax, path=/api/v1/auth |
| CSP (frontend) | ✅ Vercel.json: no unsafe-inline, sha256 hashes, X-Frame-Options DENY |
| Input validation | ✅ DISPLAY_NAME_PATTERN allowlist, Pydantic constraints |
| Error disclosure | ✅ Generic 500 handler, Sentry server-side |
| Swagger/OpenAPI | ✅ Вимкнено в prod (docs_url=None) |

---

## Порядок виправлень

1. 🔴 Rate limiting — `security` агент, backend
2. 🟠 WebSocket token — `security` агент, backend + frontend
3. 🟠 Validation error sanitization — `security` агент, backend
4. 🟠 Members endpoint auth — `security` агент, backend
5. 🟡 Security headers middleware — `security` агент, backend
6. 🟡 Schema max_length — `security` агент, backend
7. 🟠 SessionStorage → httpOnly cookie (окрема задача, потребує BE proxy endpoint)

---

## Верифікація

- Rate limit: `for i in {1..15}; do curl -X POST /api/v1/auth/login -d '{"email":"x","password":"y"}'; done` → після 10-го 429
- WS token: перевірити nginx access.log — токен не повинен з'являтися в URL
- Validation: POST з невалідними полями → prod повертає `{"detail": "Invalid request data"}`
- Members: GET /clubs/{id}/members без токена → 401
- Headers: `curl -I https://book-club-be.onrender.com` → наявність `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`
