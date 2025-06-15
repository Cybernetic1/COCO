#!/usr/bin/env python3
# Merge lines that do not end with sentence-ending punctuation, even if they end with a quote.
# Usage: python3 merge_sentences_by_punctuation.py input.txt output.txt

import sys
import re

def is_sentence_end(line):
    # Returns True if the line ends with .!? optionally followed by a closing quote or whitespace
    return bool(re.search(r'[.!?](\"|”|’|』|」|\'|\s)*$', line.rstrip()))

def merge_sentences(lines):
    output = []
    buffer = ''
    for line in lines:
        line_stripped = line.strip()
        if not line_stripped:
            continue
        if buffer:
            buffer += ' ' + line_stripped
        else:
            buffer = line_stripped
        if is_sentence_end(line_stripped):
            output.append(buffer)
            buffer = ''
    if buffer:
        output.append(buffer)
    return output

def main():
    if len(sys.argv) != 3:
        print('Usage: python3 merge_sentences_by_punctuation.py input.txt output.txt')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        lines = f.readlines()
    merged = merge_sentences(lines)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(merged))
    print(f'Merged sentences in {sys.argv[1]} and wrote to {sys.argv[2]}')

if __name__ == '__main__':
    main()
