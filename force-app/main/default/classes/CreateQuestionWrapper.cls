global with sharing class CreateQuestionWrapper {
    
    public String uuid;
    public String text;
    public String type;
    public String exam;
    public String questionSet;
    public List<OptionWrapper> options = new List<OptionWrapper>();

    global class OptionWrapper {
        public String text;
        public boolean correct;
    }
}