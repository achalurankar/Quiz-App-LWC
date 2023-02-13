import { LightningElement, track } from 'lwc';
import getQuestions from "@salesforce/apex/Quiz_CC.getQuestions";
import getSetsAndExams from "@salesforce/apex/Quiz_CC.getSetsAndExams";

export default class Quiz extends LightningElement {

    @track questions;
    @track selectedQuestion = { text : "Loading..." };
    idVsQuestionMap = {}
    @track timer = '00:00'
    currentIntervalId = null
    @track selectedSet = null
    @track selectedExam = null
    sets = []
    exams = []
    QUIZ_TIME_IN_MIN = 105
    QUIZ_TIME_LIMIT = this.QUIZ_TIME_IN_MIN * 60 * 1000 // 90 minutes into milliseconds
    currentQuizInstance
    sequence = false;

    SINGLE_CHOICE = "Single"
    DOUBLE_CHOICE = "Double"
    TRIPLE_CHOICE = "Triple"

    connectedCallback() {
        this.currentQuizInstance = JSON.parse(window.localStorage.getItem('currentQuiz'))
        console.log('quiz instance', this.currentQuizInstance);
        if(this.currentQuizInstance) {
            let currTime = Date.now()
            let quizStartTime = this.currentQuizInstance.startTime;
            console.log('currTime', currTime)
            console.log('quizStartTime', quizStartTime)
            console.log('currTime - quizStartTime', currTime - quizStartTime)
            console.log('quiz time limit', this.QUIZ_TIME_LIMIT)
            if(currTime - quizStartTime >= this.QUIZ_TIME_LIMIT) {
                console.log('time limit for quiz exceeded')
                window.localStorage.clear()
            } else {
                console.log('quiz is active')
                this.questions = this.currentQuizInstance.questions
                this.selectedQuestion = this.questions[0]
                this.idVsQuestionMap = this.currentQuizInstance.idVsQuestionMap;
                this.startTimer(Math.floor((this.QUIZ_TIME_LIMIT - (currTime - quizStartTime)) / 1000))
            }
        }
        this.loadSetsAndExams()
    }

    async loadSetsAndExams() {
        const response = await getSetsAndExams();
        this.exams = response
        this.sets = []
    }
    
    handleInputChange(event) {
        if(event.target.name == 'paperSet') {
            this.selectedSet = event.detail.value;
        } else if(event.target.name == 'exam') {
            this.selectedExam = event.detail.value;
            for(let exam of this.exams) {
                if(exam.value == this.selectedExam) {
                    this.sets = exam.sets;
                }
            }
        } else if(event.target.name == 'sequence') {
            this.sequence = event.detail.checked
        } else if(event.target.name == 'revisit') {
            this.selectedQuestion.isMarkedForRevisit = event.detail.checked;
            this.saveQuizInstance()
        } else if(event.target.name == 'singleChoice') {
            this.selectedQuestion.selectedOptionId = event.detail.value
            this.selectedQuestion.isQuestionAttempted = true
            this.saveQuizInstance()
        } else if(event.target.name == 'multipleChoice') {        
            this.selectedQuestion.selectedOptionsIds = event.detail.value
            if(this.selectedQuestion.selectedOptionsIds.length == 0) {
                this.selectedQuestion.isQuestionAttempted = false
            } else {
                this.selectedQuestion.isQuestionAttempted = true
            }
            this.saveQuizInstance()
        }
    }

    handleButtonClicks(event) {
        if(event.detail.name == 'previous') {
            let dataIndex = this.selectedQuestion.index;
            dataIndex--
            if(dataIndex > 0) {
                this.selectedQuestion = this.idVsQuestionMap[dataIndex]
            }
        } else if(event.detail.name == 'next') {
            let dataIndex = this.selectedQuestion.index;
            dataIndex++
            if(dataIndex <= this.questions.length) {    
                this.selectedQuestion = this.idVsQuestionMap[dataIndex]
            }
        } else if(event.detail.name == 'submit') {
            this.dispatchEvent(new CustomEvent('submit', { detail : { questions : this.questions } } ))
            window.localStorage.clear()
        }
    } 

    handleStartClick() {
        this.loadQuestions(this.selectedSet)
    }

    loadQuestions(paperSet) {
        getQuestions({ kvData : { paperSet : paperSet, sequence : this.sequence, exam : this.selectedExam }})
            .then(res => {
                window.localStorage.clear()
                this.selectedQuestion = {};
                this.questions = JSON.parse(JSON.stringify(res))
                for(let obj of this.questions) {
                    obj.options = this.shuffle([...obj.correctOptions, ...obj.incorrectOptions])
                    obj.correctIds = this.getCorrectIds(obj.correctOptions)
                    obj.isQuestionAttempted = false
                    obj.isMarkedForRevisit = false
                    this.idVsQuestionMap[`${obj.index}`] = obj
                }
                if(this.questions.length !== 0){
                    this.selectedQuestion = this.questions[0]
                    this.startTimer(this.QUIZ_TIME_IN_MIN * 60)
                    this.currentQuizInstance = { startTime : Date.now() }
                    this.saveQuizInstance()
                }
                else {
                    this.stopCurrentInterval()
                    this.selectedQuestion.text = 'No Questions for the selected options'
                }
            })
            .catch(err => {
                console.log(err)
            })
    }

    saveQuizInstance() {
        this.currentQuizInstance.questions = this.questions
        this.currentQuizInstance.idVsQuestionMap = this.idVsQuestionMap
        window.localStorage.setItem('currentQuiz', JSON.stringify(this.currentQuizInstance))
    }
    
    startTimer(time) {
        this.stopCurrentInterval()
        this.currentIntervalId = window.setInterval(() => {
            if(time == 0) window.clearInterval(this.currentIntervalId)
            let min = Math.floor(time / 60)
            let sec = time % 60
            this.timer = `${ min < 10 ? `0${min}` : min }:${ sec < 10 ? `0${sec}` : sec }`
            time--
        }, 1000)
    }

    stopCurrentInterval() {
        if(this.currentIntervalId) 
            window.clearInterval(this.currentIntervalId)
    }

    getCorrectIds(arr) {
        let ids = []
        for(let opt of arr) {
            ids.push(opt.value)
        }
        return ids
    }

    handleQuestionClick(event) {
        let dataIndex = event.currentTarget.dataset.index;
        this.selectedQuestion = this.idVsQuestionMap[dataIndex]
    }

    get isSingle() {
        return this.selectedQuestion.type === this.SINGLE_CHOICE;
    }

    get isMultiple() {
        return this.selectedQuestion.type === this.DOUBLE_CHOICE || this.selectedQuestion.type === this.TRIPLE_CHOICE;
    }

    shuffle(array) {
        let currentIndex = array.length,  randomIndex;
        // While there remain elements to shuffle.
        while (currentIndex !== 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}