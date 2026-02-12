from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from datetime import datetime
from io import BytesIO


def generate_analysis_report(analysis_data, resume_filename):
    """Generate a PDF report for a single resume analysis."""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    story = []
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=6,
        alignment=TA_CENTER,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
    )
    
    # Title
    story.append(Paragraph("Resume Analysis Report", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Report metadata
    metadata = [
        ['File Name:', resume_filename],
        ['Generated:', datetime.now().strftime("%B %d, %Y at %I:%M %p")],
        ['Role:', analysis_data.get('role_display', 'N/A')],
        ['Level:', analysis_data.get('level_display', 'N/A')],
    ]
    
    metadata_table = Table(metadata, colWidths=[1.5*inch, 4*inch])
    metadata_table.setStyle(TableStyle([
        ('FONT', (0, 0), (-1, -1), 'Helvetica', 10),
        ('FONT', (0, 0), (0, -1), 'Helvetica-Bold', 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TEXTCOLOR', (0, 0), (0, -1), colors.HexColor('#1e40af')),
    ]))
    story.append(metadata_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Scores Section
    story.append(Paragraph("Overall Scores", heading_style))
    
    scores_data = [
        ['Metric', 'Score', 'Status'],
        ['Overall Score', f"{analysis_data.get('overall_score', 0):.1f}/100", '✓' if analysis_data.get('overall_score', 0) >= 70 else '✗'],
        ['Skill Match', f"{analysis_data.get('skill_match_score', 0):.1f}%", '✓' if analysis_data.get('skill_match_score', 0) >= 70 else '✗'],
        ['ATS Score', f"{analysis_data.get('ats_score', 0):.1f}%", '✓' if analysis_data.get('ats_score', 0) >= 70 else '✗'],
    ]
    
    scores_table = Table(scores_data, colWidths=[2*inch, 2*inch, 1*inch])
    scores_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ('FONT', (0, 1), (-1, -1), 'Helvetica', 10),
    ]))
    story.append(scores_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Skills Section
    story.append(Paragraph("Skill Analysis", heading_style))
    
    extracted_skills = analysis_data.get('extracted_skills', {})
    missing_skills = analysis_data.get('missing_skills', {})
    
    # Found Skills
    if extracted_skills:
        story.append(Paragraph("<b>Found Skills:</b>", styles['Normal']))
        tech_skills = extracted_skills.get('technical', [])
        business_skills = extracted_skills.get('business', [])
        soft_skills = extracted_skills.get('soft_skills', [])
        
        if tech_skills:
            story.append(Paragraph(f"<b>Technical:</b> {', '.join(tech_skills[:20])}", styles['Normal']))
        if business_skills:
            story.append(Paragraph(f"<b>Business:</b> {', '.join(business_skills[:15])}", styles['Normal']))
        if soft_skills:
            story.append(Paragraph(f"<b>Soft Skills:</b> {', '.join(soft_skills[:15])}", styles['Normal']))
        story.append(Spacer(1, 0.15*inch))
    
    # Missing Skills
    if missing_skills:
        story.append(Paragraph("<b>Missing Skills (Recommended to Learn):</b>", styles['Normal']))
        
        # missing_skills is a list of skill names
        if isinstance(missing_skills, list):
            missing_text = ', '.join(missing_skills[:25])
            story.append(Paragraph(missing_text, styles['Normal']))
        else:
            # If it's a dict (backward compatibility)
            missing_tech = missing_skills.get('technical', [])
            missing_business = missing_skills.get('business', [])
            
            if missing_tech:
                story.append(Paragraph(f"<b>Technical:</b> {', '.join(missing_tech[:20])}", styles['Normal']))
            if missing_business:
                story.append(Paragraph(f"<b>Business:</b> {', '.join(missing_business[:15])}", styles['Normal']))
        story.append(Spacer(1, 0.15*inch))
    
    # Recommendations
    story.append(Paragraph("Recommendations for Improvement", heading_style))
    
    overall_score = analysis_data.get('overall_score', 0)
    skill_match = analysis_data.get('skill_match_score', 0)
    ats_score = analysis_data.get('ats_score', 0)
    
    recommendations = []
    if skill_match < 70:
        recommendations.append(f"• Focus on acquiring missing technical skills (currently {skill_match:.0f}% match)")
    if ats_score < 70:
        recommendations.append(f"• Improve resume format and structure for ATS compatibility (score: {ats_score:.0f}%)")
    if overall_score < 50:
        recommendations.append("• This role may not be the best fit. Consider exploring other positions.")
    elif overall_score < 70:
        recommendations.append("• You are close! Focus on the recommendations above to reach 70%+ match.")
    else:
        recommendations.append("• Excellent! You meet most requirements for this position.")
    
    if missing_skills:
        # missing_skills is a list of skill names
        if isinstance(missing_skills, list):
            missing_count = len(missing_skills)
        else:
            missing_count = len(missing_skills.get('technical', [])) + len(missing_skills.get('business', []))
        recommendations.append(f"• Consider learning {missing_count} additional skills to strengthen your profile")
    
    for rec in recommendations:
        story.append(Paragraph(rec, styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    # Footer
    story.append(Spacer(1, 0.2*inch))
    footer_text = "Resume Analytics Platform | Generated on " + datetime.now().strftime("%B %d, %Y")
    story.append(Paragraph(footer_text, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_comparison_report(resume1_data, resume2_data, resume1_name, resume2_name):
    """Generate a PDF report comparing two resumes."""
    
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter, topMargin=0.5*inch, bottomMargin=0.5*inch)
    styles = getSampleStyleSheet()
    story = []
    
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=22,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=6,
        alignment=TA_CENTER,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1e40af'),
        spaceAfter=12,
        spaceBefore=12,
    )
    
    # Title
    story.append(Paragraph("Resume Comparison Report", title_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Comparison metrics
    story.append(Paragraph("Score Comparison", heading_style))
    
    comparison_data = [
        ['Metric', resume1_name[:30], resume2_name[:30]],
        ['Overall Score', f"{resume1_data.get('overall_score', 0):.1f}", f"{resume2_data.get('overall_score', 0):.1f}"],
        ['Skill Match', f"{resume1_data.get('skill_match_score', 0):.1f}%", f"{resume2_data.get('skill_match_score', 0):.1f}%"],
        ['ATS Score', f"{resume1_data.get('ats_score', 0):.1f}%", f"{resume2_data.get('ats_score', 0):.1f}%"],
        ['Word Count', str(resume1_data.get('word_count', 0)), str(resume2_data.get('word_count', 0))],
    ]
    
    comparison_table = Table(comparison_data, colWidths=[2*inch, 2*inch, 2*inch])
    comparison_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1e40af')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 10),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#d1d5db')),
        ('FONT', (0, 1), (-1, -1), 'Helvetica', 9),
    ]))
    story.append(comparison_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Skill comparison
    story.append(Paragraph("Technical Skills Comparison", heading_style))
    
    r1_tech = set(resume1_data.get('extracted_skills', {}).get('technical', []))
    r2_tech = set(resume2_data.get('extracted_skills', {}).get('technical', []))
    
    shared_skills = r1_tech & r2_tech
    unique_r1 = r1_tech - r2_tech
    unique_r2 = r2_tech - r1_tech
    
    if shared_skills:
        story.append(Paragraph(f"<b>Shared Skills ({len(shared_skills)}):</b> {', '.join(list(shared_skills)[:15])}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    if unique_r1:
        story.append(Paragraph(f"<b>Unique to {resume1_name[:20]} ({len(unique_r1)}):</b> {', '.join(list(unique_r1)[:15])}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    if unique_r2:
        story.append(Paragraph(f"<b>Unique to {resume2_name[:20]} ({len(unique_r2)}):</b> {', '.join(list(unique_r2)[:15])}", styles['Normal']))
        story.append(Spacer(1, 0.1*inch))
    
    # Summary
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Summary", heading_style))
    
    better_resume = resume1_name if resume1_data.get('overall_score', 0) > resume2_data.get('overall_score', 0) else resume2_name
    score_diff = abs(resume1_data.get('overall_score', 0) - resume2_data.get('overall_score', 0))
    
    summary = f"<b>{better_resume}</b> has a higher overall score (difference: {score_diff:.1f} points). "
    summary += f"Resume 1 has {len(unique_r1)} unique skills, while Resume 2 has {len(unique_r2)} unique skills. "
    summary += f"Both resumes share {len(shared_skills)} technical skills."
    
    story.append(Paragraph(summary, styles['Normal']))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
