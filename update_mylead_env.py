with open('/var/www/affiliate/.env', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('MYLEAD_API_KEY='):
        new_lines.append('MYLEAD_API_KEY="6a15c6c3be94177b3dde07ec68d40d715a228df04b1d47668bb1dd64f1288b38"\n')
    else:
        new_lines.append(line)

with open('/var/www/affiliate/.env', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("UPDATED")

