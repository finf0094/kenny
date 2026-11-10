import { ApplicationConfig, mergeApplicationConfig } from '@angular/core';
import { provideServerRendering, RenderMode, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';

/** Every route is static: the whole site is prerendered at build time. */
const serverConfig: ApplicationConfig = {
  providers: [provideServerRendering(withRoutes([{ path: '**', renderMode: RenderMode.Prerender }]))],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
