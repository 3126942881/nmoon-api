const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const allowed = new Set(['openai_official','azure_openai','anthropic_official','nmoon','deepseek','moonshot','kimi','kimi_coding','zhipu_glm','zhipu_glm_en','zhipu_glm_global','volcengine_agentplan','byteplus','doubaoseed','qianfan_coding','baidu_qianfan_coding','baidu_qianfan_coding_plan','bailian','bailian_coding','stepfun','stepfun_en','stepfun_global','modelscope','kat_coder','longcat','minimax','minimax_en','minimax_global','bailing','xiaomi_mimo','xiaomi_mimo_token_plan','xiaomi_mimo_token_plan_cn','nvidia','aws_bedrock_aksk','aws_bedrock_api_key']);
const constants = {DEEPSEEK_API_PROVIDER_ID:'deepseek',MINIMAX_API_PROVIDER_ID:'minimax',MINIMAX_EN_API_PROVIDER_ID:'minimax_en',OPENCODE_GO_API_PROVIDER_ID:'opencode_go',CLAUDE_APIKEY_FUN_PROVIDER_ID:'nmoon',CLAUDE_DESKTOP_GATEWAY_APIKEY_FUN_PROVIDER_ID:'nmoon'};
const backup = '.build-tools/presets-before-cleanup';
for (const file of ['codexProviderPresets.ts','claudeProviderPresets.ts','claudeDesktopProviderPresets.ts']) {
 const dest=path.join('src/utils',file); let source=fs.readFileSync(dest,'utf8');
 fs.mkdirSync(backup,{recursive:true}); fs.copyFileSync(dest,path.join(backup,file));
 const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true); const edits=[]; const removed=[];
 function visit(n) {
  if(ts.isVariableDeclaration(n) && n.name.getText(ast).endsWith('PROVIDER_PRESETS') && n.initializer && ts.isArrayLiteralExpression(n.initializer)) {
   const array=n.initializer; const kept=[];
   for(const element of array.elements) {
    if(ts.isSpreadElement(element)) {kept.push(element.getText(ast));continue;}
    const obj=ts.isCallExpression(element)?element.arguments[0]:element;
    if(!ts.isObjectLiteralExpression(obj)) throw Error('Unknown preset');
    const idProp=obj.properties.find(p=>p.name?.getText(ast)==='id');
    const id=ts.isStringLiteral(idProp.initializer)?idProp.initializer.text:constants[idProp.initializer.getText(ast)];
    if(!id) throw Error('Unknown id');
    if(allowed.has(id)) {
     let text=element.getText(ast);
     // Remove upstream referral/tracking parameters from official signup links.
     text=text.replace(/https:\/\/[^\s'"`]+/g, url=>url.split('?')[0]);
     // Manufacturer accounts should not retain affiliate-star styling.
     if(id!=='nmoon') text=text.replace(/\n\s*isPartner: true,?/g,'');
     kept.push(text);
    } else removed.push(id);
   }
   edits.push({start:array.getStart(ast),end:array.end,text:'[\n  '+kept.join(',\n  ')+',\n]'});
  }
  ts.forEachChild(n,visit);
 }
 visit(ast);
 for(const e of edits.sort((a,b)=>b.start-a.start))source=source.slice(0,e.start)+e.text+source.slice(e.end);
 fs.writeFileSync(dest,source);
 console.log(file+': removed '+removed.length+' presets: '+removed.join(', '));
}
