#!/usr/bin/env python3
# Join lines if an open double quote (") is not yet closed. Accept end-of-line as sentence end only after the quote is closed.
# Usage: python3 join_lines_double_quote.py input.txt output.txt

import sys

def join_lines_double_quote(lines):
    output = []
    buffer = ''
    quote_open = False
    quote_count = 0
    for line in lines:
        line_stripped = line.strip()
        # Count the number of double quotes in this line
        num_quotes = line_stripped.count('"')
        quote_count += num_quotes
        if not quote_open:
            buffer = line_stripped
            if num_quotes % 2 == 1:
                quote_open = True
            if not quote_open:
                output.append(buffer)
                buffer = ''
        else:
            buffer += ' ' + line_stripped
            if num_quotes % 2 == 1:
                quote_open = False
                output.append(buffer)
                buffer = ''
    if buffer:
        output.append(buffer)
    return output

def main():
    if len(sys.argv) != 3:
        print('Usage: python3 join_lines_double_quote.py input.txt output.txt')
        sys.exit(1)
    with open(sys.argv[1], 'r', encoding='utf-8') as f:
        lines = f.readlines()
    joined = join_lines_double_quote(lines)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='\n') as f:
        f.write('\n'.join(joined))
    print(f'Joined lines with open double quotes in {sys.argv[1]} and wrote to {sys.argv[2]}')

if __name__ == '__main__':
    main()
