global with sharing class CreateQuestionWrapper {
    
    public String text;
    public String type;
    public String questionSet;
    public List<OptionWrapper> options = new List<OptionWrapper>();

    public class OptionWrapper {
        public String text;
        public boolean correct;
    }
}
