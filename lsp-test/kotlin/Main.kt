/** LSP 테스트 — kotlin-lsp hover / goToDefinition / documentSymbol. */

/** User 데이터 클래스 — hover 테스트 대상 */
data class User(val id: Int, val name: String, val email: String)

/** greet 함수 — goToDefinition 테스트 대상 */
fun greet(user: User): String {
    return "Hello, ${user.name}!"
}

/** createUser 함수 — documentSymbol 테스트 대상 */
fun createUser(id: Int, name: String, email: String): User {
    return User(id, name, email)
}

fun main() {
    val alice = createUser(1, "Alice", "alice@example.com")
    val message = greet(alice)
    println(message)
}
