import requests
import re
from bs4 import BeautifulSoup
import time
import os

# List of sci-fi writers (English, Chinese, Japanese)
writers = [
    # English
    "Philip K. Dick",
    "Ursula K. Le Guin",
    "Arthur C. Clarke",
    "Isaac Asimov",
    "William Gibson",
    "H. G. Wells",
    "Jules Verne",
    "Ray Bradbury",
    "Stanisław Lem",
    "Robert A. Heinlein",
    "Frank Herbert",
    "George Orwell",
    "Margaret Atwood",
    # Chinese
    "刘慈欣",
    "倪匡",
    # Japanese
    "村上春樹",
    "小松左京",
    "星新一",
    "山田正紀",
]

def get_wikiquote_url(name):
    base = "https://en.wikiquote.org/wiki/"
    url = base + name.replace(" ", "_")
    return url

def fetch_quotes(url, lang_hint=None):
    try:
        resp = requests.get(url, timeout=10)
        if resp.status_code != 200:
            return []
        soup = BeautifulSoup(resp.text, "html.parser")
        quotes = []
        # Only extract <li> elements that are in the first <ul> or <ol> after an <h2> or <h3> with 'Quotes' in the heading
        for header in soup.find_all(['h2', 'h3']):
            if header.get_text().lower().find('quote') != -1:
                # Find the next <ul> or <ol> sibling
                sib = header.find_next_sibling()
                while sib and sib.name not in ['ul', 'ol']:
                    sib = sib.find_next_sibling()
                if sib and sib.name in ['ul', 'ol']:
                    for li in sib.find_all('li', recursive=False):
                        for sup in li.find_all('sup'): sup.decompose()
                        for subul in li.find_all(['ul', 'ol']): subul.decompose()
                        text = li.get_text(strip=True)
                        # Filter out navigation, section titles, and short lines
                        nav_terms = [
                            'portal', 'wikimedia', 'version', 'toggle', 'commons', 'page information',
                            'download qr code', 'printable version', 'contact wikiquote', 'community portal',
                            'get shortened url', 'bahasa', 'oʻzbekcha', 'wikisource', 'subsection', 'about', 'information',
                            'speeches', 'interviews', 'section', 'trilogy', 'quotes about', 'sprawl', 'bridge',
                            'multilingual', '1quotes', '2quotes', '3quotes', '4quotes', '5quotes', '6quotes', '7quotes',
                            '8quotes', '9quotes', '0quotes', 'toggle', 'subsection', 'category', 'edit', 'navigation',
                            'main page', 'help', 'search', 'tools', 'languages', 'add links', 'related changes',
                            'what links here', 'special pages', 'permanent link', 'cite this page', 'recent changes',
                            'random page', 'upload file', 'create account', 'log in', 'preferences', 'watchlist',
                            'contributions', 'talk', 'user page', 'user talk', 'view history', 'view source', 'move',
                            'protect', 'delete', 'block user', 'unblock user', 'rollback', 'undo', 'purge',
                            'mark as patrolled', 'mark as reviewed', 'mark as unreviewed', 'mark as checked',
                            'mark as unchecked', 'mark as resolved', 'mark as unresolved', 'mark as done',
                            'mark as not done', 'mark as spam', 'mark as not spam', 'mark as vandalism',
                            'mark as not vandalism', 'mark as copyright', 'mark as not copyright', 'mark as duplicate',
                            'mark as not duplicate', 'mark as outdated', 'mark as not outdated', 'mark as inaccurate',
                            'mark as not inaccurate', 'mark as incomplete', 'mark as not incomplete', 'mark as unclear',
                            'mark as not unclear', 'mark as disputed', 'mark as not disputed', 'mark as controversial',
                            'mark as not controversial', 'mark as protected', 'mark as not protected',
                            'mark as semi-protected', 'mark as not semi-protected', 'mark as move-protected',
                            'mark as not move-protected', 'mark as create-protected', 'mark as not create-protected',
                            'mark as upload-protected', 'mark as not upload-protected', 'mark as autoreviewed',
                            'mark as not autoreviewed', 'mark as autopatrolled', 'mark as not autopatrolled', 'mark as bot',
                            'mark as not bot', 'mark as sysop', 'mark as not sysop', 'mark as admin', 'mark as not admin',
                            'mark as bureaucrat', 'mark as not bureaucrat', 'mark as checkuser', 'mark as not checkuser',
                            'mark as oversight', 'mark as not oversight', 'mark as steward', 'mark as not steward',
                            'mark as global sysop', 'mark as not global sysop', 'mark as global rollback',
                            'mark as not global rollback', 'mark as global renamer', 'mark as not global renamer',
                            'mark as global interface editor', 'mark as not global interface editor', 'mark as global bot',
                            'mark as not global bot', 'mark as translation admin', 'mark as not translation admin',
                            'mark as abuse filter', 'mark as not abuse filter', 'mark as abuse log', 'mark as not abuse log',
                            'mark as abuse filter helper', 'mark as not abuse filter helper', 'mark as abuse filter manager',
                            'mark as not abuse filter manager', 'mark as abuse filter editor', 'mark as not abuse filter editor',
                            'mark as abuse filter reviewer', 'mark as not abuse filter reviewer', 'mark as abuse filter maintainer',
                            'mark as not abuse filter maintainer', 'mark as abuse filter tester', 'mark as not abuse filter tester',
                            'mark as abuse filter user', 'mark as not abuse filter user', 'mark as abuse filter admin',
                            'mark as not abuse filter admin', 'mark as abuse filter steward', 'mark as not abuse filter steward',
                            'mark as abuse filter global', 'mark as not abuse filter global', 'mark as abuse filter local',
                            'mark as not abuse filter local', 'mark as abuse filter private', 'mark as not abuse filter private',
                            'mark as abuse filter public', 'mark as not abuse filter public', 'mark as abuse filter restricted',
                            'mark as not abuse filter restricted', 'mark as abuse filter unreviewed', 'mark as not abuse filter unreviewed',
                            'mark as abuse filter reviewed', 'mark as not abuse filter reviewed', 'mark as abuse filter done',
                            'mark as not abuse filter done', 'mark as abuse filter not done', 'mark as abuse filter spam',
                            'mark as not abuse filter spam', 'mark as abuse filter vandalism', 'mark as not abuse filter vandalism',
                            'mark as abuse filter copyright', 'mark as not abuse filter copyright', 'mark as abuse filter duplicate',
                            'mark as not abuse filter duplicate', 'mark as abuse filter outdated', 'mark as not abuse filter outdated',
                            'mark as abuse filter inaccurate', 'mark as not abuse filter inaccurate', 'mark as abuse filter incomplete',
                            'mark as not abuse filter incomplete', 'mark as abuse filter unclear', 'mark as not abuse filter unclear',
                            'mark as abuse filter disputed', 'mark as not abuse filter disputed', 'mark as abuse filter controversial',
                            'mark as not abuse filter controversial', 'mark as abuse filter protected', 'mark as not abuse filter protected',
                            'mark as abuse filter semi-protected', 'mark as not abuse filter semi-protected', 'mark as abuse filter move-protected',
                            'mark as not abuse filter move-protected', 'mark as abuse filter create-protected', 'mark as not abuse filter create-protected',
                            'mark as abuse filter upload-protected', 'mark as not abuse filter upload-protected', 'mark as abuse filter autoreviewed',
                            'mark as not abuse filter autoreviewed', 'mark as abuse filter autopatrolled', 'mark as not abuse filter autopatrolled',
                            'mark as abuse filter bot', 'mark as not abuse filter bot', 'mark as abuse filter sysop', 'mark as not abuse filter sysop',
                            'mark as abuse filter admin', 'mark as not abuse filter admin', 'mark as abuse filter bureaucrat',
                            'mark as not abuse filter bureaucrat', 'mark as abuse filter checkuser', 'mark as not abuse filter checkuser',
                            'mark as abuse filter oversight', 'mark as not abuse filter oversight', 'mark as abuse filter steward',
                            'mark as not abuse filter steward', 'mark as abuse filter global sysop', 'mark as not abuse filter global sysop',
                            'mark as abuse filter global rollback', 'mark as not abuse filter global rollback', 'mark as abuse filter global renamer',
                            'mark as not abuse filter global renamer', 'mark as abuse filter global interface editor',
                            'mark as not abuse filter global interface editor', 'mark as abuse filter global bot',
                            'mark as not abuse filter global bot', 'mark as abuse filter translation admin',
                            'mark as not abuse filter translation admin', 'mark as abuse filter abuse log',
                            'mark as not abuse filter abuse log', 'mark as abuse filter abuse filter', 'mark as not abuse filter abuse filter',
                        ]
                        if (len(text) > 15 and
                            not any(x in text.lower() for x in nav_terms)):
                            quotes.append(text)
        return quotes
    except Exception as e:
        print(f"Error fetching quotes from {url}: {e}")
        return []

def update_matrix_home_html(quotes, html_path):
    with open(html_path, 'r', encoding='utf-8') as f:
        html = f.read()
    pattern = re.compile(r'(const\s+sciFiQuotes\s*=\s*\[)(.*?)(\];)', re.DOTALL)
    def js_escape(q):
        return q.replace('"', '\\"')
    new_quotes = '\n' + '\n'.join('  "{}",'.format(js_escape(q)) for q in quotes) + '\n'
    new_html = re.sub(pattern, r'\1' + new_quotes + r'\3', html)
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f"Updated {html_path} with {len(quotes)} quotes.")

def main():
    all_quotes = []
    for name in writers:
        url = get_wikiquote_url(name)
        print(f"Fetching: {name} -> {url}")
        quotes = fetch_quotes(url)
        if not quotes:
            print(f"No quotes found for {name}")
        else:
            print(f"Found {len(quotes)} quotes for {name}")
            all_quotes.extend(quotes)
        time.sleep(1)
    html_path = os.path.join(os.path.dirname(__file__), 'matrix-home.html')
    update_matrix_home_html(all_quotes, html_path)

if __name__ == "__main__":
    main()
