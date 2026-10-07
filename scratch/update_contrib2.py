import re

with open('styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Remove outlines/borders from boxes
css = re.sub(
    r'\.legend-squares span, \.contrib-cell\s*\{[^}]*\}',
    '.legend-squares span, .contrib-cell {\n  width: 10px;\n  height: 10px;\n  border-radius: 2px;\n  border: none;\n  outline: none;\n}',
    css
)

# Change level-0 color to #21262d (Github's actual empty color border, stands out on #0d1117)
css = re.sub(r'\.level-0 \{ background: #[0-9a-fA-F]+; \}', '.level-0 { background: #21262d; }', css)

# Remove flex: 1 from grid and week to avoid stretching
css = re.sub(r'\.contrib-grid\s*\{\s*display:\s*flex;\s*gap:\s*4px;\s*flex:\s*1;\s*\}', '.contrib-grid {\n  display: flex;\n  gap: 4px;\n  flex: none;\n}', css)
css = re.sub(r'\.contrib-week\s*\{\s*display:\s*flex;\s*flex-direction:\s*column;\s*gap:\s*4px;\s*flex:\s*1;\s*\}', '.contrib-week {\n  display: flex;\n  flex-direction: column;\n  gap: 4px;\n  flex: none;\n}', css)

# Fix hover slightly so it has a subtle glow but no outline that shifts layout
css = re.sub(
    r'\.contrib-cell:hover \{ outline: 1px solid rgba\(255,255,255,0\.4\); z-index: 10; \}',
    '.contrib-cell:hover { box-shadow: 0 0 0 1px rgba(255,255,255,0.4); z-index: 10; }',
    css
)


with open('styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
