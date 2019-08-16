<% for (const enhanceObj of enhanceFiles) { %>
import <%- enhanceObj.clientModuleName %> from '<%- type === "client" ? enhanceObj.client : enhanceObj.server %>'
<% } %>

export default function (options) {
  <% for (const enhanceObj of enhanceFiles) { %>
  <%- enhanceObj.clientModuleName %>(options)
  <% } %>
}