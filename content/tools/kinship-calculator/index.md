---
title: "Kinship Term Calculator"
subtitle: "Build a genealogy path; compute the correct kin term across complex terminologies"
number: 16
group: "Linguistics"
summary: "Walk a genealogy tree from ego to any blood relative; the path is resolved to a canonical kin relation (side, cross/parallel, degree, removal, Korean chon) and the correct term is composed or looked up in fifteen languages and structural systems, with romanization, Wiktionary links, and caveats."
status: "beta"
slug: "kinship-calculator"
references:
  - "Passmore, S., et al. (2023). Kinbank: A global database of kinship terminology. *PLOS ONE*, 18(5), e0283218."
  - "Qian, L. *Chinese Kinship Semantic Structure and an Annotation Scheme*. UCREL / CL2007."
  - "Sidnell, J. (2013). Kinship and personal reference in Vietnamese interaction. *Journal of the Royal Anthropological Institute*."
  - "Suryanarayan, N. (2021). Kinship terms in Hindi and Syrian Arabic. *Russian Journal of Linguistics*."
  - "*L'Homme* (article on Dravidian kinship and cross-cousin marriage structure)."
  - "Blythe, J., et al. *Trirelational kin terms in Murrinhpatha* (Max Planck Institute)."
---

Many languages encode distinctions in kinship that English collapses into a
single word. "Uncle" alone hides at least four contrasts — father's brother
versus mother's brother, and elder versus younger — that Mandarin (伯 / 叔 /
舅), Hindi (ताऊ / चाचा / मामा), and Turkish (amca / dayı) keep apart. This
tool makes those distinctions computable.

**How it works.** The tool opens on a ready-made family tree, five
generations deep, centred on *you* (ego). Click any relative and the panel
resolves that person to a kin relation and shows the term; grow the tree by
selecting a person and adding a parent, sibling, or child along the valid
directions. Three interchangeable views — a **pedigree chart**, an **indented
outline**, and an **ancestor fan** — render the same tree. Every person within
the tree carries a term in the chosen language; the language picker is a
neutral lookup, so any of the fifteen systems can be the main display, none
privileged. Internally each person is still a path from ego upward to a common
ancestor, across at most one sibling link, then back down. The path is reduced
to a canonical relation — its *side*
(paternal / maternal), *cross* versus *parallel* status (whether the linking
siblings are the same sex), generation *offset*, cousin *degree*, and
*removal*. Two genuinely computed quantities fall out of the path length: the
canon-law cousin degree, and the **Korean chon** (촌) count, the number of
parent–child links between the two people — 사촌 (4) for a first cousin, 육촌
(6) for a second.

**Composed, not just looked up.** For the *transparent* terminologies the
term is generated from the resolved variables rather than stored: Sinitic
cousins as a line prefix plus a sibling suffix (堂 + 哥/弟/姐/妹), Arabic
cousins as *ibn / bint al-ʿamm* and the like, and the Korean chon word
straight from the path. The rest are drawn from the comparative chart, with
the structural systems (Iroquoian, Crow, Omaha, Murrinhpatha) shown as a
*classification* — how the relation is grouped — rather than a false
single-word equivalent.

**Caveats are first-class.** Where a term is not universal, the tool surfaces
an N.B.: that Japanese 伯/叔 marks elder-versus-younger and not the side of
the family; that Vietnamese *bác* is side-neutral for a parent's elder
sibling; that a Dravidian parallel cousin is classed with siblings while a
cross cousin is a distinct, marriageable category. Romanization follows one
named scheme per language, each term links out to Wiktionary, and the whole
query is encoded in the page URL — so a relationship is a shareable link, a
copyable code, a downloadable tree or card image, or a printable per-language
reference sheet.
