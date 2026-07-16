import type { OrnamentFamilyId } from "./essentialOrnaments";

export interface OrnamentNotationExample {
  id: string;
  sourceId: string;
  familyId: OrnamentFamilyId;
  term: string;
  termZh: string;
  sourceLocator: string;
  sourcePageUrl: string;
  sourceImageUrl: string;
  sourceCredit: string;
  verificationStatus: "source-verified";
  realizationSummary: string;
  realizationAccessibleDescription: string;
  editorialNote: string;
  signMei: string;
  realizationMei: string;
}

interface MeiSnippetOptions {
  id: string;
  title: string;
  layer: string;
  controlEvent?: string;
}

const meiSnippet = ({ id, title, layer, controlEvent = "" }: MeiSnippetOptions) => `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.1">
  <meiHead>
    <fileDesc>
      <titleStmt><title>${title}</title></titleStmt>
      <pubStmt><p>Independent digital transcription for the Essential Ornaments index.</p></pubStmt>
    </fileDesc>
  </meiHead>
  <music>
    <body>
      <mdiv xml:id="${id}">
        <score>
          <scoreDef>
            <staffGrp>
              <staffDef n="1" lines="5" clef.shape="G" clef.line="2"/>
            </staffGrp>
          </scoreDef>
          <section>
            <measure n="1" metcon="false" right="invis">
              <staff n="1"><layer n="1">${layer}</layer></staff>
              ${controlEvent}
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

const signSnippet = (
  id: string,
  title: string,
  controlElement: "trill" | "mordent" | "turn",
  attributes = "",
) =>
  meiSnippet({
    id,
    title,
    layer: `<note xml:id="${id}-note" pname="d" oct="5" dur="2"/>`,
    controlEvent: `<${controlElement} startid="#${id}-note" place="above" ${attributes}/>`
      .replace(/\s+\/>/, "/>"),
  });

const beamedNotes = (
  id: string,
  pitches: readonly [pname: string, oct: number][],
  dur = 32,
  dottedLast = false,
) =>
  `<beam>${pitches
    .map(
      ([pname, oct], index) =>
        `<note xml:id="${id}-n${index + 1}" pname="${pname}" oct="${oct}" dur="${dur}"${
          dottedLast && index === pitches.length - 1 ? ' dots="1"' : ""
        }/>`,
    )
    .join("")}</beam>`;

const sourcePageUrl = "https://collections.library.yale.edu/catalog/10991080";
const sourceImageUrl =
  "https://collections.library.yale.edu/iiif/2/10991088/200,150,3000,1750/full/0/default.jpg";

export const ornamentNotationExamples: readonly OrnamentNotationExample[] = [
  {
    id: "bach-1720-trillo",
    sourceId: "js-bach-1720",
    familyId: "trill",
    term: "Trillo",
    termZh: "顫音",
    sourceLocator: "autograph ornament table, fol. 3v",
    sourcePageUrl,
    sourceImageUrl,
    sourceCredit: "Johann Sebastian Bach, Beinecke Rare Book and Manuscript Library, Yale University, Music Deposit 31 (public domain)",
    verificationStatus: "source-verified",
    realizationSummary: "Upper neighbor - main note, repeated three times.",
    realizationAccessibleDescription:
      "Six beamed thirty-second notes: E5, D5, E5, D5, E5, D5; the final D5 is dotted.",
    editorialNote:
      "Modern treble-clef transcription. Relative pitch and the six-note alternation follow Bach's table; the final note retains its dot.",
    signMei: signSnippet(
      "bach-trillo-sign",
      "Bach 1720: Trillo sign",
      "trill",
      'glyph.auth="smufl" glyph.name="ornamentTrill"',
    ),
    realizationMei: meiSnippet({
      id: "bach-trillo-realization",
      title: "Bach 1720: Trillo realization",
      layer: beamedNotes(
        "bach-trillo-realization",
        [["e", 5], ["d", 5], ["e", 5], ["d", 5], ["e", 5], ["d", 5]],
        32,
        true,
      ),
    }),
  },
  {
    id: "bach-1720-mordant",
    sourceId: "js-bach-1720",
    familyId: "mordent",
    term: "Mordant",
    termZh: "下波音",
    sourceLocator: "autograph ornament table, fol. 3v",
    sourcePageUrl,
    sourceImageUrl,
    sourceCredit: "Johann Sebastian Bach, Beinecke Rare Book and Manuscript Library, Yale University, Music Deposit 31 (public domain)",
    verificationStatus: "source-verified",
    realizationSummary: "Main note - lower neighbor - main note.",
    realizationAccessibleDescription:
      "Two beamed thirty-second notes, D5 and C5, followed by a dotted quarter-note D5.",
    editorialNote:
      "Modern treble-clef transcription. Bach's crossed sign is encoded semantically as a lower mordent.",
    signMei: signSnippet(
      "bach-mordant-sign",
      "Bach 1720: Mordant sign",
      "mordent",
      'form="lower" glyph.auth="smufl" glyph.name="ornamentMordent"',
    ),
    realizationMei: meiSnippet({
      id: "bach-mordant-realization",
      title: "Bach 1720: Mordant realization",
      layer:
        beamedNotes("bach-mordant-realization", [["d", 5], ["c", 5]]) +
        '<note xml:id="bach-mordant-realization-n3" pname="d" oct="5" dur="4" dots="1"/>',
    }),
  },
  {
    id: "bach-1720-cadence",
    sourceId: "js-bach-1720",
    familyId: "turn",
    term: "Cadence",
    termZh: "迴音",
    sourceLocator: "autograph ornament table, fol. 3v",
    sourcePageUrl,
    sourceImageUrl,
    sourceCredit: "Johann Sebastian Bach, Beinecke Rare Book and Manuscript Library, Yale University, Music Deposit 31 (public domain)",
    verificationStatus: "source-verified",
    realizationSummary: "Upper neighbor - main note - lower neighbor - main note.",
    realizationAccessibleDescription:
      "Four beamed thirty-second notes: E5, D5, C5, D5.",
    editorialNote:
      "Modern treble-clef transcription. The source sign is normalized to MEI's standard turn glyph; the four-note realization follows Bach's table.",
    signMei: signSnippet(
      "bach-cadence-sign",
      "Bach 1720: Cadence sign",
      "turn",
      'glyph.auth="smufl" glyph.name="ornamentTurn"',
    ),
    realizationMei: meiSnippet({
      id: "bach-cadence-realization",
      title: "Bach 1720: Cadence realization",
      layer: beamedNotes(
        "bach-cadence-realization",
        [["e", 5], ["d", 5], ["c", 5], ["d", 5]],
      ),
    }),
  },
];
