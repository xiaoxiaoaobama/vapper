describe('Example', function () {
  it('visit', function () {
    cy.visit('http://0.0.0.0:4000')

    cy.get('.hello').should('have.length', 1)
  })
})
