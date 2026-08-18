import urllib.request
import json
import random
from bs4 import BeautifulSoup

url = 'https://jaipur.manipal.edu/muj-faculties.php'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
except Exception as e:
    print("Error fetching URL:", e)
    exit(1)

soup = BeautifulSoup(html, 'html.parser')

faculties = []
blocks = ['AB1', 'AB2', 'AB3', 'TMA Pai']

boxes = soup.find_all('div', class_='home-faculty-box')
print(f"Found {len(boxes)} faculty boxes.")

for idx, box in enumerate(boxes):
    img_tag = box.find('img')
    photo = img_tag['src'] if img_tag and 'src' in img_tag.attrs else ''
    if photo and not photo.startswith('http'):
        photo = 'https://jaipur.manipal.edu/' + photo.lstrip('/')
        
    name_tag = box.find('h2')
    name = name_tag.text.strip() if name_tag else f'Faculty {idx}'
    # Clean up multiple spaces
    name = ' '.join(name.split())
    
    desig_tag = box.find('h3')
    designation = desig_tag.text.strip() if desig_tag else ''
    designation = ' '.join(designation.split())
    
    dept_tag = box.find('p')
    department = dept_tag.text.strip() if dept_tag else ''
    department = ' '.join(department.split())
    # Remove prefix "Department of" for cleaner display
    if department.lower().startswith('department of '):
        department = department[14:]
    
    is_hod = 'HoD' in designation or 'HOD' in designation
    
    block = random.choice(blocks)
    floor_num = random.randint(0, 5)
    floor_str = 'Ground Floor' if floor_num == 0 else f"{floor_num}st Floor" if floor_num == 1 else f"{floor_num}nd Floor" if floor_num == 2 else f"{floor_num}rd Floor" if floor_num == 3 else f"{floor_num}th Floor"
    cabin_num = f"{floor_num}{random.randint(10, 99):02d}"
    
    fac = {
        'id': f'fac-{idx+1:04d}',
        'name': name,
        'photo': photo,
        'designation': designation,
        'department': department,
        'facultyCategory': 'Regular',
        'block': block,
        'cabinNumber': cabin_num,
        'floor': floor_str,
        'email': '',
        'phone': '',
        'officeHours': [],
        'subjects': [],
        'researchAreas': [],
        'qualifications': [],
        'bio': '',
        'status': 'Available',
        'lastUpdated': '',
    }
    if is_hod:
        fac['isHOD'] = True
    faculties.append(fac)

with open('src/lib/mock-data.ts', 'r') as f:
    content = f.read()

start_idx = content.find('export const mockFaculty: Faculty[] = [')
if start_idx != -1:
    before = content[:start_idx]
    # Replace the rest of the file
    after = 'export const mockFaculty: Faculty[] = ' + json.dumps(faculties, indent=2) + ';\n'
    with open('src/lib/mock-data.ts', 'w') as f:
        f.write(before + after)
    print(f"Successfully wrote {len(faculties)} faculties to src/lib/mock-data.ts")
else:
    print("Error: Could not find mockFaculty declaration.")
