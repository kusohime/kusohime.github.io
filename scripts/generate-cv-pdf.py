from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    KeepTogether,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "files" / "yixin-cui-cv.pdf"


def register_font(name, filename):
    path = Path("C:/Windows/Fonts") / filename
    if path.exists():
      pdfmetrics.registerFont(TTFont(name, str(path)))
      return name
    return None


FONT_REGULAR = register_font("TimesNewRoman", "times.ttf") or "Times-Roman"
FONT_BOLD = register_font("TimesNewRomanBold", "timesbd.ttf") or "Times-Bold"
FONT_ITALIC = register_font("TimesNewRomanItalic", "timesi.ttf") or "Times-Italic"


styles = {
    "name": ParagraphStyle(
        "name",
        fontName=FONT_BOLD,
        fontSize=18,
        leading=20,
        alignment=1,
        spaceAfter=1,
    ),
    "role": ParagraphStyle(
        "role",
        fontName=FONT_REGULAR,
        fontSize=10,
        leading=12,
        alignment=1,
    ),
    "section": ParagraphStyle(
        "section",
        fontName=FONT_BOLD,
        fontSize=10.5,
        leading=12,
    ),
    "body": ParagraphStyle(
        "body",
        fontName=FONT_REGULAR,
        fontSize=9.2,
        leading=11,
    ),
    "body_bold": ParagraphStyle(
        "body_bold",
        fontName=FONT_BOLD,
        fontSize=9.2,
        leading=11,
    ),
    "italic": ParagraphStyle(
        "italic",
        fontName=FONT_ITALIC,
        fontSize=9.2,
        leading=11,
    ),
    "small": ParagraphStyle(
        "small",
        fontName=FONT_REGULAR,
        fontSize=8.6,
        leading=10,
    ),
}


def p(text, style="body"):
    return Paragraph(text, styles[style])


def section(title):
    table = Table(
        [[Paragraph(title.upper(), styles["section"])]],
        colWidths=[6.9 * inch],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 1),
                ("LINEBELOW", (0, 0), (-1, -1), 0.75, colors.black),
            ]
        )
    )
    return table


def two_col(left, right, left_style="body_bold", right_style="body_bold"):
    table = Table(
        [[p(left, left_style), p(right, right_style)]],
        colWidths=[5.35 * inch, 1.55 * inch],
        hAlign="LEFT",
    )
    table.setStyle(
        TableStyle(
            [
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ALIGN", (1, 0), (1, 0), "RIGHT"),
            ]
        )
    )
    return table


def bullets(items):
    return ListFlowable(
        [ListItem(p(item), leftIndent=10, bulletFontName=FONT_REGULAR) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontSize=5,
        bulletOffsetY=1,
    )


def entry(org, place, role, dates, bullet_items=None):
    parts = [
        two_col(org, place),
        two_col(f"<i>{role}</i>", f"<i>{dates}</i>", "body", "body"),
    ]
    if bullet_items:
        parts.append(bullets(bullet_items))
    parts.append(Spacer(1, 2))
    return KeepTogether(parts)


def line_item(name, dates):
    return two_col(name, dates, "body", "body")


def subheading(text):
    return p(f"<b>{text}</b>", "body")


def build():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        rightMargin=0.62 * inch,
        leftMargin=0.62 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
    )

    story = [
        p("Yixin Cui", "name"),
        p("(Ee-Hseen Tsway)", "role"),
        p("tenor, composer, pianist, keyboardist, conductor, designer", "role"),
        p("contact@yixincui.com | yixincui.com", "role"),
        section("Education"),
        entry("Eastman School of Music", "Rochester, NY", "Master of Arts, Composition", "2026-2028, anticipated"),
        entry(
            "Swarthmore College",
            "Swarthmore, PA",
            "Bachelor of Arts, Philosophy; minor in Music",
            "2021-2025",
            [
                "Cumulative GPA 3.97/4.00.",
                "Senior theses: Contingency, Difference, and Reproducibility in the Ontological Problems of Aleatoric Music; The Archaeology of Olympics: On Instrumentalized Bodies.",
            ],
        ),
        section("Teachers"),
        line_item("Voice", "Lara Nie"),
        line_item("Vocal Coach", "Debra Scurto-Davis"),
        line_item("Piano", "Marcantonio Barone; Keiko Sato"),
        line_item("Organ", "Edward Landin Senn"),
        line_item("Composition", "Gerald Levinson; Thomas Whitman; Erin Busch"),
        line_item("Conducting", "Andrew Hauze; Nathan Reiff"),
        section("Masterclasses and Workshops"),
        line_item("American Guild of Organists, Philadelphia Chapter, organ", "2023"),
        line_item("Damin Spritzer, organ", "2023"),
        line_item("Mark Loria, organ", "2023"),
        line_item("Violafest with Hannah Rose Nicholas, composition", "2023"),
        line_item("Roderick Williams OBE, composition", "2024"),
        line_item("Jasper String Quartet, conducting", "2024"),
        line_item("Wildflower Lab with Relache Ensemble, composition", "2025"),
        line_item("Roderick Williams OBE, voice", "2025"),
        line_item("Tamara Lukasheva and Hans Lüdemann, voice and composition", "2025"),
        line_item("American Choral Directors Association, Pennsylvania, conducting", "2025"),
        line_item("Peggy Dettwiler and Anton Armstrong, conducting", "2025"),
        section("Professional Experience"),
        entry(
            "Eastman School of Music Instrument Office",
            "Rochester, NY",
            "Piano Technology Apprentice",
            "2026-present",
            ["Apprenticeship in piano technology through Eastman's instrument office."],
        ),
        entry(
            "Pagoda Artworks, Inc., Westside Music Conservatory",
            "Los Angeles, CA",
            "Intern",
            "2025-2026",
            [
                "Create illustrations and design for republishing piano technique tutorials.",
                "Front-end engineering, catalog design, and professional composer websites.",
                "Consultation on pedagogy and world music.",
            ],
        ),
        entry(
            "Vortion Education Technology Co., Ltd.",
            "Shanghai, China",
            "Start-up Partner and Humanities Consultant",
            "2025-present",
            [
                "Consultation and resources for students preparing to study abroad.",
                "E-learning courses and flipped classrooms using higher-education resources.",
            ],
        ),
        entry("Cooper Series, Swarthmore College", "Swarthmore, PA", "Commission Singer", "2025-2026"),
        entry("Swarthmore Garnet Singers", "Swarthmore, PA", "Pianist", "2026"),
        entry(
            "Concert Musician",
            "Swarthmore, PA",
            "Collaborative Pianist and Soloist Singer",
            "2025-present",
            [
                "Soloist for a newly commissioned cantata by C. Leonard Raybon.",
                "Collaborative keyboard work for rehearsal, sight-reading, and concert performance.",
            ],
        ),
        entry(
            "Swarthmore College",
            "Swarthmore, PA",
            "Tutor, Grader",
            "2021-2024",
            ["Tutoring and grading across mathematics, modern languages, and music theory."],
        ),
        KeepTogether([
            section("Music Ensemble Experience"),
            line_item("Swarthmore Chorus", "section leader, soloist, octet singer"),
            line_item("Swarthmore Garnet Singers", "senior student conductor, composer, pianist"),
            line_item("Swarthmore Orchestra", "celesta, piano, organ, percussion, composer"),
            line_item("Swarthmore Lab Orchestra", "senior student conductor, percussion"),
            line_item("Swarthmore Theatre Department", "student keyboardist"),
            line_item("Swarthmore Chinese Music Ensemble", "erhu, zheng, voice, yangqin, conducting assistant"),
        ]),
        section("Selected Compositions"),
        subheading("Chamber and Instrumental"),
        line_item("Bayanbulak - 8'20, solo viola", "2023"),
        line_item("Urtonforschungen I - 5', piano and vibraphone", "2024"),
        line_item("Urtonforschungen II - 4', chamber ensemble", "2024"),
        line_item("A Song in the Winter - 6', soprano and piano", "2025"),
        line_item("A Past Life - 5', solo sign-singer in CSL", "2025"),
        line_item("Saijōtai Yamata[i]-K[h]itan No. 2 - 9', percussion and voice", "2025"),
        line_item("Phalanx Break - 6'30, piccolo and piano; commissioned by Passacaglia Chamber Music Collective", "2025"),
        subheading("Large Ensemble"),
        line_item("Twink Death - circa 65', two actors, high voice, and large ensemble", "2025"),
        subheading("Choral"),
        line_item("DU:: nouvelle prière bouddhique - 9', SATB, percussion, piano", "2025"),
        subheading("Orchestral"),
        line_item("Impasse of the Weasels - 6'20, orchestra", "2025"),
        section("Scholarships and Fellowships"),
        line_item("Hannah A. Leedom Fellowship, Swarthmore College", "2026-2027"),
        line_item("Merit Scholarships, University of Rochester", "2026-present"),
        line_item("Freeman Scholars, Swarthmore Music Department", "2024-2025"),
        section("Languages"),
        p("Listed from higher to lower proficiency.", "small"),
        p("Mandarin, English, Japanese, Classical Chinese, Classical Japanese, French, Chinese Sign Language (PRC standard), German, Tibetan."),
        section("Selected Performance Repertoire"),
        subheading("Voice"),
        bullets([
            "Richard Strauss: Befreit, Op. 39, No. 4",
            "Jules Massenet: Pourquoi me réveiller?, Werther, Act III",
            "Benjamin Britten: Miles...!, The Turn of the Screw, Act I",
            "Lili Boulanger: Clairières dans le ciel",
            "Olivier Messiaen: Trois mélodies",
            "Chen Yi: Meditation",
            "Spencer Kennedy: Péripéties",
        ]),
        subheading("Piano"),
        bullets([
            "Sofia Gubaidulina: Toccata-Troncata",
            "Tōru Takemitsu: Rain Tree Sketch II",
            "Nikolai Kapustin: 8 Concert Etudes",
            "Gerald Levinson: Chorale for Nanine, with Birds",
            "Tristan Murail: Le Rossignol en amour",
        ]),
        subheading("Organ"),
        bullets([
            "J. Pachelbel: Toccata in E minor, P. 462",
            "A. Vivaldi / J. S. Bach: Concerto in D minor, BWV 596",
            "Louis Vierne: 24 Pièces en style libre",
            "György Ligeti: Volumina",
            "Modest Mussorgsky / Jean Guillou: Pictures at an Exhibition",
        ]),
        subheading("Chamber and Ensemble"),
        bullets([
            "G. F. Handel: Organ Concerto, Op. 4, No. 4, HWV 292, continuo on harpsichord",
            "J. S. Bach: Ich habe genug, BWV 82, continuo on chamber organ",
            "F. Schubert: Winterreise, Op. 89, piano",
            "Carl Reinecke: Flute Sonata Undine, Op. 167, piano",
            "Erwin Schulhoff: Hot-Sonate, piano",
            "George Bizet: Au fond du temple saint, Les pêcheurs de perles, Act I, tenor",
            "Giacomo Puccini: O soave fanciulla, La bohème, Act I, tenor",
            "Luo Zhong-rong: Five Tang Quatrains, tenor",
            "Antonio Estévez: Mata del Anima Sola, soloist",
            "P. D. Q. Bach [Prof. Peter Schickele]: Knock, Knock Cantata, soloist",
        ]),
        subheading("Conducting"),
        bullets([
            "J. Haydn: Symphony No. 45",
            "Pärt Uusberg: Õhtul",
            "Charles H. Gabriel / Rollo Dilworth: I Sing Because I'm Happy",
        ]),
    ]

    doc.build(story)


if __name__ == "__main__":
    build()
