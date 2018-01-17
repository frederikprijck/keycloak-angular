import { Injectable, InjectionToken } from '@angular/core';

export const KeycloakOptionsToken: InjectionToken<KeycloakOptions> = new InjectionToken('KeycloakOptionsToken');

@Injectable()
export class KeycloakOptions {
  url: string;
  realm: string;
  clientId: string;
  localstoragePrefix?: string;
}
