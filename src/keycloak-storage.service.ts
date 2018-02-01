import { Injectable } from "@angular/core";

const localStorageOptions = {
    accessTokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
  };

@Injectable()
export class KeycloakStorageService {
    get refreshToken() {
        return localStorage.getItem(localStorageOptions.refreshTokenKey);
    }

    set refreshToken(value: string) {
        if (value) {
            localStorage.setItem(localStorageOptions.refreshTokenKey, value);
        } else {
            localStorage.removeItem(localStorageOptions.refreshTokenKey);
        }
    }

    get accessToken() {
        return localStorage.getItem(localStorageOptions.accessTokenKey);
    }

    set accessToken(value: string) {
        if (value) {
            localStorage.setItem(localStorageOptions.accessTokenKey, value);
        } else {
            localStorage.removeItem(localStorageOptions.accessTokenKey);
        }
    }
}