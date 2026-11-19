// Text between the markers is literal, including paragraph breaks and surrounding spaces.
export function parseStoryCopy(markdown) {
    const entries=new Map();
    const source=markdown.replace(/\r\n?/g,'\n').replace(/^([a-z][\w-]*(?:\.[\w-]+)+)$/gm,'`$1`');
    // Visible IDs survive copying rendered Markdown into a text editor.
    const blocks=source.includes('<!-- copy:') ? source.matchAll(/^<!-- copy:([\w.-]+) -->\n([\s\S]*?)\n<!-- endcopy -->$/gm)
        : (source.trimEnd()+'\n\n').matchAll(/^`([\w.-]+)`\n\n([\s\S]*?)\n\n(?=`[\w.-]+`\n|#{1,6} |(?![\s\S]))/gm);
    for(const [,key,value] of blocks){
        if(entries.has(key))throw new Error('Duplicate story entry '+key);
        entries.set(key,value);
    }
    if(!entries.size)throw new Error('Empty story manuscript');
    return (key,...values)=>{
        if(!entries.has(key))throw new Error('Missing story entry '+key);
        const value=entries.get(key);
        return values.length?value.replace(/〔(\d+)〕/g,(_,i)=>String(values[Number(i)-1])):value;
    };
}
export function applyStoryLabels(doc,copyText){
    for(const el of doc.querySelectorAll('[data-copy]')){
        for(const pair of el.dataset.copy.split(' ')){
            const [node,key]=pair.split(':');
            if(node==='aria')el.setAttribute('aria-label',copyText(key));
            else el.childNodes[Number(node)].nodeValue=copyText(key);
        }
    }
}
