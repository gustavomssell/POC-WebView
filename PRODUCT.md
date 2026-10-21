# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Developers and stakeholders evaluating the Expo + React Native WebView bridge, usually on a phone and in short demo sessions. The interface is framed as **Conta**, a personal-finance app for everyday expenses, so the bridge can be judged inside a believable consumer product rather than a button laboratory.

## Product Purpose

Prove that a Vite web app inside a React Native WebView can exchange versioned JSON messages with the native host and invoke real device capabilities. Success means every action is understandable, testable in one tap, and visibly accounted for in an activity feed.

## Positioning

The bridge is demonstrated through a normal daily-finance flow: receipt photo, current location, notes, copy, haptics, and native UI actions are part of the product surface, not isolated developer controls. The same surface still exposes raw protocol details when expanded.

## Operating Context

- Expo host at the repository root; the web app lives in `web/` and is embedded as a single offline HTML bundle.
- Mobile-first usage at phone widths, with a desktop layout for development and review.
- Browser fallback uses mocks so the experience can be evaluated without a native device.
- No account, backend, authentication, or real financial data exists; all entries are synthetic demonstration content.

## Capabilities and Constraints

- Native requests: `device.info`, `camera.takePhoto`, `location.current`, `haptics.impact`, `clipboard.write`, `clipboard.read`, `native.echo`, `native.counter`, `ui.alert`, `link.open`.
- Native events: `native.ping`, `native.counter.changed`, `native.log`; web events: `web.ready`, `web.hello`.
- Camera and location require permissions on native platforms; the browser substitutes mocks.
- The activity feed must preserve the raw protocol payload on demand.
- Keep the existing protocol, action names, and native host behavior intact.
- Financial amounts and merchants are illustrative only and must never read as real user data.

## Brand Commitments

- Product name: **Conta**.
- Brazilian Portuguese interface.
- The experience should feel like an ordinary personal-finance app used in daily life, not a developer dashboard.
- The technical bridge remains inspectable and honest about mock/native state.

## Evidence on Hand

- Synthetic expense entries, balances, and merchant names authored for the demo.
- Existing bridge actions, mocks, and activity data in the repository.
- No real bank connection, customer data, testimonials, or financial claims exist.

## Product Principles

1. A familiar daily-finance surface first, bridge proof second.
2. Every native capability must earn a real place in the flow.
3. Show system state honestly: native, mock, loading, empty, error, and permission outcomes.
4. Keep inspection one layer away, not in the main reading path.
5. Design for thumbs, quick glances, and one-handed use.

## Accessibility & Inclusion

- Touch targets and controls must remain usable at phone widths.
- Text and status colors must meet readable contrast.
- Motion must respect `prefers-reduced-motion` and never hide content by default.
