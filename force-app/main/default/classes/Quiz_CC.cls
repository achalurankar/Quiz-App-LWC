public with sharing class Quiz_CC {

    @AuraEnabled
    public static List<QuestionResponseWrapper> getQuestions(Map<String, String> kvData){
        try {
            if(kvData == null) {
                throw new InvalidDataException('failed to provide parameters');
            }
            if(!kvData.containsKey('sequence')) {
                kvData.put('sequence', 'false');
            }
            String paperSet = kvData.get('paperSet');
            Boolean sequence = Boolean.valueOf(kvData.get('sequence'));
            String exam = kvData.get('exam');
        
            String query = 'SELECT Id, Text__c, Type__c, (SELECT Id, Text__c, Correct__c FROM Options__r) FROM Question__c';
            if(paperSet != null)
                query += ' WHERE Set__c = :paperSet';
            if(exam != null)
                query += ' AND Exam__c = :exam';
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

    
    @AuraEnabled
    public static List<ExamWrapper> getSetsAndExams() {
        Map<String, Set<String>> examVsSetsMap = new Map<String, Set<String>>();
        List<Question__c> questions = [SELECT Id, Exam__c, Set__c FROM Question__c];
        for(Question__c question : questions) {
            if(examVsSetsMap.containsKey(question.Exam__c)) {
                examVsSetsMap.get(question.Exam__c).add(question.Set__c);
            } else {
                examVsSetsMap.put(question.Exam__c, new Set<String> { question.Set__c });
            }
        }
        List<ExamWrapper> exams = new List<ExamWrapper>(); 
        for(String exam : examVsSetsMap.keySet()) {
            exams.add(new ExamWrapper(
                exam,
                examVsSetsMap.get(exam)
            ));
        }
        return exams;
    }
    
    public class InvalidDataException extends Exception {}
}