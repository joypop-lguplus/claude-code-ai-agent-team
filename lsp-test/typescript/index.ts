/** User 인터페이스 — hover 테스트 대상 */
interface User {
  id: number;
  name: string;
  email: string;
}

/** greet 함수 — goToDefinition 테스트 대상 */
function greet(user: User): string {
  return `Hello, ${user.name}!`;
}

/** createUser 함수 — documentSymbol 테스트 대상 */
function createUser(id: number, name: string, email: string): User {
  return { id, name, email };
}

const alice: User = createUser(1, 'Alice', 'alice@example.com');
const message: string = greet(alice);
