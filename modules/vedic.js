export default {
  name: "Vedic Math",
  desc: "×11 trick · squaring endings in 5 · near-100 multiply",
  defaultTime: 12,
  levels: [
    {
      name: "multiply by 11", threshold: 5,
      gen() {
        const a=r(10,99);
        return { q:`${a} × 11`, answers:[{label:'',ans:a*11}], topic:'vedic ×11' };
      }
    },
    {
      name: "square ending in 5", threshold: 5,
      gen() {
        const t=pick([15,25,35,45,55,65,75,85,95]);
        return { q:`${t}²`, answers:[{label:'',ans:t*t}], topic:'vedic n²' };
      }
    },
    {
      name: "near 100 multiply", threshold: 5,
      gen() {
        const a=r(88,99), b=r(88,99);
        return { q:`${a} × ${b}`, answers:[{label:'',ans:a*b}], topic:'vedic base-100' };
      }
    },
    {
      name: "mixed vedic", threshold: 9999,
      gen() { return this.levels[pick([0,1,2])].gen.call(this); }
    }
  ]
};

function r(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function pick(arr) { return arr[Math.floor(Math.random()*arr.length)]; }