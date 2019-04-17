import request, { CookieJar } from "request"
import { Cookie } from "request-cookies"
import { Session } from "..";

export class CreeperState {

    private jar: CookieJar = request.jar();

    public setCookie(response, session?: Session) {

        const cookies = response.headers['set-cookie'];

        console.log(` [ Set ${cookies ? cookies.length : 0} cookies ]`)

        for (var i in cookies) {
            var cookie = new Cookie(cookies[i]);

            const key = cookie.key.trim()

            const domain: string = session ? session.getDomain(key) : null;

            const info: Map<string, string> = this.infoCookie(cookies[i])

            const finalDomain = info.get("domain") ?  info.get("domain") : domain;

            if(session && session.logSetCookie) {
                console.log(` LOG: { SetCookie =  ${key}=${info.get(key)} & damain ${finalDomain}}`)
            }

            this.jar.setCookie(request.cookie(`${key}=${info.get(key)}`), finalDomain)
        }
    }

    private infoCookie(cookie): Map<string, string> {
        
        const map: Map<string, string> = new Map() 

        const cookieList = cookie.split(";")

        for(var i in cookieList) {
            
            const cook = cookieList[i].split("=")

            const key = cook[0].trim();

            if(key == 'HttpOnly') {
                map.set(key, 'true');
            } else {
                map.set(key, cook[1]);
            }
        }

        return map;
    }

    public getCookie(): CookieJar {
        return this.jar;
    }
}