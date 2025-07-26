from pathlib import Path

print('Current file would be at:', Path('utils/llm/anth.py').absolute())
print('Parent dirs:')
p = Path('utils/llm/anth.py').absolute()
for i in range(6):
    print(f'  Level {i}: {p}')
    p = p.parent
EOF < /dev/null
