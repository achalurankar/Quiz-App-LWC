"use strict";
exports.__esModule = true;
var uuid_1 = require("uuid");
var fs_1 = require("fs");
var typeMap = {
    'SINGLE': 'Single',
    'DOUBLE': 'Double',
    'TRIPLE': 'Triple'
};
var labelVsIndex = {
    'A': 0,
    'B': 1,
    'C': 2,
    'D': 3,
    'E': 4
};
var questionsToSend = [];
var readFileLocation = 'questions.txt';
var writeFileLocation = 'request-maker.apex';
var rawFileLocation = 'rawFileData.txt';
var prettyJsonFileLocation = 'request-json.json';
try {
    var readFileContent = fs_1["default"].readFileSync(readFileLocation, 'utf8');
    var content = JSON.stringify(readFileContent);
    content = content.substring(1, content.length - 1);
    fs_1["default"].writeFileSync(rawFileLocation, content);
    var questions = content.split('new-question\\r\\n');
    var questionNumber = 0;
    console.log('total questions detected =', questions.length);
    for (var _i = 0, questions_1 = questions; _i < questions_1.length; _i++) {
        var question = questions_1[_i];
        questionNumber++;
        //get all sections from the question
        var sections = question.split('section-end\\r\\n');
        if (sections.length != 4) {
            throw new Error("question no.".concat(questionNumber, " sections are not correctly formatted"));
        }
        //question text - start
        var questionText = sections[0];
        //question text - end
        //question type - start
        var questionType = sections[1];
        if (!questionType.startsWith('question-type=')) {
            console.log(questionType);
            throw new Error("question no.".concat(questionNumber, " type is not correctly formatted"));
        }
        questionType = typeMap[questionType.replace('question-type=', '').replace('\\r\\n', '').toUpperCase()];
        //question type - end
        //question's options - start
        var options = sections[2].split('option-end\\r\\n');
        var correctOptions = sections[3];
        if (!correctOptions.startsWith('correct=')) {
            throw new Error("question no.".concat(questionNumber, " options are not correctly formatted"));
        }
        correctOptions = correctOptions.replace('correct=', '').replace('\\r\\n', '').split(',');
        if (!areOptionsValid(correctOptions, questionType)) {
            console.log({
                questionType: questionType,
                correctOptions: correctOptions,
                questionType: questionType
            });
            throw new Error("question no.".concat(questionNumber, " correct options are not correctly formatted"));
        }
        //question's options - end
        questionsToSend.push({
            uuid: (0, uuid_1.v4)(),
            text: questionText,
            type: questionType,
            exam: 'PD2',
            set: '1',
            options: getStructuredOptions(options, correctOptions)
        });
    }
    var script = "String reqStruc = '".concat(JSON.stringify(questionsToSend), "';\nString response = QuestionCreator.createQuestions(reqStruc);");
    fs_1["default"].writeFileSync(writeFileLocation, script);
    fs_1["default"].writeFileSync(prettyJsonFileLocation, JSON.stringify(questionsToSend, null, 2));
    console.log('file written successfully!');
}
catch (err) {
    console.error(err);
}
function areOptionsValid(correctOptions, questionType) {
    if ((questionType == 'Single' && correctOptions.length == 1) ||
        (questionType == 'Double' && correctOptions.length == 2) ||
        (questionType == 'Triple' && correctOptions.length == 3)) {
        return true;
    }
    return false;
}
function getStructuredOptions(options, correctOptions) {
    var optionsToSend = [];
    var currCorrectIndex = 0;
    for (var i = 0; i < options.length; i++) {
        var isCorrect = i == labelVsIndex[correctOptions[currCorrectIndex]];
        if (isCorrect)
            currCorrectIndex++;
        optionsToSend.push({
            text: options[i].replace('\\r\\n', ''),
            correct: isCorrect
        });
    }
    return optionsToSend;
}
