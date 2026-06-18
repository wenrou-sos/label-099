import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { darkTheme, lightTheme } from 'naive-ui'
import type { GlobalThemeOverrides } from 'naive-ui'
import { getUnreadCount } from '@/api/notification'

const primaryColor = '#FF6B8A'
const primaryHoverColor = '#FF8FA5'
const primaryPressedColor = '#E85D7A'

export const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: primaryColor,
    primaryColorHover: primaryHoverColor,
    primaryColorPressed: primaryPressedColor,
    primaryColorSuppl: primaryColor,
    infoColor: primaryColor,
    infoColorHover: primaryHoverColor,
    infoColorPressed: primaryPressedColor,
    infoColorSuppl: primaryColor,
  },
  Button: {
    colorPrimary: primaryColor,
    colorHoverPrimary: primaryHoverColor,
    colorPressedPrimary: primaryPressedColor,
    colorFocusPrimary: primaryColor,
    colorDisabledPrimary: '#FFB8C4',
    borderPrimary: primaryColor,
    borderHoverPrimary: primaryHoverColor,
    borderPressedPrimary: primaryPressedColor,
    borderFocusPrimary: primaryColor,
  },
  Input: {
    borderFocus: primaryColor,
    boxShadowFocus: `0 0 0 2px rgba(255, 107, 138, 0.2)`,
    caretColor: primaryColor,
  },
  Checkbox: {
    colorChecked: primaryColor,
    boxShadowFocus: `0 0 0 2px rgba(255, 107, 138, 0.2)`,
  },
  Radio: {
    buttonColorActive: primaryColor,
    buttonBorderColorActive: primaryColor,
    dotColorActive: primaryColor,
    boxShadowFocus: `0 0 0 2px rgba(255, 107, 138, 0.2)`,
  },
  Switch: {
    railColorActive: primaryColor,
  },
  Tag: {
    borderInfo: primaryColor,
    colorInfo: 'rgba(255, 107, 138, 0.1)',
    textColorInfo: primaryColor,
  },
  Tabs: {
    barColor: primaryColor,
    tabTextColorActiveLine: primaryColor,
    tabTextColorHoverLine: primaryHoverColor,
  },
  DatePicker: {
    itemColorActive: primaryColor,
    itemColorHover: primaryHoverColor,
  },
}

type ThemeMode = 'light' | 'dark'

export const useAppStore = defineStore('app', () => {
  const unreadCount = ref(0)
  const globalLoading = ref(false)
  const themeMode = ref<ThemeMode>((localStorage.getItem('themeMode') as ThemeMode) || 'light')

  const theme = computed(() => (themeMode.value === 'dark' ? darkTheme : lightTheme))

  function toggleTheme() {
    themeMode.value = themeMode.value === 'light' ? 'dark' : 'light'
    localStorage.setItem('themeMode', themeMode.value)
  }

  function setTheme(mode: ThemeMode) {
    themeMode.value = mode
    localStorage.setItem('themeMode', themeMode.value)
  }

  function setGlobalLoading(val: boolean) {
    globalLoading.value = val
  }

  async function fetchUnreadCount() {
    try {
      const res = await getUnreadCount()
      unreadCount.value = res.count
    } catch {
      unreadCount.value = 0
    }
  }

  return {
    unreadCount,
    globalLoading,
    themeMode,
    theme,
    themeOverrides,
    toggleTheme,
    setTheme,
    setGlobalLoading,
    fetchUnreadCount,
  }
})
