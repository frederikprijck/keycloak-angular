import { NgModule, APP_INITIALIZER, ModuleWithProviders, InjectionToken } from '@angular/core';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { KeycloakInterceptor } from './keycloak.interceptor';
import { KeycloakService } from './keycloak.service';
import { KeycloakOptionsToken, KeycloakOptions } from './keycloak.options';
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/catch";

@NgModule({
  providers: [
    KeycloakService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: KeycloakInterceptor,
      multi: true
    },
    {
      provide: APP_INITIALIZER,
      deps: [KeycloakService],
      useFactory: (keycloakService: KeycloakService) => () => {
        keycloakService.getToken(true)
            .catch(error => Observable.of(null))
            .toPromise()
            .then(x => console.info('success', x), x => console.info('error', x));

        return keycloakService.getToken(true)
            .catch(error => Observable.of(null))
            .toPromise();
      },
      multi: true
    }
  ]
})
export class KeycloakModule {
  static withConfig(config: KeycloakOptions) {
    return {
      ngModule: KeycloakModule,
      providers: [
        { provide: KeycloakOptionsToken, useValue: config }
      ]
    };
  }
}
