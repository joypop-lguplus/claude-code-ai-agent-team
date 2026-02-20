package main

import "fmt"

// User 구조체 — hover 테스트 대상
type User struct {
	ID    int
	Name  string
	Email string
}

// Greet 함수 — goToDefinition 테스트 대상
func Greet(u User) string {
	return fmt.Sprintf("Hello, %s!", u.Name)
}

// CreateUser 함수 — documentSymbol 테스트 대상
func CreateUser(id int, name, email string) User {
	return User{ID: id, Name: name, Email: email}
}

func main() {
	alice := CreateUser(1, "Alice", "alice@example.com")
	msg := Greet(alice)
	fmt.Println(msg)
}
