import {Injectable, Inject} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {KeycloakErrors, KeycloakOptions, KeycloakOptionsToken} from './keycloak.options';

@Injectable()
export class KeycloakHttpService {

  constructor(
      @Inject(KeycloakOptionsToken) private options: KeycloakOptions,
  ) { }

  sendTokenRequest(params: string) {
    return new Observable(observer => {
      const tokenSuffix = `realms/${this.options.realm}/protocol/openid-connect/token`;
      const tokenEndpoint = `${this.options.url}/${tokenSuffix}`;
      const http = new XMLHttpRequest();

      http.open('POST', tokenEndpoint, true);
      http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
      http.onreadystatechange = () => {
        if (http.readyState === 4 && http.status === 200) {
          observer.next(JSON.parse(http.responseText));
          observer.complete();
        } else if (http.readyState === 4 && http.status === 401) {
          observer.error(KeycloakErrors.Unauthorized);
        } else if (http.readyState === 4 && http.status !== 200) {
          observer.error(this.tryParse(http.responseText));
        }
      };
      http.send(params);
    });
  }

  private tryParse(data) {
    try {
      return JSON.parse(data);
    } catch (e) {
      return data;
    }
  }
}
