# LumiBrace — Shopify Theme

תבנית Shopify מותאמת אישית בעברית (RTL), המבוססת על האתר הקיים.

## מבנה
```
shopify-theme/
  layout/theme.liquid          # שלד HTML + פיקסל TikTok
  assets/                      # CSS + JS
  config/                      # הגדרות תבנית
  locales/                     # תרגומים (he, en)
  sections/                    # רכיבים (header, hero, configurator, וכו')
  snippets/
  templates/                   # index, product, cart, וכו'
```

## איך להעלות ל-Shopify דרך GitHub

### שלב 1 — צור ריפוזיטורי
1. צור ריפו חדש ב-GitHub (יכול להיות פרטי).
2. העלה לתוכו **רק את התוכן** של `shopify-theme/` (לא את התיקייה עצמה — כלומר `layout/`, `assets/`, וכו' בשורש).

### שלב 2 — חבר ל-Shopify
1. בדאשבורד Shopify → **Online Store** → **Themes**.
2. לחץ על **Add theme** → **Connect from GitHub**.
3. אשר את ההרשאות, בחר את הריפו וה-branch (`main`).
4. Shopify יסנכרן את התבנית אוטומטית.

### שלב 3 — צור את המוצר
ב-Shopify אדמין → **Products** → **Add product**:
- **שם:** LumiBrace - צמיד הקרנה
- **Options:**
  - מארז: בודד / זוג
  - צבע: זהב / כסף / מעורב
- **Variants:** צור את כל הקומבינציות עם המחירים הנכונים (229 לבודד, 389 לזוג).
- העלה תמונות לכל variant.

### שלב 4 — חבר דומיין
**Settings** → **Domains** → **Connect existing domain** → הקלד `lumibrace.store`.

### שלב 5 — הפעל את הפיקסל
הפיקסל כבר מוטמע ב-`layout/theme.liquid` (TikTok ID: `D8ALP4RC77UAEKHUFNQ0`).
לקבלת אירועי Purchase, חבר את **TikTok app** ב-Shopify App Store — היא שולחת אירועי רכישה אוטומטית מהצ'קאאוט.

## איך השינויים זורמים
1. עורכים פה ב-Lovable.
2. דוחפים ל-GitHub (Lovable ↔ GitHub אוטומטי).
3. Shopify מסנכרן תוך שניות.

## למה זה פותר את בעיית iOS
- **הצ'קאאוט נטיב של Shopify** — מתוכנן ועובד בכל webview (TikTok, Instagram, Safari iOS).
- אין `window.open` שנחסם.
- ה-JS שלנו (`cart.js`) משתמש ב-`window.location.href` בלבד.

## ידוע ומטופל בעתיד
- העלאת תמונת לקוח נשמרת כעת כ-data URL ב-line item property (עד 60KB). למוצרי פרודקשן כדאי להחליף ל-storage חיצוני (Shopify Files API דרך app, או Supabase).
- בחירת variant מותאמת ל-options "מארז" ו"צבע" — שמור על שמות זהים ב-Shopify אדמין.
