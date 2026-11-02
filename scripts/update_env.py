with open('/var/www/affiliate/.env', 'r', encoding='utf-8') as f:
    lines = f.readlines()
lines = [l for l in lines if not l.startswith('GA_PROMORADAR_PROPERTY_ID')]
lines.append('GA_PROMORADAR_PROPERTY_ID="559398262"\n')
with open('/var/www/affiliate/.env', 'w', encoding='utf-8') as f:
    f.writelines(lines)
print("UPDATED")
