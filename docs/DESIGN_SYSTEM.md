# Antigravity Design System: 90s Newsprint & Comic Strip Edition

**Version:** 1.0.0  
**Target Engine:** Astro 7.x + Tailwind CSS v4  
**Aesthetic Core:** Vintage "Love is..." collectible comics + 1990s anime cel shading + investigative newsprint dossier.

---

## 1. Core Principles

- **Analog Paper Metaphor:** Никаких темных SaaS/киберпанк заливок (`#020617`). Интерфейс имитирует физическую печать: матовую газетную бумагу, чернильные контуры и плашечные штампы.
- **Rigid Ink Contours:** Все интерактивные блоки и карточки имеют жесткую черную тушевую обводку толщиной 2px без градиентных рамок.
- **Brutal Offset Shadows:** Вместо мягкого рассеянного свечения (`blur`) применяются жесткие смещенные тени со 100% непрозрачностью.
- **Content Storytelling ("Love is..."):** Каждый материал маркируется эпиграфом-вкладышем вида _"Safety is... [micro-rule]"_.

---

## 2. Color Tokens

### 2.1 Base Surfaces & Ink

| Token Name               | HEX Code  | Tailwind Utility                     | Functional Role                                |
| :----------------------- | :-------- | :----------------------------------- | :--------------------------------------------- |
| `--color-canvas`         | `#FBF8F1` | `bg-[#FBF8F1]`                       | Основной фон всего сайта (неотбеленная бумага) |
| `--color-surface`        | `#FFFFFF` | `bg-white`                           | Карточки постов, модальные окна, панели квизов |
| `--color-surface-subtle` | `#F4EFE6` | `bg-[#F4EFE6]`                       | Фоллбэк-карточки без обложки, блоки цитат      |
| `--color-ink-solid`      | `#0F172A` | `border-slate-900`, `text-slate-900` | Контуры 2px, заголовки, жесткие тени           |
| `--color-ink-muted`      | `#475569` | `text-slate-600`                     | Метаданные, даты, вторичный описательный текст |

### 2.2 Editorial & Brand Accents

| Token Name              | HEX Code  | Tailwind Utility                     | Functional Role                              |
| :---------------------- | :-------- | :----------------------------------- | :------------------------------------------- |
| `--color-brand-red`     | `#E11D48` | `bg-rose-600`, `text-rose-600`       | Главный акцент «Love is...», критические CTA |
| `--color-retro-cobalt`  | `#0284C7` | `bg-sky-600`, `text-sky-600`         | Проверенные бейджи, ссылки, технические теги |
| `--color-stamp-amber`   | `#D97706` | `bg-amber-100`, `text-amber-800`     | Штампы расследований, бейджи риска           |
| `--color-stamp-emerald` | `#059669` | `bg-emerald-100`, `text-emerald-800` | Статус «Verified Human», зеленые чекпоинты   |

---

## 3. Elevation, Borders & Geometry

- **Border Standard:**
  - Карточки и модалы: `border-2 border-slate-900`
  - Штампы и микро-кнопки: `border border-slate-900`
- **Hard Shadow Standard:**
  - Карточка по умолчанию: `shadow-[4px_4px_0px_0px_#0f172a]`
  - Кнопки CTA / Интерактив: `shadow-[3px_3px_0px_0px_#0f172a]`
  - Hover-состояние: `hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_#0f172a]`
  - Active (нажатие): `active:translate-x-1 active:translate-y-1 active:shadow-none`
- **Border Radius:**
  - Карточки и модалы: `rounded-xl` (12px)
  - Кнопки и штампы: `rounded-lg` (8px)
  - Запрещены: овальные `rounded-full` для базовых карточек.

---

## 4. Typography Hierarchy

- **Site Header & Main H1:**
  - Начертание: Heavy Sans-serif Display (`font-black tracking-tight text-slate-900 uppercase`).
- **"Love is..." Signature Hook:**
  - Начертание: Винтажный курсив с засечками (`font-serif italic font-semibold text-rose-600 text-sm md:text-base`).
  - Пример: _"Safety is... verifying their photo before sending your private phone number."_
- **Post Titles (Cards & Headers):**
  - Начертание: `font-extrabold text-slate-900 text-lg md:text-xl leading-snug`.
- **Body Text:**
  - Начертание: `font-normal text-slate-800 leading-relaxed text-[15px]`.

---

## 5. Component Patterns

### 5.1 Post Card Specification (`PostCard.astro`)

```html
<article
  class="flex flex-col bg-white border-2 border-slate-900 rounded-xl shadow-[4px_4px_0px_0px_#0f172a] overflow-hidden transition-all duration-150 hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#0f172a]"
>
  <!-- Image Frame or Fallback Panel -->
  <div
    class="aspect-[16/9] w-full border-b-2 border-slate-900 bg-[#F4EFE6] overflow-hidden relative"
  >
    <!-- If cover exists: rendered as webp -->
    <!-- If fallback: retro newsprint halftone with dossier stamp -->
  </div>

  <div class="p-4 flex flex-col flex-1">
    <!-- Stamp Category Badge -->
    <div class="flex items-center gap-2 mb-2">
      <span
        class="border border-slate-900 bg-amber-100 text-slate-900 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded"
      >
        Investigation
      </span>
      <span class="text-xs font-mono text-slate-500">2026-09-16</span>
    </div>

    <!-- Title -->
    <h3
      class="font-black text-slate-900 text-base leading-snug line-clamp-2 hover:text-rose-600 transition-colors"
    >
      Title goes here
    </h3>
  </div>
</article>
```
