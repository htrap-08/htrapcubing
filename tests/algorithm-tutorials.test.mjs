import test from 'node:test';
import assert from 'node:assert/strict';
import { algorithmBelongsTo, tutorialFor } from '../src/lib/algorithm-tutorials.ts';
import { algorithms } from '../src/lib/algorithms.ts';
const ids = ['2x2','3x3','4x4','5x5','6x6','7x7','8x8','9x9','10x10','pyraminx','megaminx','skewb','square1'];
test('each supported puzzle has its own learning path and algorithms',()=>{
  for(const id of ids){ const tutorial=tutorialFor(id); assert.ok(tutorial.lessons.length>=3,id);assert.ok(tutorial.notation.length>30,id);assert.match(tutorial.source,/^https:\/\//);assert.ok(algorithms.some(a=>algorithmBelongsTo(a,id)),id); }
});
test('cube filters never mix side puzzles or apply 4x4 parity to wider cubes',()=>{
  for(const a of algorithms){
    if(a.puzzle==='Square-1') assert.equal(algorithmBelongsTo(a,'3x3'),false);
    if(a.group==='Big cube parity') for(const id of ['2x2','3x3','5x5','6x6','7x7','8x8','9x9','10x10']) assert.equal(algorithmBelongsTo(a,id),false);
    if(algorithmBelongsTo(a,'2x2')) assert.match(a.moves,/^[URFDLB2' ]+$/);
  }
});
test('every displayed sequence is valid in its 3D preview parser', async()=>{
  const { Alg } = await import('cubing/alg');
  for (const a of algorithms.filter(a=>ids.some(id=>algorithmBelongsTo(a,id)))) assert.doesNotThrow(()=>Alg.fromString(a.moves.replace(/[·\n]/g,' ')),a.id);
});
