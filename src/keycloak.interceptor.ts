import { Injectable } from '@angular/core';
import { KeycloakService } from './keycloak.service';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/mergeMap';

@Injectable()
export class KeycloakInterceptor implements HttpInterceptor {

  constructor(public keycloakService: KeycloakService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return this.keycloakService
      .getAccessToken()
      .mergeMap(token => next.handle(token ? request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      }) : request)
    );
  }
}
