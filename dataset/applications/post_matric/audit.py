import json, csv

with open('applications.json') as f:
    apps = json.load(f)

print('Total records:', len(apps))

ids = [a['application_id'] for a in apps]
print('Unique IDs:', len(set(ids)))

tags = {}
for a in apps:
    for t in a['scenario_tags']:
        tags[t] = tags.get(t, 0) + 1
print('Tags:', tags)

mult_def = [a for a in apps if 'MULTIPLE_DEFICIENCIES' in a['scenario_tags']]
print('MULTIPLE_DEFICIENCIES count:', len(mult_def))
for m in mult_def:
    issues = []
    if m['income']['family_income_annum'] > 250000:
        issues.append('Income above limit')
    docs = [d['document_type'] for d in m['documents_expected']]
    if 'ST_CERTIFICATE' not in docs:
        issues.append('Missing ST_CERTIFICATE')
    print(f"{m['application_id']}: {issues}")

with open('applications.csv') as f:
    r = list(csv.reader(f))
    print('CSV rows (incl header):', len(r))
