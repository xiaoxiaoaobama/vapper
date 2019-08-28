describe('My First Test', function () {
  it('Does not do much!', function () {
    cy.visit('http://0.0.0.0:4000')

    cy.get('.hello').should('have.length', 1)
  })
})
