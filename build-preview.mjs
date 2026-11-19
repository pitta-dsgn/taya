import {readFile,writeFile} from 'node:fs/promises';
let html=await readFile(new URL('./index.html',import.meta.url),'utf8');
const css=await readFile(new URL('./styles.css',import.meta.url),'utf8');
let model=(await readFile(new URL('./model.mjs',import.meta.url),'utf8')).replaceAll('export ','');
let app=(await readFile(new URL('./app.mjs',import.meta.url),'utf8')).replace(/^import .*;\n/,'');
html=html.replace('<link rel="stylesheet" href="./styles.css?v=2">',()=>'<style>'+css+'</style>').replace('<script type="module" src="./app.mjs?v=2"></script>',()=>'<script type="module">'+model+'\n'+app+'</script>');
const names=['taya','home','payments','city','chat','showcase'];
for(const n of names){const raw=await readFile(new URL('./assets/'+n+'.svg',import.meta.url),'utf8');const uri='data:image/svg+xml;base64,'+Buffer.from(raw).toString('base64');html=html.replaceAll('./assets/'+n+'.svg',uri);}
// Navigation filenames are interpolated at runtime in the source module.
const nav=Object.fromEntries(await Promise.all(names.map(async n=>[n,'data:image/svg+xml;base64,'+Buffer.from(await readFile(new URL('./assets/'+n+'.svg',import.meta.url))).toString('base64')])));
html=html.replace('const paths=',()=>`const inlineAssets=${JSON.stringify(nav)};\nconst paths=`).replace('src="./assets/${x}.svg"','src="${inlineAssets[x]}"');
await writeFile(new URL('./preview.html',import.meta.url),html);
