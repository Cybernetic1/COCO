#!/usr/bin/env python3
# Split a book into lines of natural language sentences, one per line using NLTK.
# Attempts to avoid splitting section/chapter titles as sentences.
# Usage: python3 split_sentences2.py input.txt output.txt

import sys
import re
import nltk
from nltk.tokenize import sent_tokenize

def is_title(line):
    # Heuristic: Titles are short, all-caps, or surrounded by blank lines, or have 'chapter', 'section', or are centered
    line_stripped = line.strip()
    if not line_stripped:
        return False
    if len(line_stripped) < 4:
        return True
    if line_stripped.isupper():
        return True
    if re.match(r'^(chapter|section|part|book)\b', line_stripped, re.I):
        return True
    if re.match(r'^[IVXLC]+$', line_stripped):  # Roman numerals
        return True
    if len(line_stripped.split()) <= 4 and line_stripped == line_stripped.title():
        return True
    return False

def split_english_sentences(text):
    # Use NLTK's sentence tokenizer for robust sentence splitting
    lines = text.splitlines()
    output = []
    buffer = ''
    for line in lines:
        if is_title(line):
            if buffer.strip():
                output.extend(sent_tokenize(buffer.strip()))
                buffer = ''
            output.append(line.strip())
        else:
            if buffer:
                buffer += ' ' + line.strip()
            else:
                buffer = line.strip()
            # If line ends with sentence-ending punctuation, flush
            if re.search(r'[.!?](\"|”|\x00-\x1F)*$', line.strip()):
                output.extend(sent_tokenize(buffer.strip()))
                buffer = ''
    if buffer.strip():
        output.extend(sent_tokenize(buffer.strip()))
    return [s for s in output if s.strip()]

def main():
    if len(sys.argv) != 3:
        print('Usage: python3 split_sentences2.py input.txt output.txt')
        sys.exit(1)
    nltk.download('punkt', quiet=True)
    with open(sys.argv[1], 'rb') as f:
        raw = f.read()
    # Remove NULL bytes
    raw = raw.replace(b'\x00', b'')
    try:
        text = raw.decode('utf-8')
    except UnicodeDecodeError:
        text = raw.decode('utf-8', errors='replace')
    # Normalize line endings to LF
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    sentences = split_english_sentences(text)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(sentences))
    print(f'Split {sys.argv[1]} into {len(sentences)} sentences in {sys.argv[2]}')

if __name__ == '__main__':
    main()
