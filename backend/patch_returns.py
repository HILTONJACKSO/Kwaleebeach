
import os

filepath = r'c:\Users\User\Pictures\Hotel-development\Yarvo-HMS\frontend\app\staff\returns\page.tsx'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Order Deny Button
order_pattern = '''                                    <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                        <XCircle size={20} />
                                    </button>'''

order_replacement = '''                                    <button 
                                        onClick={() => handleRejectOrder(ret.id)}
                                        className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"
                                        title="Deny Return"
                                    >
                                        <XCircle size={20} />
                                    </button>'''

# Replace Pass Deny Button
pass_pattern = '''                                    <button className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100">
                                        <XCircle size={20} />
                                    </button>'''
# Note: Since they are identical, we might need a more unique approach if we only want to replace one.
# But we want to replace BOTH. So replace the first occurrence, then the next.

# Let's find all occurrences
count = content.count(order_pattern)
print(f"Found {count} occurrences of the button pattern.")

new_content = content.replace(order_pattern, order_replacement)

# Wait, the handleRejectPass vs handleRejectOrder differs.
# Let's do it more surgically.

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Order Reject: find lines 274-276 (1-indexed)
# In 0-indexed: 273-275

new_lines = []
for i, line in enumerate(lines):
    if i == 273: # button start
        new_lines.append('                                    <button \n')
        new_lines.append('                                        onClick={() => handleRejectOrder(ret.id)}\n')
        new_lines.append('                                        className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"\n')
        new_lines.append('                                        title="Deny Return"\n')
        new_lines.append('                                    >\n')
    elif i == 274: # XCircle line
        new_lines.append(line)
    elif i == 275: # button end
        new_lines.append(line)
    elif i == 327: # pass button start (shifted by 4 lines if we added the above? No, i is based on original lines)
        # Wait, if I iterate and skip original lines it's safer
        new_lines.append('                                    <button \n')
        new_lines.append('                                        onClick={() => handleRejectPass(ret.id)}\n')
        new_lines.append('                                        className="p-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-600 hover:text-white transition-all border border-rose-100"\n')
        new_lines.append('                                        title="Deny Return"\n')
        new_lines.append('                                    >\n')
    elif i == 328: # XCircle line
        new_lines.append(line)
    elif i == 329: # button end
        new_lines.append(line)
    else:
        new_lines.append(line)

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
