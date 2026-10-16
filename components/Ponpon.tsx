export type PonponMood = 'welcome' | 'focused' | 'thinking' | 'celebrate' | 'sleepy' | 'concerned' | 'curious';
const descriptions: Record<PonponMood, string> = {
  welcome: 'Ponpon waves in his sunflower collar', focused: 'Ponpon reads a book',
  thinking: 'Ponpon thinks while holding a flashcard', celebrate: 'Ponpon celebrates your progress',
  sleepy: 'Ponpon rests with his eyes closed', concerned: 'Ponpon gives an encouraging nod',
  curious: 'Ponpon looks through a magnifying glass',
};

// Original Ponpon paths, separated into a small skeletal rig. Keep the face,
// sunflower petals and seated proportions consistent with public/ponpon/*.svg.
export default function Ponpon({className = '', decorative = false, mood = 'welcome', animate = false}: {
  className?: string; decorative?: boolean; mood?: PonponMood; animate?: boolean;
}) {
  const closedEyes = mood === 'sleepy' || mood === 'celebrate';
  return <svg className={`ponpon-mascot ponpon-rig mood-${mood} ${animate ? 'ponpon-animated' : ''} ${className}`}
    xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width={400} height={400} fill="none"
    role={decorative ? undefined : 'img'} aria-label={decorative ? undefined : descriptions[mood]}
    aria-hidden={decorative || undefined} focusable="false">
    <ellipse className="ponpon-part ponpon-shadow" cx="202" cy="363" rx="130" ry="15" fill="#514940" opacity=".10"/>
    <g className="ponpon-part ponpon-body">
      <g className="ponpon-part ponpon-tail"><path d="M104 297c-64-9-68 39-28 48 25 6 44-3 56-16" stroke="#696865" strokeWidth="35" strokeLinecap="round"/></g>
      <g className="ponpon-part ponpon-torso"><path d="M113 262c-22 28-26 72-3 88 29 19 164 21 190-4 18-18 5-62-16-86" fill="#777672"/></g>
      <g className="ponpon-part ponpon-foot-left"><ellipse cx="162" cy="340" rx="35" ry="20" fill="#92908A"/><path d="m151 346 1 7m10-6 1 7" stroke="#6B6963" strokeWidth="2.5" strokeLinecap="round"/></g>
      <g className="ponpon-part ponpon-foot-right"><ellipse cx="247" cy="340" rx="35" ry="20" fill="#92908A"/><path d="m236 346 1 7m10-7 1 7" stroke="#6B6963" strokeWidth="2.5" strokeLinecap="round"/></g>
      <g className="ponpon-part ponpon-head">
        <g stroke="#DFAF21" strokeWidth="2">
          <ellipse cx="133" cy="239" rx="45" ry="55" transform="rotate(-57 133 239)" fill="#F5C735"/>
          <ellipse cx="104" cy="189" rx="41" ry="54" transform="rotate(-70 104 189)" fill="#F9D345"/>
          <ellipse cx="114" cy="138" rx="41" ry="54" transform="rotate(-38 114 138)" fill="#FFDD51"/>
          <ellipse cx="157" cy="111" rx="40" ry="52" transform="rotate(-15 157 111)" fill="#FFE168"/>
          <ellipse cx="211" cy="108" rx="40" ry="52" fill="#FFE168"/>
          <ellipse cx="260" cy="121" rx="40" ry="52" transform="rotate(30 260 121)" fill="#FFDD51"/>
          <ellipse cx="294" cy="157" rx="42" ry="53" transform="rotate(64 294 157)" fill="#F9D345"/>
          <ellipse cx="293" cy="211" rx="43" ry="54" transform="rotate(85 293 211)" fill="#F5C735"/>
          <ellipse cx="253" cy="251" rx="45" ry="52" transform="rotate(33 253 251)" fill="#F9D345"/>
          <ellipse cx="192" cy="263" rx="46" ry="48" fill="#FFDD51"/>
        </g>
        <path d="M111 139c-11-16-18-50-10-59 6-6 43 8 62 22 25-9 61-10 87-1 22-16 46-28 55-20 10 10 1 43-12 62 26 42 20 95-16 117-38 23-124 20-155-11-27-26-31-72-11-110Z" fill="#85837E" stroke="#66655F" strokeWidth="3"/>
        <path d="m104 87 21 41 27-20-32 2Z" fill="#676662"/>
        <path d="m297 88-23 40-23-20 31 1Z" fill="#676662"/>
        <path d="M115 192c-7 42 23 65 83 66 58 1 89-27 86-60-26 19-60 20-87 14-36-7-49-8-82-20Z" fill="#939088"/>
        <path d="m175 127 8 17m16-21 1 18m17-14-6 17" stroke="#73716C" strokeWidth="7" strokeLinecap="round"/>
        {closedEyes ? <path d={mood === 'sleepy' ? 'M131 181q19 18 38 0m59 0q19 18 38 0' : 'M131 184q19-24 38 0m59 0q19-24 38 0'} stroke="#41413B" strokeWidth="5" strokeLinecap="round"/> :
          <g className="ponpon-part ponpon-eyes">
            <ellipse cx="150" cy="182" rx="26" ry="29" fill="#55544E"/><ellipse cx="248" cy="182" rx="26" ry="29" fill="#55544E"/>
            <ellipse cx="150" cy="184" rx="21" ry="23" fill="#B8A56D"/><ellipse cx="248" cy="184" rx="21" ry="23" fill="#B8A56D"/>
            <ellipse cx="153" cy="181" rx="14" ry="20" fill="#292D2B"/><ellipse cx="245" cy="181" rx="14" ry="20" fill="#292D2B"/>
            <circle cx="146" cy="172" r="5" fill="#FFFBEF"/><circle cx="238" cy="172" r="5" fill="#FFFBEF"/>
          </g>}
        <ellipse cx="181" cy="223" rx="22" ry="16" fill="#A5A097"/><ellipse cx="215" cy="223" rx="22" ry="16" fill="#A5A097"/>
        <path d="M189 211q10-5 20 0l-10 10Z" fill="#41413B"/>
        <path d="M199 220v9m0-2q-6 8-13 3m13-3q6 8 13 3" stroke="#56534C" strokeWidth="2.5" strokeLinecap="round"/>
        <path d="m167 222-63-7m63 15-65 4m127-12 63-7m-63 15 65 4" stroke="#D4CFC2" strokeWidth="2" strokeLinecap="round"/>
        {mood === 'welcome' && <path d="M186 233q13 13 26 0" stroke="#56534C" strokeWidth="3" strokeLinecap="round"/>}
        {mood === 'focused' && <path d="M126 155l39 5m66 0 38-5" stroke="#66655F" strokeWidth="5" strokeLinecap="round"/>}
        {mood === 'thinking' && <path d="M128 153q15-10 32-4m78 4 28 2" stroke="#66655F" strokeWidth="5" strokeLinecap="round"/>}
        {mood === 'concerned' && <path d="M126 155l31-9m81 0 31 9" stroke="#66655F" strokeWidth="5" strokeLinecap="round"/>}
        {mood === 'curious' && <path d="M126 152q18-18 36-5m73 0q18-13 35 5" stroke="#66655F" strokeWidth="4" strokeLinecap="round"/>}
      </g>
      <g className="ponpon-part ponpon-arm-left">
        <path d="M126 273q-9 28 3 52" stroke="#85837E" strokeWidth="29" strokeLinecap="round"/>
        <ellipse cx="130" cy="326" rx="19" ry="22" fill="#92908A"/>
        <g className="ponpon-paw-pads" fill="#B2A293"><ellipse cx="130" cy="331" rx="8" ry="7"/><ellipse cx="121" cy="319" rx="3" ry="4"/><ellipse cx="130" cy="316" rx="3" ry="4"/><ellipse cx="139" cy="320" rx="3" ry="4"/></g>
      </g>
      <g className="ponpon-part ponpon-arm-right">
        <path d="M274 273q9 28-3 52" stroke="#85837E" strokeWidth="29" strokeLinecap="round"/>
        <ellipse cx="270" cy="326" rx="19" ry="22" fill="#92908A"/>
        <g className="ponpon-paw-pads" fill="#B2A293"><ellipse cx="270" cy="331" rx="8" ry="7"/><ellipse cx="261" cy="320" rx="3" ry="4"/><ellipse cx="270" cy="316" rx="3" ry="4"/><ellipse cx="279" cy="319" rx="3" ry="4"/></g>
      </g>
      <g className="ponpon-part ponpon-prop">
        {mood === 'focused' && <g transform="translate(130 278)"><path d="M0 0q35-9 70 5q35-14 70-5v62q-35-9-70 5Q35 53 0 62Z" fill="#FFFEF9" stroke="#66655F" strokeWidth="3"/><path d="M70 5v62M13 18h38M13 30h38M85 18h39M85 30h39" stroke="#C8AE64" strokeWidth="3"/></g>}
        {mood === 'thinking' && <g transform="translate(150 280) rotate(-6 50 30)"><rect width="104" height="62" rx="7" fill="#FFFEF9" stroke="#66655F" strokeWidth="3"/><path d="M19 18h66M19 30h52M19 42h35" stroke="#C8AE64" strokeWidth="3"/></g>}
        {mood === 'curious' && <g transform="translate(266 268)"><path d="m-5 37-17 29" stroke="#66655F" strokeWidth="12" strokeLinecap="round"/><circle cx="8" cy="18" r="26" fill="#FFFEF9" fillOpacity=".65" stroke="#66655F" strokeWidth="6"/><path d="M-2 4q10-8 20 0" stroke="#FFFBEF" strokeWidth="4" strokeLinecap="round"/></g>}
      </g>
    </g>
    {mood === 'celebrate' && <g className="ponpon-part ponpon-sparkles" stroke="#DFAF21" strokeWidth="4" strokeLinecap="round"><path d="M60 88V64m-12 12h24M329 112V88m-12 12h24M326 39l-8 13M78 37l8 13"/></g>}
  </svg>;
}
