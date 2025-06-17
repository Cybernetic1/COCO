#!/usr/bin/env python3
# Convert horizontal Asian punctuation to vertical forms for vertical text rendering
# Usage: python3 convert_punct_vertical.py input.txt output.txt

import sys
import re

# Mapping of horizontal to vertical punctuation (common CJK)
PUNCT_MAP = {
    '，': '︐',  # U+FE10
    '。': '︒',  # U+FE12
    '、': '︑',  # U+FE11
    '：': '︓',  # U+FE13
    '；': '︔',  # U+FE14
    '！': '︕',  # U+FE15
    '？': '︖',  # U+FE16
    '（': '︵',  # U+FE35
    '）': '︶',  # U+FE36
    '《': '︽',  # U+FE3D
    '》': '︾',  # U+FE3E
    '〈': '︿',  # U+FE3F
    '〉': '﹀',  # U+FE40
    '「': '﹁',  # U+FE41
    '」': '﹂',  # U+FE42
    '『': '﹃',  # U+FE43
    '』': '﹄',  # U+FE44
    '…': '︙',  # U+FE19 (vertical ellipsis)
    # Japanese corner brackets
    '【': '︻',  # U+FE3B
    '】': '︼',  # U+FE3C
}

def convert_punct(text):
    return ''.join(PUNCT_MAP.get(ch, ch) for ch in text)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        print('Usage: python3 convert_punct_vertical.py input.txt output.txt')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as fin:
        content = fin.read()
    converted = convert_punct(content)
    with open(sys.argv[2], 'w', encoding='utf-8') as fout:
        fout.write(converted)
    print(f'Converted punctuation in {sys.argv[1]} and saved to {sys.argv[2]}')
