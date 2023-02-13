import java.util.Scanner;  // Import the Scanner class
import java.io.*;
public class printer {

    public static void main(String[] args) throws Exception{
        Scanner userInput = new Scanner(System.in);  // Create a Scanner object
        File dataFile = new File("Admin Set 2(Ans Key).txt");
        Scanner dataScanner = new Scanner(dataFile);
        while(dataScanner.hasNextLine()) {
            System.out.println(dataScanner.nextLine());
            userInput.nextLine();
        }
        dataScanner.close();
        userInput.close();
    }
}