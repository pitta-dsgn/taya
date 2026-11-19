import {readFile,writeFile,readdir} from 'node:fs/promises';
const root=new URL('./',import.meta.url),read=p=>readFile(new URL(p,root),'utf8');
let html=await read('index.html'),css=await read('styles.css'),app=(await read('app.mjs')).replace(/^import .*;\n/gm,''),model=(await read('model.mjs')).replaceAll('export ','')+'\n'+(await read('conversation.mjs')).replaceAll('export ','')+'\n'+(await read('playback.mjs')).replaceAll('export ','');
const icons={};for(const n of await readdir(new URL('./assets/icons/',root))){if(n.endsWith('.svg'))icons[n.slice(0,-4)]='data:image/svg+xml;base64,'+Buffer.from(await read('assets/icons/'+n)).toString('base64');}
app=app.replace('const icon=n=>',`const inlineAssets=${JSON.stringify(icons)};const icon=n=>`).replace("url('./assets/icons/${n}.svg')","url('${inlineAssets[n]}')").replaceAll('src="./assets/icons/${x}.svg"','src="${inlineAssets[x]}"');
for(const [name,uri] of Object.entries(icons)){html=html.replaceAll('./assets/icons/'+name+'.svg',uri);app=app.replaceAll('./assets/icons/'+name+'.svg',uri);}
html=html.replace(/<link rel="stylesheet"[^>]+>/,()=>'<style>'+css+'</style>').replace(/<script type="module" src="[^"]+"><\/script>/,()=>'<script type="module">'+model+'\n'+app+'</script>');await writeFile(new URL('./preview.html',root),html);
