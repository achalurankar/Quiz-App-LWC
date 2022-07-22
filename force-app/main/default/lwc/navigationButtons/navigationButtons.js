import { LightningElement } from 'lwc';

export default class NavigationButtons extends LightningElement {

    handleButtonClicks(event) {
        if(event.target.name == 'previous') {
            this.dispatchEvent(new CustomEvent('button_click', { detail : { name : 'previous' }}))
        } else if(event.target.name == 'next') {
            this.dispatchEvent(new CustomEvent('button_click', { detail : { name : 'next' }}))
        } else if(event.target.name == 'submit') {
            this.dispatchEvent(new CustomEvent('button_click', { detail : { name : 'submit' }}))
        }
    }
}