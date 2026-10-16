export type Rating = 'again' | 'good' | 'easy';
export type MultipleChoice = {options:string[]; correctIndex:number};
export type CardFormat = 'qa'|'cloze'|'mcq';
export type Card = { id:string; question:string; answer:string; format?:CardFormat; multipleChoice?:MultipleChoice; interval:number; due:number; repetitions:number; state:'unseen'|'learning'|'mastered' };
export function cardFormat(card:Card):CardFormat{return card.multipleChoice?'mcq':card.format==='cloze'||(!card.format&&card.question.includes('_____'))?'cloze':'qa';}
export function changeCardFormat(card:Card,format:CardFormat):Card{
 const answer=card.multipleChoice&&format!=='mcq'?`${card.multipleChoice.options[card.multipleChoice.correctIndex]}\n\n${card.answer}`.slice(0,3000):card.answer;
 return {...card,format,answer,multipleChoice:format==='mcq'?(card.multipleChoice||{options:[card.answer.slice(0,500),'','',''],correctIndex:0}):undefined};
}
export type Deck = { id:string; title:string; description:string; color:string; source:string; created:number; cards:Card[] };
export type Review = { cardId:string; deckId:string; at:number; rating:Rating };
export type Data = { decks:Deck[]; reviews:Review[]; goal:number };
export const DAY = 86400000;
export function schedule(card:Card, rating:Rating, now=Date.now()):Card {
 if(rating==='again') return {...card, interval:0, due:now+60000, repetitions:0, state:'learning'};
 const repetitions=card.repetitions+1;
 const interval=rating==='good' ? (card.interval<1?1:Math.round(card.interval*2)) : (card.interval<1?4:Math.round(card.interval*3));
 return {...card,interval,due:now+interval*DAY,repetitions,state:repetitions>=3 && interval>=7?'mastered':'learning'};
}
export function dayKey(at:number) { const d=new Date(at);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
export function streak(reviews:Review[],now=Date.now()) { const dates=new Set(reviews.map(r=>dayKey(r.at)));const d=new Date(now);let count=0;if(!dates.has(dayKey(+d)))d.setDate(d.getDate()-1);while(dates.has(dayKey(+d))){count++;d.setDate(d.getDate()-1);}return count; }
export function makeCard(question='',answer=''):Card {return {id:crypto.randomUUID(),question,answer,interval:0,due:0,repetitions:0,state:'unseen'};}
export function seedData():Data {
 const sets=[
 {title:'Networking essentials',description:'From packets to protocols. Build your foundation.',color:'mint',pairs:[['How does TCP differ from UDP?','TCP provides reliable, ordered delivery with acknowledgments. UDP sends datagrams without delivery or ordering guarantees.'],['What is the purpose of DNS?','DNS resolves domain names, such as example.com, to IP addresses.'],['What does a subnet mask identify?','It separates the network portion of an IP address from the host portion.'],['Why is HTTPS more secure than HTTP?','HTTPS uses TLS to encrypt data in transit and authenticate the server, protecting against eavesdropping and tampering.'],['What is the difference between a switch and a router?','A switch forwards frames within a local network using MAC addresses. A router forwards packets between networks using IP addresses.'],['What does the principle of least privilege mean?','Grant users and processes only the permissions they need to perform their tasks.']]},
 {title:'The science of learning',description:'Understand how your brain makes memories.',color:'lavender',pairs:[['What is active recall?','Retrieving information from memory without looking at the source, for example by answering a flashcard.'],['How does spaced repetition support retention?','It distributes retrieval practice over time, revisiting material before it is forgotten.'],['What is the testing effect?','Practicing retrieval can improve long-term retention more than simply restudying the same material.'],['What is interleaving?','Mixing related topics or problem types during practice instead of studying only one type at a time.'],['What is metacognition?','Awareness and regulation of your own thinking and learning processes.'],['Why can recognition feel easier than recall?','Recognition supplies cues or answer options; recall requires producing the information from memory.']]},
 {title:'Cell biology',description:'Small structures. Remarkable systems.',color:'peach',pairs:[['What is the primary function of mitochondria?','They produce most cellular ATP through aerobic respiration in many eukaryotic cells.'],['How do prokaryotic and eukaryotic cells differ?','Eukaryotic cells have a membrane-bound nucleus and organelles; prokaryotic cells lack a membrane-bound nucleus.'],['What is osmosis?','The net movement of water across a selectively permeable membrane toward a higher effective solute concentration.'],['What do ribosomes do?','They synthesize proteins by translating messenger RNA.'],['How does active transport differ from passive transport?','Active transport requires energy to move substances against an electrochemical gradient; passive transport moves them down a gradient.'],['What is the role of the cell membrane?','It forms a selective barrier that regulates movement of substances into and out of the cell.']]}
 ];
 return {decks:sets.map(s=>({id:crypto.randomUUID(),title:s.title,description:s.description,color:s.color,source:'Sample deck',created:Date.now(),cards:s.pairs.map(([q,a])=>makeCard(q,a))})),reviews:[],goal:20};
}
