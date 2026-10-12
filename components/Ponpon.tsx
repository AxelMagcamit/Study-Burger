/** Lightweight, code-native illustration inspired by Ponpon's sunflower collar. */
export default function Ponpon({className='',decorative=false}:{className?:string;decorative?:boolean}) {
  return <img className={`ponpon-mascot ${className}`} src="/ponpon.svg" width={400} height={400} alt={decorative?'':'Ponpon, a round gray cat wearing a yellow sunflower collar'} draggable={false}/>;
}
