import { NgModule, APP_INITIALIZER, ModuleWithProviders, InjectionToken } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpInterceptor } from '@angular/common/http';
import { KeycloakInterceptor } from './keycloak.interceptor';
import { KeycloakService } from './keycloak.service';
import { KeycloakOptionsToken, KeycloakOptions } from './keycloak.options';
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";
import { KeycloakStorageService } from './keycloak-storage.service';
import { KeycloakHttpService } from './keycloak-http.service';

export function initKeycloak(keycloakService: KeycloakService) {
  console.log("module loaded");
  return () => keycloakService.getAccessToken(true).toPromise();
}

@NgModule({
  providers: [
    KeycloakStorageService,
    KeycloakHttpService,
    KeycloakService
  ]
})
export class KeycloakModule {
  static forRoot(config?: KeycloakOptions) {
    return {
      ngModule: KeycloakModule,
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          useClass: KeycloakInterceptor,
          multi: true
        },
        {
          provide: APP_INITIALIZER,
          deps: [KeycloakService],
          useFactory: initKeycloak,
          multi: true
        },
        { provide: KeycloakOptionsToken, useValue: config }
      ]
    };
  }
}
