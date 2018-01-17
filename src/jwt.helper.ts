import jwtDecode from 'jwt-decode';

export class JwtHelper {
 static getExpirationDate(token: any) {
   const date = new Date(0);
   date.setUTCSeconds(token.exp);
   return date;
 }

 static decode(token: string) {
   return jwtDecode(token);
 }

 static isTokenExpired(token: string, offset: number = 0) {
   const decodedToken = this.decode(token);
   const date = this.getExpirationDate(decodedToken);
   
   return !(date.valueOf() > (new Date().valueOf() + (offset * 1000)));
 }
}