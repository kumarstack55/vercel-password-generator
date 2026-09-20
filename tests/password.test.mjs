import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('../src/lib/password.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.ES2020}}).outputText;
const {DEFAULTS,GROUPS,generate,validate,readSettings} = await import('data:text/javascript;base64,'+Buffer.from(compiled).toString('base64'));
test('defaults generate ten 64-character passwords with letters and digits only',()=>{
 for(const p of generate(DEFAULTS)){assert.equal(p.length,64);assert.match(p,/^[A-Za-z0-9]+$/);for(const key of DEFAULTS.groups)assert.ok([...p].some(c=>GROUPS[key].chars.includes(c)));}
 assert.equal(generate(DEFAULTS).length,10);
});
test('all 32 ASCII symbols, no spaces or alphanumerics',()=>{assert.equal(GROUPS.symbols.chars.length,32);assert.equal(new Set(GROUPS.symbols.chars).size,32);assert.doesNotMatch(GROUPS.symbols.chars,/[A-Za-z0-9\s]/);});
test('excluded characters never appear, including duplicated exclusions',()=>{
 const s={...DEFAULTS,excluded:'0O1Il!0O1Il!',length:'128'};
 for(const p of generate(s)){assert.equal(p.length,128);assert.ok(![...p].some(c=>s.excluded.includes(c)));}
});
test('impossible and malformed settings are rejected',()=>{
 for(const patch of [{length:''},{length:'1.5'},{length:'129'},{groups:[]},{length:'2'},{excluded:Object.values(GROUPS).map(g=>g.chars).join('')},{excluded:GROUPS.digits.chars}]){const s={...DEFAULTS,...patch};assert.ok(Object.keys(validate(s)).length);assert.throws(()=>generate(s));}
});
test('one-character and optional-class cases work',()=>{
 assert.deepEqual(generate({...DEFAULTS,groups:['digits'],length:'1',excluded:'123456789'}),Array(10).fill('0'));
 for(const p of generate({...DEFAULTS,length:'1',required:false,excluded:GROUPS.digits.chars}))assert.equal(p.length,1);
});
test('required classes are included even with severe exclusions',()=>{
 const excluded=Object.values(GROUPS).map(g=>g.chars).join('').replaceAll('A','').replaceAll('a','').replaceAll('0','').replaceAll('!','');
 for(const p of generate({...DEFAULTS,groups:Object.keys(GROUPS),excluded,length:'4'}))assert.equal([...p].sort().join(''),'!0Aa');
});
test('persisted settings are whitelisted and malformed data rejected',()=>{
 assert.deepEqual(readSettings({...DEFAULTS,count:'5',passwords:['secret'],copiedIndex:1}),DEFAULTS);
 for(const value of [null,[],{}, {...DEFAULTS,groups:['toString']},{...DEFAULTS,groups:['upper','upper']},{...DEFAULTS,length:64}])assert.equal(readSettings(value),null);
});
test('secure randomness failure never falls back to another source',()=>{
 const original=crypto.getRandomValues;
 crypto.getRandomValues=()=>{throw new Error('unavailable');};
 try{assert.throws(()=>generate(DEFAULTS),/unavailable/);}finally{crypto.getRandomValues=original;}
});
