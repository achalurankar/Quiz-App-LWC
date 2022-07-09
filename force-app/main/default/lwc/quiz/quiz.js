import { LightningElement, track } from 'lwc';
import getQuestions from "@salesforce/apex/Quiz_CC.getQuestions";

export default class Quiz extends LightningElement {

    @track questions;
    @track selectedQuestion = { text : "Loading..." };
    idVsQuestionMap = {}
    @track timer = '00:00'

    SINGLE_CHOICE = "Single"
    DOUBLE_CHOICE = "Double"
    TRIPLE_CHOICE = "Triple"

    connectedCallback() {
        getQuestions()
            .then(res => {
                this.questions = JSON.parse(JSON.stringify(res))
                for(let obj of this.questions) {
                    obj.options = this.shuffle([...obj.correctOptions, ...obj.incorrectOptions])
                    obj.correctIds = this.getCorrectIds(obj.correctOptions)
                    obj.isQuestionAttempted = obj.selectedOptionId != '' || obj.selectedOptionsIds.length != 0
                    this.idVsQuestionMap[`${obj.index}`] = obj
                }
                this.selectedQuestion = this.questions[0]
                this.startTimer(5400)
            })
            .catch(err => {
                console.log(err)
            })
    }
    
    startTimer(time) {
        let intervalId = window.setInterval(() => {
            if(time == 0) window.clearInterval(intervalId)
            let min = Math.floor(time / 60)
            let sec = time % 60
            this.timer = `${ min < 10 ? `0${min}` : min }:${ sec < 10 ? `0${sec}` : sec }`
            time--
        }, 1000)
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

    handleRadioSelect(event) {
        this.selectedQuestion.selectedOptionId = event.detail.value
        this.selectedQuestion.isQuestionAttempted = true
    }

    handleMultiSelect(event) {
        this.selectedQuestion.selectedOptionsIds = event.detail.value
        if(this.selectedQuestion.selectedOptionsIds.length == 0) {
            this.selectedQuestion.isQuestionAttempted = false
        } else {
            this.selectedQuestion.isQuestionAttempted = true
        }
    }

    handlePrevClick(event) {
        let dataIndex = this.selectedQuestion.index;
        dataIndex--
        if(dataIndex > 0) {
            this.selectedQuestion = this.idVsQuestionMap[dataIndex]
        }
    }

    handleNextClick(event) {
        let dataIndex = this.selectedQuestion.index;
        dataIndex++
        if(dataIndex <= this.questions.length) {    
            this.selectedQuestion = this.idVsQuestionMap[dataIndex]
        }
    }

    handleSubmitClick(event) {
        this.dispatchEvent(new CustomEvent('submit', { detail : { questions : this.questions } } ))
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