#!/usr/bin/env python3
# Join lines if an open quote is not yet closed. Accept end-of-line as sentence end only after the quote is closed.
# Usage: python3 join_lines_open_quote.py input.txt output.txt

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


def find_open_quote(line):
    for oq in open_quotes:
        if oq in line:
            return oq
    return None

def count_quotes(line, oq, cq):
    return line.count(oq), line.count(cq)

def join_lines_open_quote(lines):
    output = []
    buffer = ''
    open_quote = None
    quote_balance = 0
    for line in lines:
        line_stripped = line.strip()
        if not open_quote:
            oq = find_open_quote(line_stripped)
            if oq:
                cq = quote_pairs[oq]
                oq_count, cq_count = count_quotes(line_stripped, oq, cq)
                quote_balance = oq_count - cq_count
                buffer = line_stripped
                open_quote = oq if quote_balance > 0 else None
                if not open_quote:
                    output.append(buffer)
                    buffer = ''
            else:
                output.append(line_stripped)
        else:
            cq = quote_pairs[open_quote]
            oq_count, cq_count = count_quotes(line_stripped, open_quote, cq)
            quote_balance += oq_count - cq_count
            buffer += ' ' + line_stripped
            if quote_balance <= 0:
                output.append(buffer)
                buffer = ''
                open_quote = None
    if buffer:
        output.append(buffer)
    return output

def main():
    if len(sys.argv) != 3:
        print('Usage: python3 join_lines_open_quote.py input.txt output.txt')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        lines = f.readlines()
    joined = join_lines_open_quote(lines)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(joined))
    print(f'Joined lines with open quotes in {sys.argv[1]} and wrote to {sys.argv[2]}')

if __name__ == '__main__':
    main()
