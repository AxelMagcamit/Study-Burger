export type PonponMood='welcome'|'focused'|'thinking'|'celebrate'|'sleepy'|'concerned'|'curious';
const descriptions:Record<PonponMood,string>={welcome:'Ponpon smiles in his sunflower collar',focused:'Ponpon reads a book',thinking:'Ponpon thinks while holding a flashcard',celebrate:'Ponpon celebrates your progress',sleepy:'Ponpon rests with his eyes closed',concerned:'Ponpon looks concerned',curious:'Ponpon looks through a magnifying glass'};
export default function Ponpon({className='',decorative=false,mood='welcome',animate=false}:{className?:string;decorative?:boolean;mood?:PonponMood;animate?:boolean}) {
 return <img className={`ponpon-mascot mood-${mood} ${animate?'ponpon-animated':''} ${className}`} src={`/ponpon/${mood}.svg`} width={400} height={400} alt={decorative?'':descriptions[mood]} draggable={false}/>;
}
