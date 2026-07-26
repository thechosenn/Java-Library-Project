import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

// This is where app-wide services get "plugged in". provideHttpClient()
// is what makes HttpClient injectable in BookService/AuthorService -
// without this line, injecting HttpClient would throw a runtime error.
export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideHttpClient()]
};
