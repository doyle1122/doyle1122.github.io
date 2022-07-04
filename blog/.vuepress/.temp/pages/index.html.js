export const data = JSON.parse("{\"key\":\"v-8daa1a0e\",\"path\":\"/\",\"title\":\"Blog Home\",\"lang\":\"en-US\",\"frontmatter\":{\"home\":true,\"layout\":\"Blog\",\"icon\":\"home\",\"title\":\"Blog Home\",\"heroImage\":\"/logo.svg\",\"heroText\":\"the name of your blog\",\"tagline\":\"You can put your slogan here\",\"heroFullScreen\":true,\"projects\":[{\"icon\":\"project\",\"name\":\"project name\",\"desc\":\"project detailed description\",\"link\":\"https://your.project.link\"}],\"footer\":\"customize your footer text\",\"summary\":\"\",\"head\":[[\"meta\",{\"property\":\"og:url\",\"content\":\"https://vuepress-theme-hope-v2-demo.mrhope.site/\"}],[\"meta\",{\"property\":\"og:site_name\",\"content\":\"Theme Demo\"}],[\"meta\",{\"property\":\"og:title\",\"content\":\"Blog Home\"}],[\"meta\",{\"property\":\"og:type\",\"content\":\"website\"}],[\"meta\",{\"property\":\"og:locale\",\"content\":\"en-US\"}]]},\"excerpt\":\"\",\"headers\":[],\"readingTime\":{\"minutes\":0,\"words\":0},\"filePathRelative\":\"README.md\"}")

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept()
  if (__VUE_HMR_RUNTIME__.updatePageData) {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  }
}

if (import.meta.hot) {
  import.meta.hot.accept(({ data }) => {
    __VUE_HMR_RUNTIME__.updatePageData(data)
  })
}
