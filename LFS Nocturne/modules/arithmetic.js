export default {
  name: "Arithmetic",
  desc: "addition · subtraction · multiplication · division · negatives",
  defaultTime: 8,
  levels: [
    {
      name: "easy add / sub", threshold: 5,
      gen() {
        const a = r(2,20), b = r(2,20), op = pick(['+','-']);
        if (op==='+') return { q:`${a} + ${b}`, answers:[{label:'',ans:a+b}], topic:'addition' };
        const x=Math.max(a,b), y=Math.min(a,b);
        return { q:`${x} − ${y}`, answers:[{label:'',ans:x-y}], topic:'subtraction' };
      }
    },
    {
      name: "multiplication ×12", threshold: 5,
      gen() {
        const a=r(2,12), b=r(2,12);
        return { q:`${a} × ${b}`, answers:[{label:'',ans:a*b}], topic:'multiplication' };
      }
    },
    {
      name: "division", threshold: 5,
      gen() {
        const b=r(2,12), ans=r(2,12);
        return { q:`${b*ans} ÷ ${b}`, answers:[{label:'',ans}], topic:'division' };
      }
    },
    {
      name: "mixed medium", threshold: 5,
      gen() {
        const t=r(0,2);
        if (t===0) { const a=r(10,99),b=r(2,9); return { q:`${a} × ${b}`, answers:[{label:'',ans:a*b}], topic:'multiplication' }; }
        if (t===1) { const b=r(2,9),ans=r(10,20); return { q:`${b*ans} ÷ ${b}`, answers:[{label:'',ans}], topic:'division' }; }
        const a=r(20,99),b=r(20,99);
        return { q:`${a} + ${b}`, answers:[{label:'',ans:a+b}], topic:'addition' };
      }
    },
    {
      name: "negatives", threshold: 5,
      gen() {
        const a=r(1,12)*pick([-1,1]), b=r(1,12)*pick([-1,1]), op=pick(['+','-','×']);
        const fa=a<0?`(${a})`:String(a), fb=b<0?`(${b})`:String(b);
        if (op==='+') return { q:`${fa} + ${fb}`, answers:[{label:'',ans:a+b}], topic:'negatives' };
        if (op==='-') return { q:`${fa} − ${fb}`, answers:[{label:'',ans:a-b}], topic:'negatives' };
        return { q:`${fa} × ${fb}`, answers:[{label:'',ans:a*b}], topic:'negatives' };
      }
    },
    {
      name: "speed round", threshold: 9999,
      gen() { return this.levels[pick([0,1,2,3,4])].gen.call(this); }
    }
  ]
};

function r(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }