import fs from "node:fs";
for (const f of process.argv.slice(2)) {
  const qs = JSON.parse(fs.readFileSync(f, "utf8")).questions;
  console.log(f.split("/").pop());
  let L=0,S=0,F=0;
  for (const q of qs) {
    const c = q.options.filter(o=>q.answer.includes(o.id)).map(o=>o.text.length);
    const w = q.options.filter(o=>!q.answer.includes(o.id)).map(o=>o.text.length);
    const lens=q.options.map(o=>o.text.length);
    const longest=Math.max(...c)>Math.max(...w), shortest=Math.min(...c)<Math.min(...w);
    const first=q.answer.includes(q.options[0].id);
    L+=longest;S+=shortest;F+=first;
    console.log(" ",q.id,q.type,"len",lens.join("/"),"ratio",(Math.max(...lens)/Math.min(...lens)).toFixed(2),longest?"LONGEST":"",shortest?"SHORTEST":"",first?"FIRST":"");
  }
  console.log("  longest",L,"shortest",S,"first",F,"of",qs.length);
}
