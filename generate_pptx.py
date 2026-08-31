import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def create_deck():
    prs = Presentation()
    # 16:9 Widescreen dimensions
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Color Palette matching Chandigarh Police Hackathon Template
    DARK_BG = RGBColor(8, 14, 28)       # Deep dark navy/black
    NAVY_BANNER = RGBColor(0, 34, 68)    # Institutional Navy
    GOLD = RGBColor(255, 184, 0)         # Golden yellow
    WHITE = RGBColor(255, 255, 255)
    TEXT_DARK = RGBColor(30, 41, 59)     # Slate 800
    TEXT_MUTED = RGBColor(100, 116, 139) # Slate 500
    CARD_BG = RGBColor(255, 255, 255)
    BORDER_COLOR = RGBColor(203, 213, 225) # Slate 300
    ACCENT_BLUE = RGBColor(0, 85, 204)
    ACCENT_RED = RGBColor(220, 38, 38)

    # ----------------------------------------------------
    # SLIDE 1: TITLE SLIDE (Dark Navy Background)
    # ----------------------------------------------------
    s1 = prs.slides.add_slide(blank_layout)
    bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg1.fill.solid()
    bg1.fill.fore_color.rgb = DARK_BG
    bg1.line.color.rgb = DARK_BG

    # Hackathon Title Top Left
    title_box = s1.shapes.add_textbox(Inches(0.8), Inches(0.6), Inches(8), Inches(1.5))
    tf1 = title_box.text_frame
    tf1.word_wrap = True
    p1_sub = tf1.paragraphs[0]
    p1_sub.text = "THE CHANDIGARH POLICE"
    p1_sub.font.size = Pt(20)
    p1_sub.font.bold = True
    p1_sub.font.color.rgb = WHITE
    p1_sub.font.name = "Arial"

    p1_main = tf1.add_paragraph()
    p1_main.text = "HACKATHON"
    p1_main.font.size = Pt(56)
    p1_main.font.bold = True
    p1_main.font.color.rgb = GOLD
    p1_main.font.name = "Arial"

    # Rounded Card for Team Details
    card1 = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.4), Inches(11.733), Inches(4.5))
    card1.fill.solid()
    card1.fill.fore_color.rgb = RGBColor(12, 20, 38)
    card1.line.color.rgb = RGBColor(51, 65, 85)
    card1.line.width = Pt(1.5)

    card1_tf = card1.text_frame
    card1_tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    card1_tf.word_wrap = True

    lines = [
        ("TEAM NAME:", " ctrl addicts"),
        ("TEAM LEADER NAME:", " Prabhanshu"),
        ("INSTITUTION:", " UIET (Panjab University)"),
        ("PROBLEM STATEMENT:", " Detection of Illicit Drug Sales on Darknet and Encrypted Platforms"),
        ("PROJECT NAME:", " pineSAW — Cyber Threat Intelligence & Asset Discovery System")
    ]

    for i, (label, val) in enumerate(lines):
        p = card1_tf.paragraphs[0] if i == 0 else card1_tf.add_paragraph()
        p.space_after = Pt(14)
        run_l = p.add_run()
        run_l.text = label
        run_l.font.bold = True
        run_l.font.size = Pt(18)
        run_l.font.color.rgb = WHITE
        run_l.font.name = "Arial"

        run_v = p.add_run()
        run_v.text = val
        run_v.font.bold = True
        run_v.font.size = Pt(18)
        run_v.font.color.rgb = GOLD if "PROJECT" in label or "TEAM NAME" in label else WHITE
        run_v.font.name = "Arial"


    # Helper function for Content Slides (White Card on Dark Base with Top Banner)
    def create_base_slide(title_text):
        slide = prs.slides.add_slide(blank_layout)
        # Dark outer canvas
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = DARK_BG
        bg.line.color.rgb = DARK_BG

        # Main White Card Container
        white_card = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.5), Inches(0.5), Inches(12.333), Inches(6.5))
        white_card.fill.solid()
        white_card.fill.fore_color.rgb = WHITE
        white_card.line.color.rgb = BORDER_COLOR
        white_card.line.width = Pt(1)

        # Top Pill Banner (Navy with Gold Text)
        banner = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(4.4), Inches(0.65), Inches(4.533), Inches(0.75))
        banner.fill.solid()
        banner.fill.fore_color.rgb = NAVY_BANNER
        banner.line.color.rgb = NAVY_BANNER
        btf = banner.text_frame
        btf.vertical_anchor = MSO_ANCHOR.MIDDLE
        bp = btf.paragraphs[0]
        bp.alignment = PP_ALIGN.CENTER
        brun = bp.add_run()
        brun.text = title_text
        brun.font.bold = True
        brun.font.size = Pt(20)
        brun.font.color.rgb = GOLD
        brun.font.name = "Arial"

        # Footer Text
        footer = slide.shapes.add_textbox(Inches(0.6), Inches(6.6), Inches(4.0), Inches(0.3))
        ftp = footer.text_frame.paragraphs[0]
        ftp.text = "Chandigarh Police Hackathon 2026 | Team ctrl addicts"
        ftp.font.size = Pt(9)
        ftp.font.color.rgb = TEXT_MUTED
        ftp.font.name = "Arial"

        return slide


    # ----------------------------------------------------
    # SLIDE 2: PROBLEM STATEMENT
    # ----------------------------------------------------
    s2 = create_base_slide("Problem Statement")

    tb2 = s2.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(11.333), Inches(4.8))
    tf2 = tb2.text_frame
    tf2.word_wrap = True

    problems = [
        "Rapidly evolving illicit drug trade migrating to Darknet (Tor .onion) and encrypted channels (Telegram/Session).",
        "Multi-hop cryptocurrency obfuscation (Peel Chains, Mixers, Bridges) hiding over $2.5B in annual drug flows.",
        "Static reference libraries fail to identify encrypted slang, synthetic drug analogues, and coded vendor listings.",
        "Fragmented intelligence: Disconnected digital traces across darknet marketplaces, chats, and crypto ledgers.",
        "Evidentiary gap: Lack of transparent, court-admissible chain-of-custody connecting anonymous wallets to physical bank accounts.",
        "Investigative delays: Manual OSINT and blockchain correlation take weeks, allowing kingpins to cash out undetected."
    ]

    for i, prob in enumerate(problems):
        p = tf2.paragraphs[0] if i == 0 else tf2.add_paragraph()
        p.space_after = Pt(16)
        run_b = p.add_run()
        run_b.text = "●  "
        run_b.font.color.rgb = ACCENT_RED
        run_b.font.bold = True
        run_b.font.size = Pt(15)

        run_t = p.add_run()
        run_t.text = prob
        run_t.font.size = Pt(15)
        run_t.font.color.rgb = TEXT_DARK
        run_t.font.name = "Arial"


    # ----------------------------------------------------
    # SLIDE 3: PROPOSED SOLUTION (6 GRID BOXES)
    # ----------------------------------------------------
    s3 = create_base_slide("Proposed Solution")

    # Sub-header
    sub_tb = s3.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.333), Inches(0.5))
    sp = sub_tb.text_frame.paragraphs[0]
    sp.alignment = PP_ALIGN.CENTER
    srun = sp.add_run()
    srun.text = "PINESAW — AI-POWERED CYBER THREAT INTELLIGENCE & ASSET DISCOVERY SYSTEM"
    srun.font.bold = True
    srun.font.size = Pt(13)
    srun.font.color.rgb = NAVY_BANNER

    # 6 Grid Boxes (2 rows x 3 columns)
    box_w = Inches(3.55)
    box_h = Inches(1.95)
    xs = [Inches(1.0), Inches(4.88), Inches(8.76)]
    ys = [Inches(2.1), Inches(4.3)]

    boxes_data = [
        ("Multi-Modal Detection", [
            "Tor & Telegram Ingestion",
            "On-Chain Event Parsing",
            "Surface OSINT Correlation"
        ]),
        ("Adaptive Threat Intelligence", [
            "MIT Persona Linking Model",
            "Cross-Market Identity Graph",
            "Historical Case Memory"
        ]),
        ("Intelligent Decision Support", [
            "Deterministic Risk Scoring",
            "Velocity & Anomaly Alerts",
            "Multi-Hop Subgraph Tracing"
        ]),
        ("AI-Powered Analysis", [
            "Cambridge Darknet Slang NER",
            "Stanford Co-Spend Clustering",
            "Entity Resolution Engine"
        ]),
        ("Financial Asset Review", [
            "Bidirectional Taint Analysis",
            "4 Indian Bank Accounts Mapped",
            "Offshore & Mixer Discovery"
        ]),
        ("Secure Law Enforcement Suite", [
            "Section 91 CrPC Dossier Export",
            "Tamper-Evident SHA-256 Logs",
            "Police Command Dashboard"
        ])
    ]

    for i, (b_title, b_bullets) in enumerate(boxes_data):
        bx = xs[i % 3]
        by = ys[i // 3]

        box = s3.shapes.add_shape(MSO_SHAPE.RECTANGLE, bx, by, box_w, box_h)
        box.fill.solid()
        box.fill.fore_color.rgb = RGBColor(248, 250, 252) # Slate 50
        box.line.color.rgb = BORDER_COLOR
        box.line.width = Pt(1)

        btf = box.text_frame
        btf.word_wrap = True
        bp = btf.paragraphs[0]
        bp.space_after = Pt(6)
        brun = bp.add_run()
        brun.text = b_title
        brun.font.bold = True
        brun.font.size = Pt(12)
        brun.font.color.rgb = NAVY_BANNER

        for b_item in b_bullets:
            p = btf.add_paragraph()
            p.space_after = Pt(3)
            p_run = p.add_run()
            p_run.text = f"●  {b_item}"
            p_run.font.size = Pt(10.5)
            p_run.font.color.rgb = TEXT_DARK


    # ----------------------------------------------------
    # SLIDE 4: KEY FEATURES
    # ----------------------------------------------------
    s4 = create_base_slide("KEY FEATURES")

    tb4 = s4.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(11.333), Inches(4.8))
    tf4 = tb4.text_frame
    tf4.word_wrap = True

    features = [
        ("Cross-Platform Identity Resolution: ", "Automatically links Tor vendors to Telegram handles via shared PGP keys and stylometry (backed by MIT Lincoln Laboratory research)."),
        ("Bidirectional Backtracking (Taint Analysis): ", "Traces crypto forward to exchanges and backtracks to uncover domestic bank accounts (HDFC, SBI, ICICI, Axis)."),
        ("Financial Supply Chain Disruption: ", "Targets cash-out bottlenecks under Section 68F of the NDPS Act rather than disposable couriers."),
        ("Deterministic & Explainable AI: ", "Replaces opaque black boxes with exact mathematical scoring based on network centrality and velocity anomalies."),
        ("1-Click Evidentiary Legal Dossier: ", "Generates court-admissible Section 91 Cr.P.C. disclosure notices and bank freeze requisitions in seconds."),
        ("Digital Chain-of-Custody: ", "Full cryptographic SHA-256 evidence hashing guaranteeing integrity under the Indian Evidence Act.")
    ]

    for i, (f_title, f_desc) in enumerate(features):
        p = tf4.paragraphs[0] if i == 0 else tf4.add_paragraph()
        p.space_after = Pt(14)
        run_b = p.add_run()
        run_b.text = "●  "
        run_b.font.color.rgb = ACCENT_BLUE
        run_b.font.bold = True
        run_b.font.size = Pt(14)

        run_t = p.add_run()
        run_t.text = f_title
        run_t.font.bold = True
        run_t.font.size = Pt(14)
        run_t.font.color.rgb = NAVY_BANNER

        run_d = p.add_run()
        run_d.text = f_desc
        run_d.font.size = Pt(13.5)
        run_d.font.color.rgb = TEXT_DARK


    # ----------------------------------------------------
    # SLIDE 5: DELIVERABLES / PROPOSED OUTCOME
    # ----------------------------------------------------
    s5 = create_base_slide("DELIVERABLES / PROPOSED OUTCOME")

    tb5 = s5.shapes.add_textbox(Inches(1.0), Inches(1.7), Inches(11.333), Inches(4.8))
    tf5 = tb5.text_frame
    tf5.word_wrap = True

    deliverables = [
        ("Full-Stack Operational Police Intelligence Terminal: ", "Next.js 16 / Prisma deployed platform featuring institutional, high-density light UI."),
        ("Knowledge Graph Resolution Engine: ", "Sub-second graph querying linking multi-market aliases, crypto clusters, and fiat nodes."),
        ("Financial Asset Review Module (/financial): ", "Live mapping of domestic and offshore banking channels linked to target kingpins."),
        ("Automated Subpoena & Legal Export Suite: ", "Print-ready court dossiers with complete metadata and audit trails."),
        ("Dramatic Lead-Time Compression: ", "Reduces preliminary forensic investigation from 14 days to under 500 milliseconds."),
        ("Inter-Agency Compatibility: ", "Standardized intelligence schemas ready for Chandigarh Police, NCB, ED, and Interpol.")
    ]

    for i, (d_title, d_desc) in enumerate(deliverables):
        p = tf5.paragraphs[0] if i == 0 else tf5.add_paragraph()
        p.space_after = Pt(14)
        run_b = p.add_run()
        run_b.text = "✔  "
        run_b.font.color.rgb = RGBColor(22, 163, 74) # Green
        run_b.font.bold = True
        run_b.font.size = Pt(14)

        run_t = p.add_run()
        run_t.text = d_title
        run_t.font.bold = True
        run_t.font.size = Pt(14)
        run_t.font.color.rgb = NAVY_BANNER

        run_d = p.add_run()
        run_d.text = d_desc
        run_d.font.size = Pt(13.5)
        run_d.font.color.rgb = TEXT_DARK


    # ----------------------------------------------------
    # SLIDE 6: PROTOTYPE (IMG OR VID IF ANY)
    # ----------------------------------------------------
    s6 = create_base_slide("PROTOTYPE\n(IMG OR VID IF ANY)")

    # Large Clean Placeholder Frame for Live Video / Screenshots
    proto_frame = s6.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(1.0), Inches(1.8), Inches(11.333), Inches(4.5))
    proto_frame.fill.solid()
    proto_frame.fill.fore_color.rgb = RGBColor(248, 250, 252)
    proto_frame.line.color.rgb = BORDER_COLOR
    proto_frame.line.dash_style = 2 # Dashed border

    ptf = proto_frame.text_frame
    ptf.vertical_anchor = MSO_ANCHOR.MIDDLE
    pp = ptf.paragraphs[0]
    pp.alignment = PP_ALIGN.CENTER
    prun = pp.add_run()
    prun.text = "[ LIVE PROTOTYPE DEMONSTRATION / SCREENSHOTS EMBED HERE ]\n\nSlot 1: Command Center Real-Time Incident Stream\nSlot 2: Target Entity Knowledge Graph (ShadowBroker)\nSlot 3: Financial Asset Review & 1-Click Section 91 CrPC Subpoena Generator"
    prun.font.size = Pt(14)
    prun.font.color.rgb = TEXT_MUTED


    # ----------------------------------------------------
    # SLIDE 7: THANK YOU (Dark Navy Background)
    # ----------------------------------------------------
    s7 = prs.slides.add_slide(blank_layout)
    bg7 = s7.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
    bg7.fill.solid()
    bg7.fill.fore_color.rgb = DARK_BG
    bg7.line.color.rgb = DARK_BG

    ty_box = s7.shapes.add_textbox(Inches(2.0), Inches(2.2), Inches(9.333), Inches(3.0))
    ty_tf = ty_box.text_frame
    ty_p = ty_tf.paragraphs[0]
    ty_p.alignment = PP_ALIGN.CENTER
    ty_run = ty_p.add_run()
    ty_run.text = "THANK YOU"
    ty_run.font.size = Pt(64)
    ty_run.font.bold = True
    ty_run.font.color.rgb = GOLD
    ty_run.font.name = "Arial"

    sub_ty = ty_tf.add_paragraph()
    sub_ty.alignment = PP_ALIGN.CENTER
    sub_ty.space_before = Pt(16)
    srun = sub_ty.add_run()
    srun.text = "Team ctrl addicts | UIET (Panjab University)\npineSAW Cyber Threat Intelligence System\nQuestions & Answers"
    srun.font.size = Pt(18)
    srun.font.color.rgb = WHITE
    srun.font.name = "Arial"

    # Save Presentation
    pptx_path = "/Users/prabhanshushekhar/Desktop/CP3/ctrl_addicts_pineSAW_Presentation.pptx"
    prs.save(pptx_path)
    print(f"Presentation created successfully at: {pptx_path}")

if __name__ == "__main__":
    create_deck()
