import {z} from 'zod';
import type {MultipleChoice} from './study.ts';

export const multipleChoiceSchema=z.object({
 options:z.array(z.string().trim().min(1).max(500)).length(4),
 correctIndex:z.number().int().min(0).max(3)
}).refine(value=>new Set(value.options.map(option=>option.toLowerCase())).size===4,{
 message:'Use four different, non-empty choices and select the correct answer.'
});

export function choiceIsCorrect(quiz:MultipleChoice,index:number){
 return Number.isInteger(index)&&index>=0&&index<quiz.options.length&&index===quiz.correctIndex;
}

export function shuffledChoices(quiz:MultipleChoice,random= Math.random){
 const choices=quiz.options.map((text,index)=>({text,index}));
 for(let i=choices.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[choices[i],choices[j]]=[choices[j],choices[i]];}
 return choices;
}
