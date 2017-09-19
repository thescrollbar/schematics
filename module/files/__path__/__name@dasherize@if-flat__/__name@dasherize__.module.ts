import { NgModule } from '@angular/core';<% if (commonModule) { %>
import { CommonModule } from '@angular/common';<% } %><% if (routing) { %>

import { <%= classify(name) %>RoutingModule } from './<%= dasherize(name) %>-routing.module';<% } %>

const DIRECTIVES = [

];

const MODULES = [
  <% if (commonModule) { %>
    CommonModule<%= routing ? ',' : '' %><% } %><% if (routing) { %>
    <%= classify(name) %>RoutingModule<% } %>
];

const PROVIDERS = [

];

@NgModule({
  declarations: [
    DIRECTIVES
  ],
  providers: [
    PROVIDERS
  ],
  imports: [
    MODULES
  ],
  exports: [
    DIRECTIVES, MODULES
  ],
})
export class <%= classify(name) %>Module { }
