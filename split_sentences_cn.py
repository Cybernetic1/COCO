#!/usr/bin/env python3
# Split a Chinese text into lines of sentences, one per line.
# Usage: python3 split_sentences_cn.py input.txt output.txt

import sys
import re

def split_chinese_sentences(text):
    # Split by Chinese sentence-ending punctuation: 。！？!? (optionally followed by quotes or whitespace)
    # Handles both full-width and half-width punctuation
    # Does not split inside titles (reuse is_title logic if needed)
    pattern = re.compile(r'([^。！？!?]+[。！？!?]+[”’"]*)')
    sentences = []
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        # Find all sentences in the line
        matches = pattern.findall(line)
        # If there is leftover text (not matched), add it as well
        matched_len = sum(len(m) for m in matches)
        if matches:
            sentences.extend([m.strip() for m in matches if m.strip()])
        if matched_len < len(line):
            leftover = line[matched_len:].strip()
            if leftover:
                sentences.append(leftover)
    return sentences

def main():
    if len(sys.argv) != 3:
        print('Usage: python3 split_sentences_cn.py input.txt output.txt')
        sys.exit(1)
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
    sentences = split_chinese_sentences(text)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(sentences))
    print(f'Split {sys.argv[1]} into {len(sentences)} sentences in {sys.argv[2]}')

if __name__ == '__main__':
    main()
