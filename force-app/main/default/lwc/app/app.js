import { LightningElement, track } from 'lwc';

export default class App extends LightningElement {

    @track questions
    @track showQuiz = true

    handleSubmit(event) {
        this.questions = event.detail.questions;
        this.showQuiz = false
    }
}