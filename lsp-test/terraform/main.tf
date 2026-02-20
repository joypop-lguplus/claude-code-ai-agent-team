# LSP 테스트 — terraform-ls hover / goToDefinition / documentSymbol.

variable "instance_name" {
  description = "인스턴스 이름 — hover 테스트 대상"
  type        = string
  default     = "lsp-test"
}

variable "instance_type" {
  description = "인스턴스 타입"
  type        = string
  default     = "t3.micro"
}

# resource 블록 — documentSymbol 테스트 대상
resource "aws_instance" "example" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = var.instance_type

  tags = {
    Name = var.instance_name
  }
}

# output 블록 — goToDefinition 테스트 대상
output "instance_id" {
  value = aws_instance.example.id
}
