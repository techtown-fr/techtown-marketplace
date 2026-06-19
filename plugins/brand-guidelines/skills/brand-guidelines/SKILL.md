---
name: brand-guidelines
description: TechTown brand and design system guidelines. Use when creating UI components, styling pages, Astro/Vue components, Slidev theming, generating marketing materials, or implementing visual design for TechTown projects. Covers colors, typography, spacing, components, dark mode, and logo usage.
allowed-tools: Read, Write, Edit, Bash
---

# TechTown Brand Guidelines

## Overview

TechTown is a French tech consulting company specializing in Cloud & AI expertise, based in Nantes. The brand identity reflects innovation, technical excellence, and approachability.

## Color Palette

### Primary Colors

| Name             | Hex       | CSS Variable           | Usage                                     |
| ---------------- | --------- | ---------------------- | ----------------------------------------- |
| **Primary Blue** | `#1C62ED` | `--color-primary`      | Primary brand color, CTAs, links, accents |
| **Primary Dark** | `#1557D6` | `--color-primary-dark` | Hover states, emphasis                    |
| **Accent Blue**  | `#3B7EFF` | `--color-accent`       | Secondary highlights                      |
| **White**        | `#FFFFFF` | `--color-background`   | Backgrounds, text on dark                 |
| **Black**        | `#000000` | -                      | Reserved for true black needs             |

### Text Colors

| Name             | Hex       | CSS Variable         | Usage                        |
| ---------------- | --------- | -------------------- | ---------------------------- |
| **Text Primary** | `#1F2937` | `--color-text`       | Body text, headings          |
| **Text Light**   | `#6B7280` | `--color-text-light` | Secondary text, descriptions |
| **Text White**   | `#FFFFFF` | `--color-text-white` | Text on dark backgrounds     |
| **Neutral**      | `#6B7280` | `--color-neutral`    | Muted elements               |

### Background Colors

| Name                | Hex       | CSS Variable                   | Usage                      |
| ------------------- | --------- | ------------------------------ | -------------------------- |
| **Background**      | `#FFFFFF` | `--color-background`           | Main page background       |
| **Background Alt**  | `#F9FAFB` | `--color-background-alt`       | Section backgrounds, cards |
| **Background Dark** | `#1F2937` | `--color-background-alt-black` | Dark sections, footer      |
| **Border**          | `#E5E7EB` | `--color-border`               | Borders, dividers          |

### Dark Mode Palette

| Token | Light | Dark |
| ----- | ----- | ---- |
| `--color-bg` | `#FFFFFF` | `#0F172A` |
| `--color-bg-alt` | `#F9FAFB` | `#1E293B` |
| `--color-text` | `#1F2937` | `#F1F5F9` |
| `--color-text-light` | `#6B7280` | `#94A3B8` |
| `--color-border` | `#E5E7EB` | `#334155` |
| `--color-primary` | `#1C62ED` | `#3B7EFF` |

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #0F172A;
    --color-background-alt: #1E293B;
    --color-text: #F1F5F9;
    --color-text-light: #94A3B8;
    --color-border: #334155;
    --color-primary: #3B7EFF;
  }
}
```

### Special Purpose Colors

#### TechReady Event
| Name | Hex | Variable |
| ---- | --- | -------- |
| Primary | `#667EEA` | `--color-techready-primary` |
| Secondary | `#764BA2` | `--color-techready-secondary` |
| Warning | `#F59E0B` | `--color-techready-warning` |
| Success | `#10B981` | `--color-techready-success` |

## Typography

- **Font**: `Poppins` (sans-serif)
- **Fallback**: System sans-serif

```css
font-family: "Poppins", sans-serif;
```

| Weight | Variable | Usage |
| ------ | -------- | ----- |
| 400 | `--font-weight-normal` | Body |
| 500 | `--font-weight-medium` | Buttons |
| 600 | `--font-weight-semibold` | Subheadings |
| 700 | `--font-weight-bold` | Headings |

| Size | Variable | Value | Usage |
| ---- | -------- | ----- | ----- |
| base | `--font-size-base` | 1rem | Body |
| xl | `--font-size-xl` | 1.25rem | Card titles |
| 3xl | `--font-size-3xl` | 1.875rem | H2 |
| 4xl | `--font-size-4xl` | 2.25rem | H1 |

## Spacing & Layout

| Name | Variable | Value |
| ---- | -------- | ----- |
| sm | `--spacing-sm` | 0.75rem |
| md | `--spacing-md` | 1rem |
| lg | `--spacing-lg` | 1.5rem |
| xl | `--spacing-xl` | 2rem |
| 2xl | `--spacing-2xl` | 3rem |
| 3xl | `--spacing-3xl` | 4rem |

- `--container-max-width`: 1200px
- `--border-radius`: 0.5rem
- `--border-radius-lg`: 1rem
- `--shadow`: `0 1px 3px 0 rgb(0 0 0 / 0.1)`
- `--shadow-lg`: `0 10px 15px -3px rgb(0 0 0 / 0.1)`

## Components

### Buttons

```css
.btn {
  padding: var(--spacing-sm) var(--spacing-lg);
  background-color: var(--color-primary);
  color: white;
  border-radius: var(--border-radius);
  font-weight: var(--font-weight-medium);
  border: 2px solid transparent;
  transition: background-color 0.2s ease;
}
.btn:hover { background-color: var(--color-primary-dark); }

.btn-secondary {
  background-color: transparent;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
}
.btn-secondary:hover { background-color: var(--color-primary); color: white; }
```

### Cards

```css
.card {
  background: white;
  padding: var(--spacing-2xl);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-lg);
  transition: transform 0.2s ease;
}
.card:hover { transform: translateY(-4px); }
```

## Astro Components

### Bouton primaire Astro

```astro
---
interface Props {
  href?: string;
  variant?: 'primary' | 'secondary';
}
const { href, variant = 'primary' } = Astro.props;
---
<a href={href} class={`btn btn-${variant}`}>
  <slot />
</a>

<style>
.btn { /* reprendre le CSS ci-dessus */ }
</style>
```

### Layout avec Google SSO

```astro
---
import { onAuthChange } from '../lib/auth';
---
<html lang="fr">
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
  </head>
  <body>
    <slot />
    <script>
      import { onAuthChange } from '../lib/auth';
      onAuthChange(user => {
        if (!user) window.location.href = '/login';
      });
    </script>
  </body>
</html>
```

## Vue Components

### Bouton TechTown (Vue 3 SFC)

```vue
<template>
  <button :class="['btn', `btn-${variant}`]" @click="$emit('click')">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{ variant?: 'primary' | 'secondary' }>()
defineEmits(['click'])
</script>

<style scoped>
.btn { /* reprendre le CSS ci-dessus */ }
</style>
```

## Slidev Theming

Dans `style.css` du projet Slidev :

```css
:root {
  --slidev-theme-primary: #1C62ED;
  --slidev-theme-primary-dark: #1557D6;
  --slidev-font-family: 'Poppins', sans-serif;
}

.slidev-layout h1 { color: var(--slidev-theme-primary); }
.slidev-layout .cover h1 { font-size: 3rem; font-weight: 700; }
```

## Logo

| Fichier | Format | Usage |
| ------- | ------ | ----- |
| `techtown-logo.svg` | SVG | Logo principal (préféré) |
| `techtown-logo-square.svg` | SVG | Icône carrée |
| `techtown-logo.png` | PNG | Fallback raster |
| `techtown-meta-og.png` | PNG | Open Graph / social |

```html
<img src="/techtown-logo.svg" alt="TechTown" width="167" height="30" />
```

## Texture bruit

```css
--texture-noise-light: url(/noise-light.png);
background: var(--texture-noise-light) var(--color-primary);
```

## Breakpoints

```css
@media (max-width: 768px) {
  .container { padding: 0 var(--spacing-md); }
  .section { padding: var(--spacing-2xl) 0 var(--spacing-md); }
}
```

## Grille

```css
.grid-2 { display: grid; gap: var(--spacing-xl); grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
.grid-3 { display: grid; gap: var(--spacing-xl); grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); }
```

## Best Practices

1. Toujours utiliser les variables CSS, jamais de valeurs en dur
2. Contraste WCAG AA minimum
3. `#1C62ED` réservé aux éléments interactifs et à la marque
4. Transitions `0.2–0.3s ease` sur les hover states
5. Dark mode via `prefers-color-scheme` en priorité sur le toggle manuel
