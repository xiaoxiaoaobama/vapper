<% for (const enhanceObj of enhanceFiles) { %>
import <%- enhanceObj.clientModuleName %> from '<%- enhanceObj.client %>'
<% } %>

export default function (app) {
  <% for (const enhanceObj of enhanceFiles) { %>
  <%- enhanceObj.clientModuleName %>(app)
  <% } %>
}