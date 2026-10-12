/** Original, code-native scenery using Study Burger's established Ponpon artwork. */
export default function StudyGarden({className = ''}: {className?: string}) {
  return <div className={`study-garden ${className}`} aria-hidden="true">
    <svg className="garden-landscape" viewBox="0 0 1200 390" fill="none" preserveAspectRatio="xMidYMax slice">
      <circle cx="600" cy="156" r="137" fill="#F5CD45"/>
      <circle cx="600" cy="156" r="158" stroke="#F5CD45" strokeOpacity=".3" strokeDasharray="3 12"/>
      <path d="M0 258C150 143 274 140 424 266C620 390 787 76 1200 230V390H0Z" fill="#E5E0D1"/>
      <path d="M0 309C177 224 246 272 434 300C665 339 760 169 1200 300V390H0Z" fill="#C8AE64"/>
      <path d="M0 344C236 277 352 367 600 325C889 254 1054 340 1200 307V390H0Z" fill="#FAF8F0"/>
      <path d="M530 390C576 355 709 352 612 307" stroke="#E5E0D1" strokeWidth="24"/>
      <g stroke="#716F64" strokeWidth="3" strokeLinecap="round">
        <path d="M92 347V221M91 283L60 251M94 305L127 267M1080 340V195M1080 251L1048 224M1080 282L1121 251"/>
        <path d="M234 354V292M956 354V290M1005 365V330"/>
      </g>
      <g fill="#F5CD45">
        <ellipse cx="62" cy="247" rx="15" ry="25" transform="rotate(-40 62 247)"/><ellipse cx="126" cy="266" rx="15" ry="27" transform="rotate(40 126 266)"/>
        <ellipse cx="1048" cy="220" rx="15" ry="26" transform="rotate(-40 1048 220)"/><ellipse cx="1121" cy="250" rx="16" ry="30" transform="rotate(40 1121 250)"/>
      </g>
      {[{x:92,y:213,r:28},{x:1080,y:185,r:35},{x:234,y:285,r:18},{x:956,y:285,r:22},{x:1005,y:324,r:13}].map(({x,y,r})=><g key={x} transform={`translate(${x} ${y})`}>
        {[0,60,120,180,240,300].map(a=><ellipse key={a} cy={-r*.65} rx={r*.46} ry={r*.68} fill="#F5CD45" transform={`rotate(${a})`}/>)}
        <circle r={r*.39} fill="#716F64"/><circle r={r*.18} fill="#FFF1B8"/>
      </g>)}
      <g transform="translate(315 234) rotate(-9)">
        <rect width="124" height="84" rx="6" fill="#353630"/><path d="M12 13H56V69H12ZM65 13H110V69H65Z" fill="#FFFEF9"/>
        <path d="M61 4V78M22 30H46M22 40H46M75 30H99M75 40H99M75 50H91" stroke="#C8AE64" strokeWidth="3"/>
      </g>
      <g transform="translate(765 277) rotate(8)">
        <rect width="136" height="23" rx="5" fill="#716F64"/><rect x="9" y="-24" width="120" height="24" rx="4" fill="#F5CD45"/><rect x="20" y="-49" width="98" height="25" rx="4" fill="#FFFEF9"/>
        <path d="M32-36H105M23-12H116M16 12H120" stroke="#C8AE64" strokeWidth="2"/>
      </g>
      <g stroke="#F5CD45" strokeWidth="3"><path d="M230 104V126M219 115H241M919 92V116M907 104H931M365 66V82M357 74H373"/></g>
      <g fill="#FFF1B8"><circle cx="169" cy="164" r="4"/><circle cx="814" cy="121" r="4"/><circle cx="1005" cy="150" r="3"/></g>
    </svg>
    <img className="garden-ponpon" src="/ponpon.svg" width="400" height="400" alt="" fetchPriority="high" draggable={false}/>
    <span className="garden-note note-left">a little practice</span><span className="garden-note note-right">a little possibility</span>
  </div>;
}
