import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { JwtHelper } from './jwt.helper';
import { KeycloakOptionsToken, KeycloakOptions, KeycloakErrors } from './keycloak.options';
import 'rxjs/add/observable/of';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/share';
import { KeycloakStorageService } from './keycloak-storage.service';
import { KeycloakHttpService } from './keycloak-http.service';

const localStorageOptions = {
  accessTokenKey: 'access_token',
  refreshTokenKey: 'refresh_token',
};

@Injectable()
export class KeycloakService {
  auth$: ReplaySubject<any> = new ReplaySubject(1);
  refreshTokenShared$ = this.refreshToken().share();

  constructor(
    @Inject(KeycloakOptionsToken) private options: KeycloakOptions,
    private storageService: KeycloakStorageService,
    private httpService: KeycloakHttpService
  ) { }

  login(username: string, password: string) {
    const body = `username=${username}&password=${password}&grant_type=password&client_id=${this.options.clientId}`;

    return this.httpService.sendTokenRequest(body)
      .do(result => {
        this.updateTokens(result['access_token'], result['refresh_token']);
      });
  }

  logout() {
    this.clear();
  }

  getAccessToken(forceRefresh: boolean = false) {
    return Observable.of(null)
      .map(() => this.storageService.accessToken)
      .mergeMap(token => {
        const isExpired = token && JwtHelper.isTokenExpired(token, 2 * 60);

        if (isExpired || forceRefresh) {
          return this.refreshTokenShared$
            .do(token => this.auth$.next(JwtHelper.decode(token)));
        } else {
          return Observable.of(token);
        }
      });
  }

  private refreshToken() {
    return Observable.of(null)
      .map(() => this.storageService.refreshToken)
      .mergeMap(token => {
        const isExpired = !token || (token && (JwtHelper.isTokenExpired(token, 2 * 60)));
        const body = `refresh_token=${token}&grant_type=refresh_token&client_id=${this.options.clientId}`;
        return isExpired ? Observable.throw(KeycloakErrors.RefreshTokenExpired) : this.httpService.sendTokenRequest(body);
      })
      .catch(err => {
        if (err.error && err.error === "invalid_grant") {
          return Observable.throw(KeycloakErrors.RefreshTokenInvalid);
        }

        return Observable.throw(err);
      })
      .do(result => {
        this.storageService.accessToken = result['access_token'];
        this.storageService.refreshToken = result['refresh_token'];
      })
      .map(result => result['access_token']);
  }

  private updateTokens(accessToken: string, refreshToken: string) {
    this.storageService.accessToken = accessToken;
    this.storageService.refreshToken = refreshToken;
    this.auth$.next(accessToken ? JwtHelper.decode(accessToken) : null);
  }

  protected clear() {
    this.updateTokens(null, null);
  }
}