describe("Login Flow", () => {
  beforeEach(() => {
    cy.visit("/login")
  })

  it("should display login form", () => {
    cy.get('input[placeholder="Email"]').should("be.visible")
    cy.get('input[placeholder="Password"]').should("be.visible")
    cy.contains("button", "Sign In").should("be.visible")
  })

  it("should show validation errors for empty fields", () => {
    cy.contains("button", "Sign In").click()
    cy.contains("Please input your email").should("be.visible")
    cy.contains("Please input your password").should("be.visible")
  })

  it("should login successfully with valid credentials", () => {
    cy.get('input[placeholder="Email"]').type("admin@astu.edu.et")
    cy.get('input[placeholder="Password"]').type("Admin@2025")
    cy.contains("button", "Sign In").click()

    // Should redirect to dashboard
    cy.url().should("not.include", "/login")
    cy.contains("Dashboard").should("be.visible")
  })

  it("should show error for invalid credentials", () => {
    cy.get('input[placeholder="Email"]').type("wrong@example.com")
    cy.get('input[placeholder="Password"]').type("wrongpassword")
    cy.contains("button", "Sign In").click()

    cy.contains("Login Failed").should("be.visible")
  })
})
