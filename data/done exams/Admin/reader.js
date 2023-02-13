const fs = require('fs');
const readline = require('readline');

const numVsWord = { 1 : "Single", 2 : "Double", 3 : "Triple" }

const questions = []

const input = fs.readFileSync('input.txt', 'utf-8').split(/\r?\n/)

const QUESTION_BEGIN = 'begin question'
const QUESTION_END = 'end question'
const OPTION_BEGIN = 'begin option'
const OPTION_END = 'end option'
const FILE_END = 'end file'

let question = {}
let i = 0
while(input[i] != FILE_END) {
    if(input[i] == QUESTION_BEGIN) {
        i++ //move to question text
        while(input[i] != QUESTION_END) {
            if(question.text == null) question.text = ''
            question.text += input[i] + '\n'
            i++
        }
        i++ //move to type
        input[i] = input[i].replace('type-', '')
        question.type = numVsWord[`${input[i]}`]
        i++ //move to options
        question.options = []
        //loop through options
        while(input[i] != QUESTION_BEGIN || input[i] != FILE_END) {
            let isCorrect = false
            if(!input[i]) break
            if(input[i].includes('correct'))
                isCorrect = true
            i++ //move to option text
            question.options.push({ text : input[i], correct : isCorrect})
            i++//move to next delimiter
            i++ // move to next delimiter
        }
        questions.push(question)
        question = {}
    } else {
        i++
    }
    if(!input[i]) break
}

console.log(JSON.stringify(questions))