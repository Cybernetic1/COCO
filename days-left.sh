start_date="today"
end_date="May 17, 2023"

sdate=$(date --date="$start_date" '+%s')
edate=$(date --date="$end_date"   '+%s')
days=$(( (edate - sdate) / 86400 ))
echo "$days days between $start_date and $end_date"
