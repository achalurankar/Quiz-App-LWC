@RestResource(urlMapping='/Question/*')
global with sharing class QuestionCreator {

    @HttpPost
    global static String createQuestions(String requestStructure){
        try {
            List<CreateQuestionWrapper> questionsList = (List<CreateQuestionWrapper>) JSON.deserialize(requestStructure, List<CreateQuestionWrapper>.class);
            List<Question__c> questions = new List<Question__c>();
            Map<String, CreateQuestionWrapper> textVsWrapperMap = new Map<String, CreateQuestionWrapper>();
            for(CreateQuestionWrapper wrapper : questionsList) {
                Question__c question = new Question__c();
                question.Text__c = wrapper.text;
                question.Type__c = wrapper.type;
                question.Set__c = wrapper.questionSet;
                questions.add(question);
                textVsWrapperMap.put(wrapper.text, wrapper);
            }
            insert questions;
            List<Option__c> options = new List<Option__c>();
            for(Question__c question : questions) {
                CreateQuestionWrapper wrapper = textVsWrapperMap.get(question.Text__c);
                for(CreateQuestionWrapper.OptionWrapper optWrapper : wrapper.options) {
                    Option__c option = new Option__c();
                    option.Text__c = optWrapper.text;
                    option.Correct__c = optWrapper.correct;
                    option.Question__c = question.Id;
                    options.add(option);
                }
            }
            insert options;
            return 'All records inserted successfully';
        } catch (Exception e) {
            throw new InvalidDataException(e.getMessage() + ' stack ' + e.getStackTraceString());
        }
    }

    public class InvalidDataException extends Exception {}
}
