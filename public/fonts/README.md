# Lama Sans

`.woff2` files are subsets of the `.woff` originals (Latin-1, Arabic, Arabic
presentation forms, common punctuation and arrows; all OpenType features kept),
about 21% smaller. Rendering was checked pixel-identical against the originals.
The `.woff` files stay as the full-coverage fallback.

To regenerate after changing a `.woff`, use fontTools `subset` with the same
unicode ranges and `layout_features=['*']`, `flavor='woff2'`.
