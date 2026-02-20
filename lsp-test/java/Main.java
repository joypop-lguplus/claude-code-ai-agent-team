/** LSP 테스트 — jdtls hover / goToDefinition / documentSymbol. */
public class Main {

    /** User 레코드 — hover 테스트 대상 */
    record User(int id, String name, String email) {}

    /** greet 메서드 — goToDefinition 테스트 대상 */
    static String greet(User user) {
        return "Hello, " + user.name() + "!";
    }

    /** createUser 메서드 — documentSymbol 테스트 대상 */
    static User createUser(int id, String name, String email) {
        return new User(id, name, email);
    }

    public static void main(String[] args) {
        User alice = createUser(1, "Alice", "alice@example.com");
        String message = greet(alice);
        System.out.println(message);
    }
}
