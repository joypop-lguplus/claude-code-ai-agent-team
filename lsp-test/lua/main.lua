--- LSP 테스트 — lua-language-server hover / goToDefinition / documentSymbol.

--- User 테이블 생성 — hover 테스트 대상
---@param id integer
---@param name string
---@param email string
---@return table
local function create_user(id, name, email)
    return { id = id, name = name, email = email }
end

--- greet 함수 — goToDefinition 테스트 대상
---@param user table
---@return string
local function greet(user)
    return "Hello, " .. user.name .. "!"
end

local alice = create_user(1, "Alice", "alice@example.com")
local message = greet(alice)
print(message)
