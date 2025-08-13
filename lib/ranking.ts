export const clamp = (v:number,min=0,max=1)=>Math.max(min,Math.min(max,v));
export const norm = (v:number,min:number,max:number)=>clamp((v-min)/(max-min||1));
