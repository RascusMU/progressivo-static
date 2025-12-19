import os
import re
from bs4 import BeautifulSoup

def clean_html_files(directory="."):
    # Selected images for the new gallery
    gallery_images = [
        "wp-content/uploads/2025/04/pexels-photo-12729168-12729168.jpg",
        "wp-content/uploads/2025/04/IMG_4393.webp",
        "wp-content/uploads/2025/04/pexels-photo-7235894-7235894-scaled.jpg",
        "wp-content/uploads/2025/04/g52543931d9244d74978ce65d94eace194792a76dbd37490d150e10bad3c0f1c8251c7ec68fcbce131e625f41b70cabc43cdac1eef10ecc145f5139743ac83d05_1280-3144300.jpg",
        "wp-content/uploads/2025/04/studenti1.webp",
        "wp-content/uploads/2025/04/pexels-photo-34600-1024x683.jpg",
        "wp-content/uploads/2025/04/pexels-photo-4144224-4144224.jpg",
        "wp-content/uploads/2025/04/pexels-photo-29402986-29402986-scaled.jpg",
        "wp-content/uploads/2025/04/mapa-svetabusines.webp",
        "wp-content/uploads/2025/04/pexels-photo-6914350-6914350-1-683x1024.jpg"
    ]

    # New gallery HTML section
    gallery_html = """
    <section id="modern-gallery" class="modern-gallery-section">
        <h2>Galerie</h2>
        <div class="gallery-grid">
    """

    for img_path in gallery_images:
        gallery_html += f"""
            <div class="gallery-item" data-full-src="{img_path}">
                <img src="{img_path}" loading="lazy" alt="Gallery Image">
            </div>
        """

    gallery_html += """
        </div>
    </section>
    """

    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".html"):
                filepath = os.path.join(root, file)
                print(f"Processing {filepath}...")

                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()

                soup = BeautifulSoup(content, "html.parser")

                # 1. Remove WordPress bloat
                for tag in soup.find_all(["link", "meta"]):
                    should_remove = False

                    # Remove generator
                    if tag.name == "meta" and tag.get("name") == "generator":
                        should_remove = True

                    # Remove wlwmanifest, edituri, shortlink, alternate json
                    elif tag.name == "link":
                        rels = tag.get("rel", [])
                        if isinstance(rels, str):
                            rels = [rels]

                        if any(r in ["wlwmanifest", "EditURI", "shortlink"] for r in rels):
                            should_remove = True
                        elif "alternate" in rels:
                            href = tag.get("href", "")
                            if "wp-json" in href or "xmlrpc" in href:
                                should_remove = True

                    if should_remove:
                        tag.decompose()

                # Remove wp-json scripts (generic catch-all for remaining api links)
                for tag in soup.find_all("link", href=re.compile(r"wp-json")):
                    tag.decompose()

                # 2. Inject new CSS/JS with relative paths
                head = soup.head
                if head:
                    # Calculate relative path to assets
                    rel_path = os.path.relpath(".", start=root)
                    if rel_path == ".":
                        asset_prefix = ""
                    else:
                        asset_prefix = rel_path + "/"

                    # Remove existing injected assets to avoid duplicates
                    for existing in head.find_all("link", href=re.compile(r"assets/css/gallery.css")):
                        existing.decompose()
                    for existing in head.find_all("script", src=re.compile(r"assets/js/gallery.js")):
                        existing.decompose()

                    new_css = soup.new_tag("link", rel="stylesheet", href=f"{asset_prefix}assets/css/gallery.css")
                    head.append(new_css)

                    new_js = soup.new_tag("script", src=f"{asset_prefix}assets/js/gallery.js", defer=None)
                    head.append(new_js)

                # 3. Add Gallery to index.html only
                if file == "index.html" and root == ".":
                    if not soup.find(id="modern-gallery"):
                        main = soup.find("main")
                        if main:
                            gallery_soup = BeautifulSoup(gallery_html, "html.parser")
                            main.append(gallery_soup)
                        else:
                            footer = soup.find("footer")
                            if footer:
                                gallery_soup = BeautifulSoup(gallery_html, "html.parser")
                                footer.insert_before(gallery_soup)

                # 4. Remove specific bloat inline styles (ONLY specific ones)
                # wp-block-library-inline-css is actually often needed for core blocks layout, so keeping it might be safer unless we replace it.
                # The user asked to "Clean up WordPress-specific code", but removing layout CSS breaks things.
                # I will NOT remove 'wp-block-library-inline-css' or 'global-styles-inline-css' this time to be safe.
                # I will only remove clearly useless ones if identified, but for now, better safe than broken.

                # 5. Fix links to wp-admin or wp-login if any
                for a in soup.find_all("a", href=True):
                    if "wp-admin" in a["href"] or "wp-login" in a["href"]:
                        a["href"] = "#"

                with open(filepath, "w", encoding="utf-8") as f:
                    f.write(str(soup))

if __name__ == "__main__":
    clean_html_files()
