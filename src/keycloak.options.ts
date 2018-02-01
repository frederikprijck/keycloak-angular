import { Injectable, InjectionToken } from '@angular/core';

export const KeycloakOptionsToken = new InjectionToken('KeycloakOptionsToken');

@Injectable()
export class KeycloakOptions {
  url: string;
  realm: string;
  clientId: string;
  localstoragePrefix?: string;
}

export enum KeycloakErrors {
  Unauthorized,
  RefreshTokenExpired,
  RefreshTokenInvalid
}
