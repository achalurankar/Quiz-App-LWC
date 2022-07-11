@isTest
public class Quiz_CC_Test {
    @isTest(seeAllData = true)
    static void test_valid_data() {
        List<Question__c> questions = [SELECT Id, Name, Type__c, (SELECT Id FROM Options__r WHERE Correct__c = true) FROM Question__c];
        List<String> invalidQuestionNames = new List<String>();
        System.debug('questions size ' + questions.size());
        if(questions.size() > 0) {
            for(Question__c question : questions) {
                String type = question.Type__c;
                System.assert(type != null, 'Invalid type for question ' + question.Name);
                Integer expectedCount = 0;
                if(type == 'Single') {
                    expectedCount = 1;
                } else if(type == 'Double') {
                    expectedCount = 2;
                } else if(type == 'Triple') {
                    expectedCount = 3;
                }
                if(question.Options__r.size() != expectedCount) {
                    invalidQuestionNames.add(question.Name);
                }
            }
            System.assert(invalidQuestionNames.size() == 0, 'invalid questions - ' + invalidQuestionNames);
        }
    }
}
