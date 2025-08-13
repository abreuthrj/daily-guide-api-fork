import { LoggerInterceptor } from '#/interceptors/logger.interceptor';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getLogStr, omitSensitiveData } from './logger';

export class HttpUtil {
  private httpHandler: AxiosInstance;
  interceptors: typeof axios.interceptors;

  // constructor(
  //   @InjectPinoLogger(HttpUtil.name)
  //   private readonly pinoLogger: PinoLogger,
  // ) {}

  setup(baseURL?: string, config?: AxiosRequestConfig) {
    this.httpHandler = axios.create({
      baseURL,
      ...config,
    });

    this.interceptors = this.httpHandler.interceptors;

    // this.httpHandler.interceptors.request.use((request) => {
    //   console.log('[OUTGOING REQUEST]', {
    //     url: `${request.baseURL}${request.url}`,
    //     method: request.method.toUpperCase(),
    //     body: request.data,
    //     params: request.params,
    //   });

    //   return request;
    // });

    this.httpHandler.interceptors.response.use((response) => {
      const log = omitSensitiveData(LoggerInterceptor.BLACKLIST_FIELDS, {
        request: {
          url: response.config.url,
          method: response.config.method,
          body: response.config.data,
          params: response.config.params,
        },
        response: {
          statusCode: response.status,
          body: JSON.stringify(response.data),
        },
      });

      console.log('[THIRD-PARTY REQUEST]', getLogStr(log));

      return response;
    });
  }

  async get<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return await this.httpHandler.get<T, R>(url, config);
  }

  async delete<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return await this.httpHandler.delete<T, R>(url, config);
  }

  async post<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return await this.httpHandler.post<T, R>(url, data, config);
  }

  async put<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return await this.httpHandler.put<T, R>(url, data, config);
  }

  async patch<T = any, R = AxiosResponse<T>, D = any>(
    url: string,
    data?: D,
    config?: AxiosRequestConfig<D>,
  ): Promise<R> {
    return await this.httpHandler.patch<T, R>(url, data, config);
  }
}
