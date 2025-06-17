#!/usr/bin/env python3
# Combine lines that are part of the same quoted sentence (e.g., lines starting with a quotation mark and not ending with a closing quote)
# Usage: python3 combine_quoted_sentences.py input.txt output.txt

import sys

# Define pairs of opening and closing quotes
quote_pairs = {
    '"': '"',
    '“': '”',
    '‘': '’',
    '『': '』',
    '「': '」',
    "'": "'"
}
open_quotes = set(quote_pairs.keys())
close_quotes = set(quote_pairs.values())


def starts_with_open_quote(s):
    s = s.lstrip()
    for oq in open_quotes:
        if s.startswith(oq):
            return oq
    return None

def ends_with_close_quote(s, oq):
    if not oq:
        return False
    cq = quote_pairs[oq]
    return s.rstrip().endswith(cq)

def combine_quoted_sentences(lines):
    output = []
    buffer = ''
    inside_quote = False
    open_quote = None
    for line in lines:
        line_stripped = line.strip()
        if not inside_quote:
            oq = starts_with_open_quote(line_stripped)
            if oq:
                inside_quote = True
                open_quote = oq
                buffer = line_stripped
                # If it also ends with a closing quote, output immediately
                if ends_with_close_quote(line_stripped, open_quote):
                    output.append(buffer)
                    buffer = ''
                    inside_quote = False
                    open_quote = None
            else:
                output.append(line_stripped)
        else:
            buffer += ' ' + line_stripped
            if ends_with_close_quote(buffer, open_quote):
                output.append(buffer)
                buffer = ''
                inside_quote = False
                open_quote = None
    if buffer:
        output.append(buffer)
    return output

def main():
    if len(sys.argv) != 3:
        print('Usage: python3 combine_quoted_sentences.py input.txt output.txt')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        lines = f.readlines()
    combined = combine_quoted_sentences(lines)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(combined))
    print(f'Combined quoted sentences in {sys.argv[1]} and wrote to {sys.argv[2]}')

if __name__ == '__main__':
    main()
