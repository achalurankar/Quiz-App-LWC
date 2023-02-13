import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

interface Option {
    text: String,
    correct: Boolean
}

interface Question {
    uuid: String,
    text: String,
    type: String,
    set: String,
    exam: String,
    options : Option[]
}

const typeMap = {
    'SINGLE' : 'Single',
    'DOUBLE' : 'Double',
    'TRIPLE' : 'Triple',
}

const labelVsIndex = {
    'A' : 0,
    'B' : 1,
    'C' : 2,
    'D' : 3,
    'E' : 4,
}

const questionsToSend: Partial<Question[]> = []

let readFileLocation = 'questions.txt';
let writeFileLocation = 'request-maker.apex';
let rawFileLocation = 'rawFileData.txt';
let prettyJsonFileLocation = 'request-json.json';
try {
    let readFileContent = fs.readFileSync(readFileLocation, 'utf8')
    let content = JSON.stringify(readFileContent)
    content = content.substring(1, content.length - 1)
    fs.writeFileSync(rawFileLocation, content)
    let questions = content.split('new-question\\r\\n')
    let questionNumber = 0
    console.log('total questions detected =', questions.length);
    for(let question of questions) {
        questionNumber++;
        //get all sections from the question
        let sections = question.split('section-end\\r\\n')
        if(sections.length != 4) {
            throw new Error(`question no.${questionNumber} sections are not correctly formatted`);
        }
        
        //question text - start
        let questionText = sections[0];
        //question text - end

        //question type - start
        let questionType = sections[1];
        if(!questionType.startsWith('question-type=')) {
            console.log(questionType)
            throw new Error(`question no.${questionNumber} type is not correctly formatted`);
        }
        questionType = typeMap[questionType.replace('question-type=', '').replace('\\r\\n', '').toUpperCase()]
        //question type - end
        
        //question's options - start
        let options = sections[2].split('option-end\\r\\n')
        let correctOptions = sections[3]
        if(!correctOptions.startsWith('correct=')) {
            throw new Error(`question no.${questionNumber} options are not correctly formatted`);
        }
        correctOptions = correctOptions.replace('correct=', '').replace('\\r\\n', '').split(',')
        if(!areOptionsValid(correctOptions, questionType)) {
            console.log({
                questionType : questionType,
                correctOptions : correctOptions,
                questionType : questionType
            })
            throw new Error(`question no.${questionNumber} correct options are not correctly formatted`);
        }
        //question's options - end
        questionsToSend.push({
            uuid : uuidv4(),
            text : questionText,
            type : questionType,
            exam : 'PD2',
            set : '1',
            options : getStructuredOptions(options, correctOptions)
        })
    }
    let script = `String reqStruc = '${JSON.stringify(questionsToSend)}';
String response = QuestionCreator.createQuestions(reqStruc);`
    fs.writeFileSync(writeFileLocation, script)
    fs.writeFileSync(prettyJsonFileLocation, JSON.stringify(questionsToSend, null, 2))
    console.log('file written successfully!');
} catch(err) {
    console.error(err)
}

function areOptionsValid(correctOptions, questionType) {
    if(
        (questionType == 'Single' && correctOptions.length == 1) ||
        (questionType == 'Double' && correctOptions.length == 2) ||
        (questionType == 'Triple' && correctOptions.length == 3)
    ) {
        return true;
    }
    return false;
        
}

function getStructuredOptions(options, correctOptions) {
    let optionsToSend = []
    let currCorrectIndex = 0
    for(let i = 0; i < options.length; i++) {
        let isCorrect = i == labelVsIndex[correctOptions[currCorrectIndex]]
        if(isCorrect)
            currCorrectIndex++
        optionsToSend.push({
            text : options[i].replace('\\r\\n', ''),
            correct : isCorrect
        })
    }
    return optionsToSend
}