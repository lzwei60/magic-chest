import App from './App'

import { createSSRApp } from 'vue'
import { createShareMixin } from './utils/share'

export function createApp() {
  const app = createSSRApp(App)
  app.mixin(createShareMixin())
  return {
    app
  }
}
