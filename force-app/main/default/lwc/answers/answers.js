import { api, LightningElement, track } from 'lwc';

export default class Answers extends LightningElement {

    @api questions
    @track score
    
    SINGLE_CHOICE = "Single"
    DOUBLE_CHOICE = "Double"
    TRIPLE_CHOICE = "Triple"

    connectedCallback() {
        this.calculate()
    }

    calculate() {
        this.score = 0
        this.questions = JSON.parse(JSON.stringify(this.questions)) // making variable editable
        for(let question of this.questions) {
            // console.log('------------')
            let correctIds = question.correctIds
            // console.log('correct ' + correctOptions)
            // console.log('selected ids' + question.selectedOptionsIds)
            // console.log('selected id' + question.selectedOptionId)
            // console.log('type ' + question.type)
            question.isSingle = question.type == this.SINGLE_CHOICE
            if(question.type == this.SINGLE_CHOICE && correctIds[0] === question.selectedOptionId) {
                this.score++
            } else if((question.type == this.DOUBLE_CHOICE && question.selectedOptionsIds.length === 2) 
                        || (question.type == this.TRIPLE_CHOICE && question.selectedOptionsIds.length === 3)) {
                let correct = false
                for(let selectedOptionId of question.selectedOptionsIds) {
                    correct = true
                    if(!correctIds.includes(selectedOptionId)) {
                        correct = false
                        break
                    }
                }
                if(correct)
                    this.score++
            }
            this.populateOptionsForDisplay(question)
        }
        this.score = this.score + ' / ' + this.questions.length
    }

    populateOptionsForDisplay(question) {
        if(question.type == this.SINGLE_CHOICE) {
            for(let option of question.options) {
                if(option.value == question.selectedOptionId)
                    option.selected = true
                else
                    option.selected = false
            }
        } else if(question.type == this.DOUBLE_CHOICE || question.type == this.TRIPLE_CHOICE) {
            for(let option of question.options) {
                if(question.selectedOptionsIds.includes(option.value)) {
                    option.selected = true
                } else {
                    option.selected = false
                }
            }
        }
    }
}