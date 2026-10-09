"""Independent sticker geometry replay; does not use cubing.js."""
import json,time
from pathlib import Path
V=(-3,-1,1,3);slots=[]
for axis in range(3):
 for side in (-1,1):
  for a in V:
   for b in V:
    p=[0,0,0];p[axis]=3*side;p[(axis+1)%3]=a;p[(axis+2)%3]=b
    n=[0,0,0];n[axis]=side;slots.append((tuple(p),tuple(n)))
index={s:i for i,s in enumerate(slots)}
def rotate(v,axis,q):
 v=list(v)
 for _ in range(q%4):
  a,b=(axis+1)%3,(axis+2)%3;v[a],v[b]=-v[b],v[a]
 return tuple(v)
cache={}
def permutation(token):
 if token in cache:return cache[token]
 inner=token.startswith('2');t=token[1:] if inner else token;f=t[0]
 axis,side={'U':(1,1),'D':(1,-1),'R':(0,1),'L':(0,-1),'F':(2,1),'B':(2,-1),'x':(0,1),'y':(1,1),'z':(2,1)}[f]
 amount=2 if '2' in t[1:] else -1 if t.endswith("'") else 1;q=-side*amount
 out=list(range(96))
 for i,(p,n) in enumerate(slots):
  if f in 'xyz' or p[axis]==side*(1 if inner else 3):out[index[(rotate(p,axis,q),rotate(n,axis,q))]]=i
 cache[token]=out;return out
root=Path(__file__).parent;cases=json.loads((root/'geometric-replays.json').read_text());failed=[];start=time.time()
stage_checks=0
milestones=[('centre',-3),('wing',-3),('corner',-3),('centre',-1),('wing',-1),('centre',1),('wing',1),('centre',3),('corner',3),('wing',3)]
def kind(p):return {1:'centre',2:'wing',3:'corner'}[sum(abs(v)==3 for v in p)]
reference=permutation('x2')
for i,case in enumerate(cases):
 state=list(range(96))
 for token in case['scramble'].split():state=[state[j] for j in permutation(token)]
 protected=set();bad=False
 for stage_index,stage in enumerate(case.get('stages',[])):
  for token in stage['moves'].split():state=[state[j] for j in permutation(token)]
  if stage_index==9:
   protected=set(range(96));ref=list(range(96))
  else:
   piece_kind,layer=milestones[stage_index]
   protected.update(j for j,(p,n) in enumerate(slots) if kind(p)==piece_kind and p[1]==layer)
   ref=reference
  if any(slots[state[j]][1]!=slots[ref[j]][1] for j in protected):bad=True
  stage_checks+=1
 if not case.get('stages'):
  for token in case['solution'].split():state=[state[j] for j in permutation(token)]
 if bad or any(slots[state[j]][1]!=slots[j][1] for j in range(96)):failed.append(i)
report={'independent_model':'integer coordinate sticker rotations; no cubing.js','stage_boundary_checks':stage_checks,'cases':len(cases),'passed':len(cases)-len(failed),'failures':failed,'elapsed_seconds':round(time.time()-start,3)}
(root/'geometric-verification.json').write_text(json.dumps(report,indent=2));print(json.dumps(report,indent=2));assert not failed
