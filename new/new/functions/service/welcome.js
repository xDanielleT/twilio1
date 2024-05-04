const Groq = require('groq-sdk');
const VoiceResponse = require('twilio').twiml.VoiceResponse;
 
exports.handler = async function(context, event, callback) {
  const twiml = new VoiceResponse();
 
  try {
    const rolePrompt = "You are a database that only outputs verses from the first book of psalms in the king james version of the bible. If only one verse is given, you only output that verse. If a range of verses is given you only output that range. If only the book is given, you only output the first verse of psalms. You always end your output asking 'PRAISE THE LORD!! Would you like to hear the next verse or a new one? Do not output anything other than the verse and question.";
    const client = new Groq({
      apiKey: process.env.GROQ_API,
    });
    console.log(event.SpeechResult);
    console.log(event);
    if (event.SpeechResult) { // Process gathered text if available
      const result = await client.chat.completions.create({
        messages: [
          {
            role:"assistant",
            content: rolePrompt,
          },
          {
            role: "user",
            content: event.SpeechResult,
          }
        ],
        model: "mixtral-8x7b-32768",
        max_tokens: 500, //250 is max word count for any verse in psalms + prompt ? + user msg ? included?
        temperature: 0.1,
        top_p: 0.2
      });
      twiml.say(result.choices[0].message.content);
    } else { // Gather voice input if no text present
      const gather = twiml.gather({
        input: 'speech',
        action: 'https://demo1-1934.twil.io/welcome',
        speechModel:"phone_call",
        enhanced:true
      });
 
      gather.say('Tell me a verse or verses you would like to hear from psalms.');
    }
 
    return callback(null, twiml);
 
  } catch (error) {
    console.error("Error:", error);
    twiml.say("An error occurred while processing the request.");
    return callback(error);
  }
};

// This is your new function. To start, set the name and path on the left.
const VoiceResponse = require('twilio').twiml.VoiceResponse;
exports.handler = async function(context, event, callback) {
  const twiml = new VoiceResponse();
  function standardizeInput(input){
    let words = new Array();
    let str = "";
    for (let i = 0; i<input.length; i++){
      if (input.substring(i,i+1)==" "){
        words.push(str);
        str = "";
      } else {
        str += input.substring(i, i+1);
      }
    }
    words.push(str);
    let numbers = ["one", "two", "three", "four"];
    let replacements = ["1", "2", "3", "4"];
    for (wordIndex in words){
        for (let i = 0; i<numbers.length; i++){
            if (words[wordIndex] == numbers[i]){
                words[wordIndex] = replacements[i];
            }
        }
        upperCase = words[wordIndex][0].toUpperCase();
        words[wordIndex] = upperCase + words[wordIndex].substring(1);
    }
    return words.join(" ");
  }
  let book = context.BOOK || null;
  let chapterNumber = context.CHAPTER || null;
  let verseNumber = context.VERSE || null;
  console.log(book);
  console.log(chapterNumber);
  console.log(verseNumber);
  try {
    const gather = twiml.gather({
      input: 'speech',
      action: 'https://sturdy-palm-tree-q7p467qxq9w3jrq-3000.app.github.dev/hello-world',
      language:'en',
      speechModel:"phone_call",
      enhanced:true
    });
    const gatherDTMF = twiml.gather({ numDigits: 3 });
    while (true){
      console.log(event.Digits);
      if (event.Digits){
        if (chapterNumber == null){
          context.CHAPTER = event.Digits;
          twiml.say("Chapter " + context.CHAPTER + ", OK.");
          gatherDTMF.say("Please type on the keypad the number of the verse you would like to listen to.");
        } else {
          context.VERSE = event.Digits;
          twiml.say("Chapter " + context.VERSE + ", OK.");
          gatherDTMF.say("So, you would like to listen to Chapter " + chapterNumber + ", verse " + context.VERSE + ", of the book " + book + ".");
        }
      }
      else if (event.SpeechResult) { // Process gathered text if available
        let books = ['Genesis',
          'Exodus',
          'Leviticus',
          'Numbers',
          'Deuteronomy',
          'Joshua',
          'Judges',
          'Ruth',
          '1 Samuel',
          '2 Samuel',
          '1 Kings',
          '2 Kings',
          '1 Chronicles',
          '2 Chronicles',
          'Ezra',
          'Nehemiah',
          'Tobit',
          'Judith',
          'Esther',
          '1 Maccabees',
          '2 Maccabees',
          'Job',
          'Psalms',
          'Proverbs',
          'Ecclesiastes',
          'Song Of Songs',
          'Wisdom',
          'Sirach',
          'Isaiah',
          'Jeremiah',
          'Lamentations',
          'Baruch',
          'Ezekiel',
          'Daniel',
          'Hosea',
          'Joel',
          'Amos',
          'Obadiah',
          'Jonah',
          'Micah',
          'Nahum',
          'Habakkuk',
          'Zephaniah',
          'Haggai',
          'Zechariah',
          'Malachi',
          'Matthew',
          'Mark',
          'Luke',
          'John',
          'Acts',
          'Romans',
          '1 Corinthians',
          '2 Corinthians',
          'Galatians',
          'Ephesians',
          'Philippians',
          'Colossians',
          '1 Thessalonians',
          '2 Thessalonians',
          '1 Timothy',
          '2 Timothy',
          'Titus',
          'Philemon',
          'Hebrews',
          'James',
          '1 Peter',
          '2 Peter',
          '1 John',
          '2 John',
          '3 John',
          'Jude',
          'Revelation'];
          if (books.includes(standardizeInput(event.SpeechResult))){
            gather.say(event.SpeechResult + ", OK.");
            context.BOOK = standardizeInput(event.SpeechResult);
            gatherDTMF.say("Please input on your keypad the chapter number you would like to listen to.");
          } else {
            gather.say("I'm sorry - I didn't understand " + event.SpeechResult + " as a book of the Bible. Could you please repeat it?")
          }
      } else {
        gather.say('Tell me the name of the book you would like to listen to.');
        console.log(event.SpeechResult);
        console.log(event);
      }
      return callback(null, twiml);
  }
  } catch (error) {
    console.error("Error:", error);
    twiml.say("An error occurred while processing the request.");
    return callback(error);
  }
};


