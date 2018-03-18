import { Injectable } from "@angular/core";
import { HttpClient, HttpRequest } from "@angular/common/http";
import 'rxjs/add/operator/toPromise';

export interface RequestConfig {
  url: string;
  method?: "DELETE" | "GET" | "HEAD" | "JSONP" | "OPTIONS";
  headers?: any;
  reportProgress?: boolean;
  params?: any;
  responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
  withCredentials?: boolean;
  withPreloader?: boolean;
  isNeedSuccess?: boolean;
}

@Injectable()
export class HttpProvider {
  constructor(public http: HttpClient) {}

  configureRequest({ method= 'GET', url, responseType= 'json' }: RequestConfig) {
    let httpRequest = new HttpRequest(method, url, { responseType });

    return () => this.http.request(httpRequest).toPromise();
  }
}