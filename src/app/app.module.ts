import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { LayoutModule } from '@angular/cdk/layout';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

// Material Modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatBadgeModule } from '@angular/material/badge';

import { AppComponent } from './app.component';
import { NavbarComponent } from './core/components/navbar/navbar.component';
import { routes } from './app.routes';
import { credentialsInterceptor } from './core/interceptors/credentials.interceptor';
import { unauthorizedInterceptor } from './core/interceptors/unauthorized.interceptor';
import { agentInterceptor } from './core/interceptors/agent.interceptor';
import { NotificationContainerComponent } from './core/services/notifications/notification-container.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    NotificationContainerComponent
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(routes),
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatTooltipModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatBadgeModule

  ],
  providers: [
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([
        credentialsInterceptor, 
        agentInterceptor,
        unauthorizedInterceptor
        
      ])
    )
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }