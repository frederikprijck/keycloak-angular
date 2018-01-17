import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { JwtHelper } from './jwt.helper';
import { KeycloakOptionsToken, KeycloakOptions } from './keycloak.options';
import 'rxjs/add/observable/of';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

const localStorageOptions = {
  accessTokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
};

@Injectable()
export class KeycloakService {
  auth$: Subject<any> = new ReplaySubject(1);

  constructor(
    @Inject(KeycloakOptionsToken) private options: KeycloakOptions
  ) { }

  login(username: string, password: string) {
    const body = `username=${username}&password=${password}&grant_type=password&client_id=${this.options.clientId}`;

    return this.sendTokenRequest(body)
      .do(result => {
        this.updateTokens(result['access_token'], result['refresh_token']);
      });
  }

  logout() {
    this.clear();
  }

  getToken(forceRefresh: boolean = false) {
    const accessToken = this.getFromLocalStorage(localStorageOptions.accessTokenKey);

    return Observable
      .of(accessToken)
      .mergeMap(token => {
        const isExpired = token && JwtHelper.isTokenExpired(token, 2 * 60);
        return (isExpired || forceRefresh) ? this.refreshToken() : Observable.of(token);
      }).do((token: string) => {
        if (token) {
          this.auth$.next(JwtHelper.decode(token));
        }
      })
      .catch(error => {
        if (error === 'refreshToken_expired') {
          this.clear();
          return Observable.of(null);
        }

        return Observable.throw(error);
      });
  }

  private refreshToken() {
    const refreshToken = localStorage.getItem('refresh_token');
    const body = `refresh_token=${refreshToken}&grant_type=refresh_token&client_id=${this.options.clientId}`;

    return Observable.of(refreshToken)
      .mergeMap(token => {
        const isExpired = !token || (token && JwtHelper.isTokenExpired(token, 2 * 60));
        return isExpired ? Observable.throw('refreshToken_expired') : this.sendTokenRequest(body);
      })
      .do(result => {
        this.addToLocalStorage(localStorageOptions.accessTokenKey, result['access_token']);
        this.addToLocalStorage(localStorageOptions.refreshTokenKey, result['refresh_token']);
      })
      .map(result => result['access_token']);
  }

  private sendTokenRequest(params: string) {
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
        } else {
          // ...
          observer.error('error');
        }
      };
      http.send(params);
    });
  }

  private updateTokens(accessToken: string, refreshToken: string) {
    this.addToLocalStorage(localStorageOptions.accessTokenKey, accessToken);
    this.addToLocalStorage(localStorageOptions.refreshTokenKey, refreshToken);
    this.auth$.next(JwtHelper.decode(accessToken));
  }

  private clear() {
    this.removeFromLocalStorage(localStorageOptions.accessTokenKey);
    this.removeFromLocalStorage(localStorageOptions.refreshTokenKey);

    this.auth$.next(null);
  }

  private addToLocalStorage(key: string, value: string) {
    localStorage.setItem(`${this.options.localstoragePrefix || ''}${key}`, value);
  }

  private removeFromLocalStorage(key: string) {
    localStorage.removeItem(`${this.options.localstoragePrefix || ''}${key}`);
  }

  private getFromLocalStorage(key: string) {
    return localStorage.getItem(`${this.options.localstoragePrefix || ''}${key}`);
  }
}
