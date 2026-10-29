import {useEffect,useState} from "react";


export const useTypewriter=()=>{


const words=[

"to Next Level",
"via Web Dev",
"via Paid Ads"

];


const [text,setText]=
useState("");


const [wordIndex,setWordIndex]=
useState(0);


const [character,setCharacter]=
useState(0);


const [deleting,setDeleting]=
useState(false);



useEffect(()=>{


let timer;


const currentWord=
words[wordIndex];


if(!deleting){

timer=setTimeout(()=>{

setText(

currentWord.substring(
0,
character+1
)

);

setCharacter(character+1);


},100);


}else{


timer=setTimeout(()=>{


setText(

currentWord.substring(
0,
character-1
)

);


setCharacter(character-1);


},50);


}



if(character===currentWord.length){

setTimeout(()=>{

setDeleting(true);

},1000);

}



if(character===0 && deleting){

setDeleting(false);

setWordIndex(

(wordIndex+1)%words.length

);

}



return ()=>clearTimeout(timer);


},[
text,
character,
deleting,
wordIndex
]);


return text;

}