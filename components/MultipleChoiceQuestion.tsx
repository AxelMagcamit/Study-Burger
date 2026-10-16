'use client';
import {useEffect,useRef,useState} from 'react';
import type {Card,Rating} from '@/lib/study';
import {choiceIsCorrect,shuffledChoices} from '@/lib/multiple-choice';

export default function MultipleChoiceQuestion({card,onContinue}:{card:Card;onContinue:(rating:Rating)=>void}){
 const quiz=card.multipleChoice!;
 const [choices]=useState(()=>shuffledChoices(quiz));
 const [selected,setSelected]=useState<number|null>(null);
 const [submitted,setSubmitted]=useState(false);
 const continued=useRef(false);
 const heading=useRef<HTMLHeadingElement>(null);
 const next=useRef<HTMLButtonElement>(null);
 const correct=selected!==null&&choiceIsCorrect(quiz,selected);
 useEffect(()=>{heading.current?.focus({preventScroll:true});},[]);
 useEffect(()=>{if(submitted)next.current?.focus({preventScroll:true});},[submitted]);
 useEffect(()=>{
  function key(event:KeyboardEvent){
   if(event.repeat||event.altKey||event.ctrlKey||event.metaKey||submitted)return;
   const target=event.target as HTMLElement;
   if(['INPUT','TEXTAREA','SELECT'].includes(target.tagName))return;
   const number=Number(event.key);
   if(Number.isInteger(number)&&number>=1&&number<=4){event.preventDefault();setSelected(choices[number-1].index);}
  }
  window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);
 },[choices,submitted]);
 function proceed(){if(!submitted||continued.current)return;continued.current=true;onContinue(correct?'good':'again');}
 return <section className="quiz-card" aria-labelledby="quiz-question">
  <p className="card-label">MULTIPLE CHOICE</p>
  <h2 id="quiz-question" ref={heading} tabIndex={-1}>{card.question}</h2>
  <div className="quiz-options" role="group" aria-label="Answer choices">
   {choices.map((choice,index)=>{
    const isAnswer=submitted&&choice.index===quiz.correctIndex;
    const isWrong=submitted&&selected===choice.index&&!correct;
    return <button key={choice.index} type="button" aria-pressed={selected===choice.index} disabled={submitted} className={`quiz-option ${selected===choice.index?'selected':''} ${isAnswer?'correct':''} ${isWrong?'incorrect':''}`} onClick={()=>setSelected(choice.index)}>
     <span className="quiz-letter">{String.fromCharCode(65+index)}</span><span>{choice.text}</span>{isAnswer&&<strong>Correct answer</strong>}{isWrong&&<strong>Your answer</strong>}
    </button>;
   })}
  </div>
  {submitted?<><div className="quiz-result" role="status"><strong>{correct?'Correct':'Not quite'}</strong><p>{card.answer}</p><small>{correct?'Next review in '+(card.interval<1?1:Math.round(card.interval*2))+' day(s).':'This question will return in one minute.'}</small></div><button ref={next} className="button primary" onClick={proceed}>Continue</button></>:<button className="button primary" disabled={selected===null} onClick={()=>setSubmitted(true)}>Check answer</button>}
  <p className="muted small">{submitted?'Continue to save this review.':'Choose one answer. Keyboard: 1–4 to select.'}</p>
 </section>;
}
