---
name: Conta
description: A living caderneta for everyday spending, with the WebView bridge as a paper trail.
colors:
  cool-canvas: "oklch(0.958 0.008 248)"
  paper-white: "oklch(0.991 0.003 248)"
  paper-deep: "oklch(0.93 0.009 248)"
  ink-blue: "oklch(0.235 0.043 256)"
  ink-soft: "oklch(0.33 0.036 256)"
  stamp-red: "oklch(0.545 0.19 27)"
  ledger-green: "oklch(0.46 0.1 158)"
  rule: "oklch(0.855 0.008 248)"
  muted-ink: "oklch(0.43 0.022 256)"
typography:
  display:
    fontFamily: "Geist Mono Variable, monospace"
    fontSize: "clamp(3rem, 9vw, 5.25rem)"
    fontWeight: 500
    lineHeight: 0.95
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Geist Variable, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Geist Mono Variable, monospace"
    fontSize: "0.7rem"
    fontWeight: 550
    lineHeight: 1
    letterSpacing: "0.14em"
  data:
    fontFamily: "Geist Mono Variable, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0"
rounded:
  xs: "4px"
  sm: "7.2px"
  md: "9.6px"
  lg: "12px"
  xl: "16.2px"
  full: "999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "20px"
  xl: "24px"
  2xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink-blue}"
    textColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  button-outline:
    backgroundColor: "{colors.cool-canvas}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.lg}"
    padding: "0 10px"
    height: "32px"
  paper-sheet:
    backgroundColor: "{colors.paper-white}"
    rounded: "{rounded.lg}"
    padding: "20px"
  ledger-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink-blue}"
    padding: "14px 0"
  quick-action:
    backgroundColor: "{colors.paper-deep}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.lg}"
    padding: "12px"
    height: "84px"
  nav-active:
    backgroundColor: "{colors.paper-white}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.xl}"
    padding: "0 12px"
    height: "44px"
  status-pill:
    backgroundColor: "transparent"
    textColor: "{colors.muted-ink}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  demo-stamp:
    backgroundColor: "transparent"
    textColor: "{colors.stamp-red}"
    rounded: "{rounded.xs}"
    padding: "4.5px 8.8px"
  text-field:
    backgroundColor: "{colors.cool-canvas}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.lg}"
    padding: "10px 12px"
    height: "96px"
---

# Design System: Conta

## Overview

**Creative North Star: "The Living Caderneta"**

Conta should feel like a paper account book that happens to run on a phone: a deep ink-blue cover, cool paper pages, a ruled margin, and a red stamp used only when the ledger needs to say something official. The product is ordinary daily finance first, and a bridge demonstration second. Density is calm, numbers are large, and the interface keeps the texture of ruled paper without turning stationery into decoration.

The system refuses the generic bank-dashboard grid. Related financial content lives on one continuous sheet, separated by fine rules and internal dividers; tool panels are organized by weight and purpose rather than equal cards. The caderneta is legible from a thumb's distance, honest about demo and native states, and technical detail stays one layer away.

Motion is restrained and physical: one route entrance, a stamp that lands, ledger rows that settle, bars that grow, and an activity detail that unfolds. Nothing loops, floats, or competes with the numbers.

**Key Characteristics:**
- Cool-paper ground with a deep ink-blue cover and a single red stamp accent.
- Continuous sheets, ruled dividers, and a ruled ledger margin instead of card grids.
- Monumental tabular money, quiet metadata, and a compact Geist/Geist Mono pairing.
- One authored motion moment per state, with reduced-motion support throughout.

## Colors

The palette is a cool clerical blue-green world: blue-grey paper, near-black ink, red stamp ink, and green for money coming in.

### Primary
- **Ink Blue** (`oklch(0.235 0.043 256)`): the cover, primary buttons, hero surface, and the strongest text. It carries authority without reading black.
- **Stamp Red** (`oklch(0.545 0.19 27)`): the rotated demo stamp, active navigation marks, focus energy, and error emphasis. It is ink, not a fill color.
- **Ledger Green** (`oklch(0.46 0.1 158)`): income, positive progress, live status, and successful bridge outcomes.

### Neutral
- **Cool Canvas** (`oklch(0.958 0.008 248)`): the page ground and the ambient field behind paper.
- **Paper White** (`oklch(0.991 0.003 248)`): every sheet, ledger page, and detail panel.
- **Paper Deep** (`oklch(0.93 0.009 248)`): quick-action tiles, secondary fills, and quiet inset blocks.
- **Rule** (`oklch(0.855 0.008 248)`): hairlines, dividers, and control borders.
- **Muted Ink** (`oklch(0.43 0.022 256)`): metadata, secondary labels, and supporting copy.

### Named Rules
**The Cool Ground Rule.** Canvas, paper, and rules stay at hue 248. Warm cream, ivory, and sepia grounds are outside this world.

**The Stamp Rarity Rule.** Stamp red is reserved for the demo stamp, destructive/error moments, selected navigation icons, and live marks. It should never become a general-purpose fill or decorative wash.

**The One Ledger Rule.** Related financial content shares one paper sheet and is separated by rules. Do not explode one statement into a grid of independent cards.

## Typography

**Display Font:** Geist Mono Variable (with monospace fallback)
**Body Font:** Geist Variable (with sans-serif fallback)
**Label/Mono Font:** Geist Mono Variable

**Character:** Geist is the workhorse voice: compact, neutral, and familiar. Geist Mono is the ledger voice: tabular, exact, and slightly clerical. The pairing should read as a modern passbook, not a developer console.

### Hierarchy
- **Display** (500, `clamp(3rem, 9vw, 5.25rem)`, 0.95): the balance figure only. It is the monument of the first viewport.
- **Headline** (600, 1.875rem, 1.15): page titles, rising to 2.25rem on wider screens.
- **Title** (600, 1.125rem, 1.3): sheet headings such as "Resolva em um toque" and "Últimos lançamentos".
- **Body** (400, 0.875rem, 1.5): descriptions and supporting copy. Keep reading lines near 52ch on wide screens.
- **Label** (550, 0.7rem, 0.14em, uppercase): metadata, protocol names, timestamps, and status. Never smaller than 0.7rem.
- **Data** (500, 0.875rem, 1.25): amounts, running balances, category values, and protocol payloads.

### Named Rules
**The Tabular Money Rule.** Every monetary figure uses Geist Mono with tabular numerals. The running balance lives in the ledger margin, never as a secondary sentence.

**The Quiet Metadata Rule.** Metadata is small, spaced, and uppercase, but it never drops below 0.7rem. If a label needs to be smaller to fit, the content is too dense.

## Layout

Mobile is a single column from 320px upward: 16px page gutters, 20px vertical rhythm, and a 64px bottom navigation bar with safe-area padding. Desktop opens a 264px ink rail and a content column capped at 1280px with 40px gutters.

Related content uses 12-column grids inside continuous sheets. On Início, the hero spans the full width; the goal occupies 4 columns, shortcuts 8, and categories the full row. The ledger and activity stack in one full-width sheet so the ledger never leaves a side-column void. On Ferramentas, camera takes 8 columns, location 4, and the six remaining tools form a two-column sheet. On Atividade, the log and detail split 1.15fr/0.85fr on desktop and collapse to one column on mobile.

The first viewport should show the brand, the month, the balance monument, and the beginning of the ruled ledger. Avoid dashboard symmetry: when two blocks are not equally important, give them unequal spans and unequal heights.

## Elevation & Depth

Depth is paper lift, not card chrome. Every paper surface carries the same soft ambient shadow and no border. The ink hero is a flat cover mass rather than a lifted card; its only depth cue is the perforated binding line at the left edge. The brand mark gets a small local lift against the rail.

### Shadow Vocabulary
- **Paper Sheet** (`box-shadow: 0 1px 0 oklch(1 0 0 / 0.72) inset, 0 1px 2px oklch(0.22 0.03 250 / 0.06), 0 18px 42px -30px oklch(0.22 0.03 250 / 0.38)`): any continuous paper surface.
- **Brand Lift** (`box-shadow: 0 8px 18px -12px oklch(0.12 0.02 256 / 0.9)`): the small brand mark on the ink rail.
- **Ledger Node** (`box-shadow: 0 0 0 1px oklch(0.545 0.19 27 / 0.55)`): the small red node on the ruled margin; a mark, not an elevation.

### Named Rules
**The Border-or-Shadow Rule.** A paper surface gets the soft shadow and no border. Do not pair a 1px border with the paper shadow; that recreates the ghost-card look the world refuses.

## Shapes

Paper sheets are gently squared at 12px. Controls sit at 8–10px, quick-action tiles at 12px, and the desktop rail selection at 16px. Pills and progress tracks are fully round; the stamp is a small 4px rectangle rotated −6°.

Hairlines are 1px at roughly 8–10% ink. There are no heavy outlines, hard offset shadows, or bubbly geometry. The form language is stationery: ruled lines, clipped pages, stamped marks, and a bound vertical margin.

## Components

### Buttons
- **Shape:** 12px radius, 32px default height, 28px small.
- **Primary:** ink-blue background, paper-white text, 14px medium Geist, 10px horizontal padding.
- **Outline:** cool-canvas background, rule border, ink text; hover moves to paper-deep.
- **Ghost:** transparent until hover, then paper-deep. Used for "Ver tudo", "Abrir", and "Limpar".
- **Hover / Focus:** 160ms color transition; focus uses a 3px ring at 50% opacity; active translates down 1px.

### Quick Actions
- **Shape:** 12px radius, 84px minimum height, 12px padding.
- **Default:** paper-deep fill with ink text.
- **Primary:** ink-blue fill with paper-white text, used once per group for the leading action.
- **Behavior:** icon top-left, label and mono detail bottom-left; press scales to 0.985.

### Paper Sheets
- **Corner Style:** 12px.
- **Background:** paper-white on cool canvas.
- **Shadow Strategy:** Paper Sheet only; never a border.
- **Internal Padding:** 20px on mobile, 24px on roomy panels.
- **Division:** 1px rules at 8% ink; one sheet can hold multiple named sections.

### Ledger Rows
- **Style:** three-column grid: 17.6px margin rail, flexible description, right-aligned amount.
- **Margin:** a 1px red rule with a 5px paper node at the vertical center of each row.
- **Data:** merchant at 13px medium; detail and time in 11–12px mono; amount and running balance in tabular mono.
- **Motion:** rows settle in with a 35ms stagger and 360ms ease-out; reduced motion removes the stagger.

### Activity Rows
- **Style:** 32px tonal icon tile, title, direction pill, detail, protocol code, and time.
- **State:** selected row gets a 4% ink wash; the detail unfolds at 220ms.
- **Density:** two-up on tablet and desktop for short previews; the activity page keeps a single log column so detail can sit beside it.

### Navigation
- **Desktop rail:** 44px rows, 16px radius, selected item is paper-white with ink text on the ink rail.
- **Mobile bottom bar:** 64px, three equal tabs, 20px icons, 11px labels, 2px stamp indicator that slides between tabs.
- **State:** selected icon uses stamp red; inactive items stay at 65% paper on the rail and muted ink on paper.

### Inputs / Fields
- **Style:** 12px radius, 1px rule border, canvas at 60% fill, 12px padding.
- **Focus:** border shifts to the ring color with a 3px translucent ring.
- **Behavior:** caret and selection use stamp red; text areas keep a comfortable 96px minimum height.

### Signature: The Running Margin
The transaction margin is the world's signature move. A continuous red rule runs through the ledger, each row gets a small paper node, and the running balance sits at the right edge in tabular mono. It makes a list of expenses read as a passbook page rather than a feed.

## Do's and Don'ts

### Do:
- **Do** keep related money content on one continuous paper sheet with internal rules.
- **Do** put every amount in Geist Mono tabular and keep the running balance in the ledger margin.
- **Do** keep metadata at 0.7rem or larger.
- **Do** use unequal spans and heights when two blocks have unequal importance.
- **Do** use the stamp red sparingly and keep the rotate at −6°.
- **Do** respect `prefers-reduced-motion` and keep content visible without animation.

### Don't:
- **Don't** build a generic bank-dashboard card grid or give every tool an equal panel.
- **Don't** pair a 1px border with the paper shadow.
- **Don't** use warm cream, ivory, or sepia grounds; the page stays at hue 248.
- **Don't** place kickers or eyebrows above headings.
- **Don't** use hard offset shadows, heavy outlines, or bubbly radii.
- **Don't** use the stamp red as a general fill, gradient, or decorative wash.
