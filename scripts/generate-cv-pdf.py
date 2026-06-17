from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
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


styles = {
    "name": ParagraphStyle(
        "name",
        fontName="Times-Bold",
        fontSize=18,
        leading=20,
        alignment=1,
        spaceAfter=1,
    ),
    "role": ParagraphStyle(
        "role",
        fontName="Times-Roman",
        fontSize=10,
        leading=12,
        alignment=1,
    ),
    "section": ParagraphStyle(
        "section",
        fontName="Times-Bold",
        fontSize=10.5,
        leading=12,
    ),
    "body": ParagraphStyle(
        "body",
        fontName="Times-Roman",
        fontSize=9.2,
        leading=11,
    ),
    "body_bold": ParagraphStyle(
        "body_bold",
        fontName="Times-Bold",
        fontSize=9.2,
        leading=11,
    ),
    "italic": ParagraphStyle(
        "italic",
        fontName="Times-Italic",
        fontSize=9.2,
        leading=11,
    ),
    "small": ParagraphStyle(
        "small",
        fontName="Times-Roman",
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
        [ListItem(p(item), leftIndent=10, bulletFontName="Times-Roman") for item in items],
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
        p("composer, pianist, keyboardist, designer", "role"),
        p("contact@yixincui.com | yixincui.com", "role"),
        section("Education"),
        entry("Eastman School of Music", "Rochester, NY", "Master of Arts, Composition", "2026-2028, anticipated"),
        entry(
            "Swarthmore College",
            "Swarthmore, PA",
            "Bachelor of Arts, Philosophy",
            "2021-2025",
            [
                "Minor in Music; cumulative GPA 3.97/4.00.",
                "Senior theses on aleatoric music and instrumentalized bodies.",
            ],
        ),
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
            "2025-present",
            [
                "Create illustrations and design for republishing piano technique tutorials.",
                "Front-end engineering, catalog design, and professional composer websites.",
                "Consultation on pedagogy and world music.",
            ],
        ),
        entry(
            "Vortion Education Technology Co., Ltd.",
            "Shanghai, China",
            "Start-up Partner",
            "2025-present",
            [
                "Consultation and resources for students preparing to study abroad.",
                "E-learning courses and flipped classrooms using higher-education resources.",
            ],
        ),
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
        section("Scholarships and Fellowships"),
        line_item("Hannah A. Leedom Fellowship, Swarthmore College", "2026-2027"),
        line_item("Merit Scholarships, University of Rochester", "2026-present"),
        line_item("Freeman Scholars, Swarthmore Music Department", "2024-2025"),
        section("Languages"),
        p("Listed from greater to lesser proficiency.", "small"),
        p("Mandarin, English, Japanese, Classical Chinese, Classical Japanese, French, Chinese Sign Language, German, Tibetan."),
    ]

    doc.build(story)


if __name__ == "__main__":
    build()
