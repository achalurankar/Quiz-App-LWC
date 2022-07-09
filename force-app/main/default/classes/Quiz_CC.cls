public with sharing class Quiz_CC {

    @AuraEnabled
    public static List<QuestionResponseWrapper> getQuestions(){
        try {
            List<Question__c> queriedQuestions = [SELECT Id, Text__c, Type__c, (SELECT Id, Text__c, Correct__c FROM Options__r) FROM Question__c LIMIT 60];
            List<QuestionResponseWrapper> questionResponseWrapperList = new List<QuestionResponseWrapper>();
            Integer index = 1;
            for(Question__c queriedQuestion : queriedQuestions) {
                questionResponseWrapperList.add(new QuestionResponseWrapper(queriedQuestion, index++)); 
            }
            return questionResponseWrapperList;
        } catch (Exception e) {
            throw new AuraHandledException(e.getMessage());
        }
    }
}