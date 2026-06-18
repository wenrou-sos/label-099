import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { create, NButton, NInput, NCard, NMessageProvider, NDialogProvider, NNotificationProvider, NLoadingBarProvider, NConfigProvider, NIcon, NImage, NAvatar, NTag, NBadge, NDropdown, NMenu, NTabs, NTabPane, NForm, NFormItem, NSelect, NCheckbox, NRadio, NRadioGroup, NSwitch, NDatePicker, NUpload, NModal, NDrawer, NDrawerContent, NEmpty, NSpin, NPagination, NList, NListItem, NSpace, NGrid, NGridItem, NDivider, NPopover, NTooltip, NProgress, NRate, NResult, NCountdown, NStatistic, NTimeline, NTimelineItem, NSteps, NStep, NAlert, NAnchor, NAnchorLink } from 'naive-ui'
import './style.css'
import App from './App.vue'
import router from './router'

const naive = create({
  components: [
    NButton, NInput, NCard, NMessageProvider, NDialogProvider, NNotificationProvider,
    NLoadingBarProvider, NConfigProvider, NIcon, NImage, NAvatar, NTag, NBadge,
    NDropdown, NMenu, NTabs, NTabPane, NForm, NFormItem, NSelect, NCheckbox,
    NRadio, NRadioGroup, NSwitch, NDatePicker, NUpload, NModal, NDrawer, NDrawerContent,
    NEmpty, NSpin, NPagination, NList, NListItem, NSpace, NGrid, NGridItem, NDivider,
    NPopover, NTooltip, NProgress, NRate, NResult, NCountdown, NStatistic,
    NTimeline, NTimelineItem, NSteps, NStep, NAlert, NAnchor, NAnchorLink,
  ],
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(naive)

app.mount('#app')
