import os
import re
important={".go",".java",".rs",".js",".ts",".cs",".cpp",".c",".py"}
regex_string=r"nr\d+"
#regex_string+="["+"|".join(["\\"+s for s in important])+"]"
print(regex_string)
max_nr=0
last_nr=None
nr_ext=dict()
ext_nr=dict()

for p in os.walk("."):
    for f in p[2]:
        if any([f.endswith(i) for i in important]):
            nr=0
            ext=[i  for i in important if f.endswith(i)][0]
            m= re.search(regex_string,f)
            nr=int(re.search(r"\d+",m.string).group(0))  if m!=None else nr
            m= re.search(regex_string,p[0])
            nr=(int(re.search(r"\d+",m.string).group(0)))  if m!=None else nr
            max_nr=max(nr,max_nr)
            if ext not in ext_nr:
                ext_nr[ext]=set()
            ext_nr[ext].add(nr)
            nr_ext[nr]=ext
print(max_nr)
for ext in ext_nr:
    mx=max(ext_nr[ext])
    print(ext,max_nr-mx)