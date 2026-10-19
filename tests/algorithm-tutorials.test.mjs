import test from 'node:test';
import assert from 'node:assert/strict';
import { algorithmBelongsTo, tutorialFor } from '../src/lib/algorithm-tutorials.ts';
import { algorithms } from '../src/lib/algorithms.ts';
const ids = ['2x2','3x3','4x4','5x5','6x6','7x7','8x8','9x9','10x10','pyraminx','megaminx','skewb','square1'];
test('each supported puzzle has a learning path; shared finishing algorithms are consolidated',()=>{
  for(const id of ids){ const tutorial=tutorialFor(id); assert.ok(tutorial.lessons.length>=3,id);assert.ok(tutorial.notation.length>30,id);assert.match(tutorial.source,/^https:\/\//);if(!/^(5|6|7|8|9|10)x/.test(id)) assert.ok(algorithms.some(a=>algorithmBelongsTo(a,id)),id); }
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

test('big-cube pages do not duplicate the 3x3 finishing library',()=>{
  for(const id of ['4x4','5x5','6x6','7x7','8x8','9x9','10x10'])
    for(const a of algorithms.filter(a=>algorithmBelongsTo(a,'3x3'))) assert.equal(algorithmBelongsTo(a,id),false);
});

test('4x4 PLL parity preserves centres, orientations and lower corners',async()=>{
  const { puzzles }=await import('cubing/puzzles');
  const k=await puzzles['4x4x4'].kpuzzle();
  const start=k.defaultPattern();
  const moves=algorithms.find(a=>a.id==='a-parity-pll').moves;
  const after=start.applyAlg(moves).patternData;
  assert.deepEqual(after.CENTERS,start.patternData.CENTERS);
  assert.ok(after.EDGES.orientation.every(v=>v===0));
  assert.ok(after.CORNERS.orientation.every(v=>v===0));
  assert.deepEqual(after.CORNERS.pieces.slice(4),start.patternData.CORNERS.pieces.slice(4));
  assert.notDeepEqual(after.EDGES.pieces,start.patternData.EDGES.pieces);
  assert.deepEqual(start.applyAlg(moves+' '+moves).patternData,start.patternData);
});
