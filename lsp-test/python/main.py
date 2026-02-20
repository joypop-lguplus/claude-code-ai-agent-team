"""LSP 테스트 — pyright hover / goToDefinition / documentSymbol."""

from dataclasses import dataclass


@dataclass
class User:
    """User 데이터클래스 — hover 테스트 대상."""

    id: int
    name: str
    email: str


def greet(user: User) -> str:
    """greet 함수 — goToDefinition 테스트 대상."""
    return f"Hello, {user.name}!"


def create_user(uid: int, name: str, email: str) -> User:
    """create_user 함수 — documentSymbol 테스트 대상."""
    return User(id=uid, name=name, email=email)


alice: User = create_user(1, "Alice", "alice@example.com")
message: str = greet(alice)
