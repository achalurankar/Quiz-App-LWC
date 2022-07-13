public with sharing class Quiz_CC {

    @AuraEnabled
    public static List<QuestionResponseWrapper> getQuestions(Map<String, String> kvData){
        String paperSet = kvData.get('paperSet');
        Boolean sequence = Boolean.valueOf(kvData.get('sequence'));
        try {
            String query = 'SELECT Id, Text__c, Type__c, (SELECT Id, Text__c, Correct__c FROM Options__r) FROM Question__c';
            if(paperSet != null)
                query += ' WHERE Set__c = \'' + paperSet + '\'';
            if(sequence)
                query += ' ORDER BY CreatedDate ASC';
            query += ' LIMIT 60';
            List<Question__c> queriedQuestions = Database.query(query);
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