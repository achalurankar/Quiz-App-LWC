public class ExamWrapper {
    
    @AuraEnabled public String label;
    @AuraEnabled public String value;
    @AuraEnabled public List<SetWrapper> sets = new List<SetWrapper>();

    public ExamWrapper(String exam, Set<String> sets) {
        this.label = exam;
        this.value = exam;
        for(String setVal : sets) {
            this.sets.add(new SetWrapper(setVal));
        }
    }

    public class SetWrapper {
        @AuraEnabled public String label;
        @AuraEnabled public String value;

        public SetWrapper(String setVal) {
            this.label = 'Set ' + setVal;
            this.value = setVal;
        }
    }
}