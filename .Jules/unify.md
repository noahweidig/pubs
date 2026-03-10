## 2025-05-18 - Missing Contextual Hierarchy
**Learning:** Dropping users directly into a raw list of grouped items without a top-level page heading (`<h1>`) creates ambiguity about the page's overall purpose and violates clear narrative flow.
**Action:** Always ensure a clear `<h1>` and introductory subtitle exist before presenting a list or grid of content, so the user knows exactly what they are looking at and why it matters.
## 2025-05-18 - Repeated Terminology in Hierarchy
**Learning:** Using the same term ("Publications") for both the top-level page heading (<h1> equivalent) and a sub-section (<h2> equivalent) creates a confusing, repetitive hierarchy.
**Action:** Ensure sub-sections use more specific terminology (e.g., "Journal Articles") than their parent sections to clearly delineate the content structure and maintain narrative progression.
## 2025-05-18 - Semantic Flow and Explicit CTAs
**Learning:** Organizing publication content so that major written works (Thesis, Journal Articles) precede presentations or media provides a clearer logical arc for the user. Additionally, abstract buttons labeled simply "Expand All" lack contextual meaning compared to explicit labels like "Expand all abstracts," which removes ambiguity. Replacing generic container divs (`<div class="type-heading">`) with semantic heading tags (`<h2 class="type-heading">`) ensures the document outline matches the visual hierarchy, improving accessibility and overall cohesion.
**Action:** Order content logically by primary value. Use specific CTA text matching user intent. Maintain a semantic HTML document structure with appropriate heading levels beneath the main page heading (`<h1>`).
## 2026-03-10 - Inclusive Terminology for Diverse Content
**Learning:** Using format-specific terms like "Abstract" for a list containing diverse content (academic papers, media coverage, presentations) disrupts narrative coherence.
**Action:** Prioritize inclusive, generic terminology such as "Summary" or "Expand all summaries" rather than format-specific terms to preserve narrative coherence.
