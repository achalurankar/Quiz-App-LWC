@isTest
public class Quiz_CC_Test {

    @TestSetup
    static void createData(){
        Question__c question = new Question__c(Text__c = 'SomeQuestion', Type__c = 'Single', Set__c = '1');
        insert question;
        Option__c option = new Option__c();
        option.Question__c = question.Id; 
        insert option;
    }

    @isTest
    static void test_getQuestions() {
        Test.startTest();
        List<QuestionResponseWrapper> questions = Quiz_CC.getQuestions(new Map<String, String> 
        {  
           'paperSet' => '1',
           'sequence' => 'true'
        });
        Test.stopTest();
    }
    
    @isTest
    static void test_getQuestions_without_sequence() {
        Test.startTest();
        List<QuestionResponseWrapper> questions = Quiz_CC.getQuestions(new Map<String, String> 
        {  
           'paperSet' => '1'
        });
        Test.stopTest();
    }

    @isTest
    static void test_getQuestions_exception() {
        Test.startTest();
        boolean exceptionThrown = false;
        try {
            List<QuestionResponseWrapper> questions = Quiz_CC.getQuestions(null);
        } catch(Exception e) {
            exceptionThrown = true;
        }
        Test.stopTest();
        System.assert(exceptionThrown, 'failed to throw exception');
    }
}
