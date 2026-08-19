// ── Uli motif system ─────────────────────────────────────────────────────
// 14 motifs. All CSS-animated (globals.css) — never framer-motion, because
// ornament must not cost JS on a metered mobile connection (CLAUDE.md §3.4, §9).
//
// Colour convention: strokes inherit `currentColor` — terracotta on light,
// sand on dark. Dots are always ochre.
//
// Ornament never competes with a bid amount, a price, or the verified badge.

// Primary flourishes (§3.3.1)
export { default as Omumu }   from './Omumu'    // growth, rising tendril — hero left
export { default as Eke }     from './Eke'      // python, double sweep — hero right
export { default as Akwukwo } from './Akwukwo'  // leaf spray — empty states
export { default as Nku }     from './Nku'      // corner flourish — section edges
export { default as Odu }     from './Odu'      // tusk curve — hero accent
export { default as Nnyo }    from './Nnyo'     // mirror spiral — avatar frames

// Structural (§3.3.2)
export { default as Ntupo }   from './Ntupo'    // dot-and-curl divider
export { default as Mbubu }   from './Mbubu'    // scarification band — header/footer rule

// Functional (§3.3.3)
export { default as Agwo }    from './Agwo'     // the coil — THE loading spinner
export { default as Isi }     from './Isi'      // the knot — hired / match confirmed
export { default as Onuuzo }  from './Onuuzo'   // threshold — empty states

// Emblematic (§3.3.4)
export { default as Ugo }     from './Ugo'      // eagle feather — top-rated provider
export { default as Osisi }   from './Osisi'    // the tree — stats and growth
export { default as Anyanwu } from './Anyanwu'  // the sun — onboarding / new
