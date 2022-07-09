public with sharing class QuestionResponseWrapper {
    @AuraEnabled public String id;
    @AuraEnabled public String text;
    @AuraEnabled public String type;
    @AuraEnabled public Integer index;
    @AuraEnabled public String selectedOptionId = ''; //for single choice
    @AuraEnabled public List<String> selectedOptionsIds = new List<String>(); //for multiple choice
    @AuraEnabled public List<OptionWrapper> correctOptions = new List<OptionWrapper>();
    @AuraEnabled public List<OptionWrapper> incorrectOptions = new List<OptionWrapper>();

    private class OptionWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String value;
        @AuraEnabled public Boolean correct;
    }

    public QuestionResponseWrapper(Question__c question, Integer index) {
        this.id = question.Id;
        this.text = question.Text__c;
        this.type = question.Type__c;
        this.index = index;
        for(Option__c option : question.Options__r) {
            OptionWrapper optionWrapper = new OptionWrapper();
            optionWrapper.value = option.Id;
            optionWrapper.label = option.Text__c;
            optionWrapper.correct = option.Correct__c;
            if(option.Correct__c)
                correctOptions.add(optionWrapper);
            else
                incorrectOptions.add(optionWrapper);
        }
    }
}