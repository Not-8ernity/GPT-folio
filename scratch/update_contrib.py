import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace legend and contrib-cell
css = re.sub(
    r'\.legend-squares span, \.contrib-cell\s*\{[^}]*\}',
    '.legend-squares span, .contrib-cell {\n  width: 10px;\n  height: 10px;\n  border-radius: 2px;\n  border: none;\n  outline: 1px solid rgba(255,255,255,0.05);\n  outline-offset: -1px;\n}',
    css
)

# Remove border-color from levels
css = re.sub(r'\.level-0 \{ background: #161b22; border-color: #21262d; \}', '.level-0 { background: #161b22; }', css)
css = re.sub(r'\.level-1 \{ background: #0e4429; border-color: #0e4429; \}', '.level-1 { background: #0e4429; }', css)
css = re.sub(r'\.level-2 \{ background: #006d32; border-color: #006d32; \}', '.level-2 { background: #006d32; }', css)
css = re.sub(r'\.level-3 \{ background: #26a641; border-color: #26a641; \}', '.level-3 { background: #26a641; }', css)
css = re.sub(r'\.level-4 \{ background: #39d353; border-color: #39d353; \}', '.level-4 { background: #39d353; }', css)

# Fix hover
css = re.sub(
    r'\.contrib-cell:hover \{ border-color: rgba\(255,255,255,0\.4\); \}',
    '.contrib-cell:hover { outline: 1px solid rgba(255,255,255,0.4); z-index: 10; }',
    css
)

with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
