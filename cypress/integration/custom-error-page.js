describe('Custom error page', function () {
  it('The error occurred in the component', function () {
    cy.visit('http://0.0.0.0:4000')

    cy.get('h1').should('have.length', 1)
    cy.get('h1').should('contain', 'error')
  })

  it('The error occurred in the routing guard', function () {
    cy.visit('http://0.0.0.0:4000/bar')

    cy.get('h1').should('have.length', 1)
    cy.get('h1').should('contain', 'error in the routing guard')
  })
})
