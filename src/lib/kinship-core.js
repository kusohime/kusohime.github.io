/**
 * Kinship calculator core: a pure path resolver. Everything here is
 * DOM-free and side-effect-free so the renderers and the composer can reuse
 * it. The input is a genealogy PATH built from primitive links; the output is
 * a canonical relation ID plus the expansion variables (side, cross/parallel,
 * relative sex, relative age, generation, degree, removal, Korean chon) that
 * select or build the actual term in kinship-data.js / kinship-compose.js.
 *
 * Path model
 * ----------
 * A path is an ordered array of primitive steps from ego to the target:
 *   F  father   M  mother
 *   B  brother  Z  sister      (optionally tagged elder/younger)
 *   S  son      D  daughter
 *   H  husband  W  wife        (affinal; flagged, out of scope for v1 terms)
 *
 * A blood relative is reached by going UP to a common ancestor, taking at
 * most one SIBLING step, then coming DOWN. The resolver enforces that shape
 * (ups · [sibling] · downs); anything else is reported as out of scope.
 *
 * Steps may carry an `age` of "elder" | "younger" (sibling seniority vs the
 * person it attaches to) and the target's age vs ego is tracked separately.
 */

/** Sex implied by a primitive link. */
const SEX = { F: "M", M: "F", B: "M", Z: "F", S: "M", D: "F", H: "M", W: "F" };
const UP = new Set(["F", "M"]);
const DOWN = new Set(["S", "D"]);
const SIB = new Set(["B", "Z"]);
const SPOUSE = new Set(["H", "W"]);

/** A primitive step. `kind` is one of F/M/B/Z/S/D/H/W. */
export function step(kind, age = null) {
  return { kind, age };
}

export function emptyQuery() {
  return {
    path: [],          // array of {kind, age}
    egoSex: "F",       // speaker gender, used by some systems (e.g. Korean)
    egoElder: null,    // is the target older than ego? (true/false/null)
    language: "zh",
    roman: true,       // show romanization
  };
}

/* ----------------------------------------------------------------------- *
 * Resolver
 * ----------------------------------------------------------------------- */

/**
 * Reduce a path to a canonical relation.
 * @returns {{
 *   ok: boolean, relationId: string|null, reason?: string,
 *   lineal: boolean, side: "paternal"|"maternal"|"mixed"|null,
 *   crossParallel: "parallel"|"cross"|null,
 *   relativeSex: "M"|"F"|null, genOffset: number,
 *   degree: number, removal: number, direction: "up"|"down"|"level",
 *   chon: number|null, siblingElder: boolean|null,
 *   pathSig: string
 * }}
 */
export function resolve(query) {
  const path = query.path || [];
  const sig = path.map((s) => (s.age ? s.age[0] : "") + s.kind).join("");
  const base = {
    ok: false, relationId: null, lineal: false, side: null,
    crossParallel: null, relativeSex: null, genOffset: 0,
    degree: 0, removal: 0, direction: "level", chon: null,
    siblingElder: null, pathSig: sig,
    egoElder: query.egoElder ?? null, egoSex: query.egoSex ?? "F",
  };

  if (path.length === 0) {
    return { ...base, ok: true, relationId: "SELF", relativeSex: query.egoSex };
  }
  if (path.some((s) => SPOUSE.has(s.kind))) {
    return { ...base, reason: "affinal" };
  }

  // Partition into ups · [one sibling] · downs.
  let i = 0;
  const ups = [];
  while (i < path.length && UP.has(path[i].kind)) ups.push(path[i++]);
  let sib = null;
  if (i < path.length && SIB.has(path[i].kind)) sib = path[i++];
  const downs = [];
  while (i < path.length && DOWN.has(path[i].kind)) downs.push(path[i++]);
  if (i !== path.length) {
    return { ...base, reason: "shape" }; // e.g. a sibling after a descent
  }

  const terminal = path[path.length - 1];
  const relativeSex = SEX[terminal.kind];
  const genOffset = ups.length - downs.length;
  const side =
    ups.length === 0 ? null : ups[0].kind === "F" ? "paternal" : "maternal";
  const mixedSide =
    ups.length > 1 && ups.some((s) => s.kind !== ups[0].kind);

  // ---- Lineal (no sibling step) ----
  if (!sib) {
    const direction = genOffset > 0 ? "up" : genOffset < 0 ? "down" : "level";
    let relationId = null;
    if (ups.length === 1) relationId = ups[0].kind === "F" ? "FATHER" : "MOTHER";
    else if (ups.length === 2) {
      relationId = (ups[1].kind === "F" ? "GRANDFATHER" : "GRANDMOTHER") +
        (side === "paternal" ? "_PAT" : "_MAT");
    } else if (ups.length === 3) relationId = "GREAT_GRANDPARENT";
    else if (ups.length > 3) relationId = "ANCESTOR_TEMPLATE";
    else if (downs.length === 1) relationId = terminal.kind === "S" ? "SON" : "DAUGHTER";
    else if (downs.length === 2) relationId = "GRANDCHILD";
    else if (downs.length === 3) relationId = "GREAT_GRANDCHILD";
    else relationId = "DESCENDANT_TEMPLATE";
    return {
      ...base, ok: true, relationId, lineal: true, side, relativeSex,
      genOffset, direction, removal: Math.abs(genOffset),
    };
  }

  // ---- Collateral (one sibling step) ----
  const egoDepth = ups.length + 1;   // generations from common ancestor
  const relDepth = downs.length + 1;
  const degree = Math.min(egoDepth, relDepth) - 1;
  const removal = Math.abs(egoDepth - relDepth);
  const chon = ups.length + downs.length + 2;
  const direction = egoDepth > relDepth ? "down" : egoDepth < relDepth ? "up" : "level";

  // cross vs parallel at the sibling junction: compare the sibling's sex to
  // the parent it splits from (the up-step directly above it).
  const parentAbove = ups.length ? ups[ups.length - 1].kind : null;
  const crossParallel = ups.length === 0
    ? null
    : SEX[sib.kind] === SEX[parentAbove] ? "parallel" : "cross";
  const siblingElder = sib.age === "elder" ? true : sib.age === "younger" ? false : null;
  const resolvedSide = mixedSide ? "mixed" : side;

  let relationId = null;
  if (degree === 0) {
    // sibling of someone in the direct line
    if (egoDepth === 1 && relDepth === 1) relationId = terminal.kind === "B" ? "BROTHER" : "SISTER";
    else if (egoDepth === 1 && relDepth === 2) relationId = "NIBLING";        // B+S
    else if (egoDepth === 2 && relDepth === 1) {
      relationId = side === "paternal" ? "PARENT_SIBLING_PAT" : "PARENT_SIBLING_MAT";
    } else if (egoDepth >= 3 && relDepth === 1) relationId = "GRANDPARENT_SIBLING_TEMPLATE";
    else relationId = "DISTANT_TEMPLATE";
  } else if (degree === 1 && removal === 0) {
    // first cousin: side + cross/parallel
    if (side === "paternal") relationId = crossParallel === "parallel" ? "1C_PAT_PARALLEL" : "1C_PAT_CROSS";
    else relationId = crossParallel === "cross" ? "1C_MAT_CROSS" : "1C_MAT_PARALLEL";
  } else if (degree === 1 && removal === 1) {
    relationId = direction === "up" ? "1C1R_UP" : "1C1R_DOWN";
  } else if (degree === 2 && removal === 0) {
    relationId = side === "paternal" && crossParallel === "parallel"
      ? "2C_PAT_AGNATIC" : "2C_NONAGNATIC";
  } else if (degree === 2 && removal === 1) {
    relationId = "2C1R_TEMPLATE";
  } else {
    relationId = "DISTANT_TEMPLATE";
  }

  return {
    ...base, ok: true, relationId, lineal: false, side: resolvedSide,
    crossParallel, relativeSex, genOffset, degree, removal, direction,
    chon, siblingElder,
  };
}

/** Korean Sino-Korean numeral word for the chon count (collaterals). */
const SINO = ["영", "일", "이", "삼", "사", "오", "육", "칠", "팔", "구", "십"];
const SINO_R = ["yeong", "il", "i", "sam", "sa", "o", "yuk", "chil", "pal", "gu", "sip"];
export function chonLabel(n) {
  if (n == null) return null;
  const num = n <= 10 ? SINO[n] : String(n);
  const numR = n <= 10 ? SINO_R[n] : String(n);
  return { hangul: `${num}촌`, roman: `${numR}-chon`, n };
}

/** "first cousin twice removed", etc., for the relation chips. */
export function degreePhrase(r) {
  if (r.lineal) {
    const g = Math.abs(r.genOffset);
    if (r.genOffset === 0) return "self";
    const word = ["", "parent", "grandparent", "great-grandparent"][g] ||
      `${"great-".repeat(g - 2)}grandparent`;
    return r.genOffset > 0 ? word : word.replace("parent", "child").replace("grand", "grand");
  }
  if (r.degree === 0) {
    if (r.relationId === "BROTHER" || r.relationId === "SISTER") return "sibling";
    if (r.relationId === "NIBLING") return "nephew / niece";
    if (r.relationId && r.relationId.startsWith("PARENT_SIBLING")) return "aunt / uncle";
    return "collateral";
  }
  const ord = ["", "first", "second", "third", "fourth", "fifth"][r.degree] || `${r.degree}th`;
  let s = `${ord} cousin`;
  if (r.removal === 1) s += " once removed";
  else if (r.removal === 2) s += " twice removed";
  else if (r.removal > 2) s += ` ${r.removal}× removed`;
  return s;
}

/* ----------------------------------------------------------------------- *
 * Serialisation (share links / import-export codes)
 * ----------------------------------------------------------------------- */

export function serialize(q) {
  return JSON.stringify({
    p: q.path.map((s) => (s.age ? s.age[0] : "") + s.kind),
    g: q.egoSex,
    e: q.egoElder,
    l: q.language,
    r: q.roman ? 1 : 0,
  });
}

const AGE = { e: "elder", y: "younger" };
export function deserialize(json) {
  const o = typeof json === "string" ? JSON.parse(json) : json;
  const q = emptyQuery();
  if (Array.isArray(o.p)) {
    q.path = o.p.map((tok) => {
      const m = /^([ey]?)([FMBZSDHW])$/.exec(tok);
      return m ? step(m[2], AGE[m[1]] || null) : null;
    }).filter(Boolean);
  }
  if (o.g === "M" || o.g === "F") q.egoSex = o.g;
  if (o.e === true || o.e === false) q.egoElder = o.e;
  if (typeof o.l === "string") q.language = o.l;
  q.roman = o.r !== 0;
  return q;
}

/* ----------------------------------------------------------------------- *
 * Tree helpers
 *
 * The interactive family tree is a set of node PATHS (each an array of
 * primitive steps from ego). A node's construction parent is simply its
 * path with the last step removed, so the whole set forms a tree rooted at
 * ego. Genealogical connectors (who-is-whose-parent) are derived separately
 * via parentPaths(), which honours the up·[sibling]·down grammar.
 * ----------------------------------------------------------------------- */

/** Stable signature for a path; ego (empty path) is "EGO". */
export function sigOf(path) {
  return (path || []).map((s) => (s.age ? s.age[0] : "") + s.kind).join("") || "EGO";
}

/** Split a path into ups · [sibling] · downs (same partition as resolve). */
export function decompose(path) {
  let i = 0;
  const ups = [];
  while (i < path.length && UP.has(path[i].kind)) ups.push(path[i++]);
  let sib = null;
  if (i < path.length && SIB.has(path[i].kind)) sib = path[i++];
  const downs = [];
  while (i < path.length && DOWN.has(path[i].kind)) downs.push(path[i++]);
  return { ups, sib, downs, valid: i === path.length };
}

/** Generation offset relative to ego (ancestors positive, descendants negative). */
export function genOffset(path) {
  const d = decompose(path);
  return d.ups.length - d.downs.length;
}

/** Which kinds of branch may be added from this node, per the blood grammar. */
export function allowedAdds(path) {
  const { ups, sib, downs } = decompose(path);
  return {
    parent: !sib && downs.length === 0,
    sibling: !sib && downs.length === 0,
    child: !!sib || ups.length === 0,
  };
}

/** Append a step to a node path, returning a new path. */
export function appendStep(path, kind, age = null) {
  return path.concat([step(kind, age)]);
}

/**
 * Genealogical parent paths of a node (the person(s) one generation up whose
 * child this node is). Used to draw pedigree connectors. May return one path
 * (descent line: the spouse is off-tree) or two (an ego/ancestor/sibling node,
 * whose father and mother are both charted positions).
 */
export function parentPaths(path) {
  const { ups, sib, downs } = decompose(path);
  if (downs.length) {
    const p = ups.concat(sib ? [sib] : []).concat(downs.slice(0, -1));
    return [p];
  }
  const base = ups; // the ascending part above the sibling/ego
  return [base.concat([step("F")]), base.concat([step("M")])];
}

/* ----------------------------------------------------------------------- *
 * Whole-tree serialisation (share links / codes)
 * ----------------------------------------------------------------------- */

export function serializeTree(st) {
  return JSON.stringify({
    n: (st.nodes || []).map((p) => p.map((s) => (s.age ? s.age[0] : "") + s.kind)),
    s: st.sel || "EGO",
    g: st.egoSex || "F",
    e: st.egoElder ?? null,
    l: st.language || "zh",
    r: st.roman ? 1 : 0,
    v: st.view || "chart",
  });
}

export function deserializeTree(json) {
  const o = typeof json === "string" ? JSON.parse(json) : json;
  const parseTok = (tok) => {
    const m = /^([ey]?)([FMBZSD])$/.exec(tok);
    return m ? step(m[2], AGE[m[1]] || null) : null;
  };
  let nodes = Array.isArray(o.n)
    ? o.n.map((p) => (Array.isArray(p) ? p.map(parseTok).filter(Boolean) : []))
    : [];
  if (!nodes.length) nodes = [[]];
  if (!nodes.some((p) => p.length === 0)) nodes.unshift([]); // ego always present
  return {
    nodes,
    sel: typeof o.s === "string" ? o.s : "EGO",
    egoSex: o.g === "M" ? "M" : "F",
    egoElder: o.e === true || o.e === false ? o.e : null,
    language: typeof o.l === "string" ? o.l : "zh",
    roman: o.r !== 0,
    view: ["chart", "outline", "fan"].includes(o.v) ? o.v : "chart",
  };
}
